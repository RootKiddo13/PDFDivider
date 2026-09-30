import {
  EncryptedPDFError,
  PDFArray,
  PDFDict,
  PDFDocument,
  PDFName,
  PDFRef,
  PDFStream,
} from 'pdf-lib';
import { zipSync } from 'fflate';
import type { OutputFile, WorkerRequest, WorkerResponse } from './contracts';
import { LIMITS } from './limits';
import { parseSelection } from './selection';

type WorkerScope = {
  onmessage: ((event: MessageEvent<WorkerRequest>) => void) | null;
  postMessage(message: WorkerResponse, transfer?: Transferable[]): void;
};

class WorkerFault extends Error {
  constructor(readonly code: string, message: string) {
    super(message);
    this.name = 'WorkerFault';
  }
}

const workerScope = self as unknown as WorkerScope;
let busy = false;
let sourceDocument: PDFDocument | null = null;
let sourcePageCount = 0;

function sendError(id: number, code: string, message: string): void {
  workerScope.postMessage({ type: 'error', id, code, message });
}

function progress(
  id: number,
  stage: 'loading' | 'extracting' | 'packaging',
  current: number,
  total: number,
): void {
  workerScope.postMessage({ type: 'progress', id, stage, current, total });
}

function safeNameBase(fileName: string): string {
  const lastComponent = fileName.split(/[\\/]/).at(-1) ?? '';
  const extensionIndex = lastComponent.lastIndexOf('.');
  const withoutExtension = extensionIndex > 0 ? lastComponent.slice(0, extensionIndex) : lastComponent;
  const cleaned = withoutExtension
    .replace(/[<>:"/\\|?*\u0000-\u001f\u007f]/g, '_')
    .replace(/[. ]+$/g, '')
    .trim()
    .slice(0, 80)
    .replace(/[. ]+$/g, '');
  return cleaned || 'document';
}

function outputName(baseName: string, index: number): string {
  return `${baseName}-part-${String(index).padStart(3, '0')}.pdf`;
}

function copyToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const backing = bytes.buffer;
  if (backing instanceof ArrayBuffer && bytes.byteOffset === 0 && bytes.byteLength === backing.byteLength) {
    return backing;
  }
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function hasPdfSignature(bytes: Uint8Array): boolean {
  const signature = [0x25, 0x50, 0x44, 0x46, 0x2d]; // %PDF-
  const scanEnd = Math.min(bytes.length, 1024);
  for (let start = 0; start <= scanEnd - signature.length; start += 1) {
    if (signature.every((byte, index) => bytes[start + index] === byte)) return true;
  }
  return false;
}

function hasAcroForm(document: PDFDocument): boolean {
  return document.catalog.AcroForm() !== undefined;
}

function hasSignature(document: PDFDocument): boolean {
  const docMdp = document.catalog.lookupMaybe(PDFName.of('Perms'), PDFDict);
  if (docMdp?.has(PDFName.of('DocMDP'))) return true;

  const acroForm = document.catalog.getAcroForm();
  if (acroForm) {
    for (const [field] of acroForm.getAllFields()) {
      const fieldType = field.getInheritableAttribute(PDFName.of('FT'));
      if (fieldType instanceof PDFName && fieldType.asString() === '/Sig') return true;
    }
  }

  const seen = new WeakSet<object>();
  const visit = (value: unknown): boolean => {
    if (typeof value !== 'object' || value === null || seen.has(value)) return false;
    seen.add(value);

    if (value instanceof PDFRef) {
      return visit(document.context.lookup(value));
    }
    if (value instanceof PDFStream) return visit(value.dict);
    if (value instanceof PDFArray) {
      for (let index = 0; index < value.size(); index += 1) {
        if (visit(value.get(index))) return true;
      }
      return false;
    }
    if (value instanceof PDFDict) {
      const fieldType = value.lookupMaybe(PDFName.of('FT'), PDFName);
      const type = value.lookupMaybe(PDFName.of('Type'), PDFName);
      if (fieldType?.asString() === '/Sig' || type?.asString() === '/Sig') return true;
      for (const key of value.keys()) {
        if (visit(value.get(key))) return true;
      }
    }
    return false;
  };

  for (const [, object] of document.context.enumerateIndirectObjects()) {
    if (visit(object)) return true;
  }
  return false;
}

function assertWithinTime(startedAt: number): void {
  if (Date.now() - startedAt > LIMITS.timeoutMs) {
    throw new WorkerFault('TIMEOUT', 'İşlem geçici süre sınırını aştı. Daha küçük bir seçim deneyin.');
  }
}

function estimateZipBytes(files: OutputFile[]): number {
  const encoder = new TextEncoder();
  // Stored ZIP entries use local and central headers, UTF-8 names, and end records.
  return files.reduce((total, file) => {
    const nameBytes = encoder.encode(file.name).byteLength;
    return total + file.buffer.byteLength + nameBytes * 2 + 128;
  }, 22);
}

async function loadPdf(id: number, file: File): Promise<void> {
  sourceDocument = null;
  sourcePageCount = 0;

  if (file.size === 0) {
    throw new WorkerFault('EMPTY_FILE', 'Seçilen dosya boş. Başka bir PDF seçin.');
  }
  progress(id, 'loading', 0, 1);
  const startedAt = Date.now();
  const raw = await file.arrayBuffer();
  assertWithinTime(startedAt);
  if (raw.byteLength === 0) {
    throw new WorkerFault('EMPTY_FILE', 'Seçilen dosya boş. Başka bir PDF seçin.');
  }
  const bytes = new Uint8Array(raw);
  if (!hasPdfSignature(bytes)) {
    throw new WorkerFault('NOT_PDF', 'Dosya PDF biçiminde görünmüyor. Bir PDF dosyası seçin.');
  }

  let document: PDFDocument;
  try {
    // Encryption is not ignored; password-protected documents are rejected.
    document = await PDFDocument.load(bytes, { updateMetadata: false, throwOnInvalidObject: true });
  } catch (error) {
    if (error instanceof EncryptedPDFError) {
      throw new WorkerFault('ENCRYPTED_PDF', 'Şifreli PDF dosyaları desteklenmiyor.');
    }
    throw new WorkerFault('INVALID_PDF', 'PDF okunamadı. Dosya bozuk veya desteklenmeyen biçimde olabilir.');
  }
  assertWithinTime(startedAt);
  if (document.isEncrypted) {
    throw new WorkerFault('ENCRYPTED_PDF', 'Şifreli PDF dosyaları desteklenmiyor.');
  }

  let pageCount: number;
  try {
    pageCount = document.getPageCount();
  } catch {
    throw new WorkerFault('INVALID_PDF', 'PDF sayfaları okunamadı. Başka bir dosya deneyin.');
  }
  if (!Number.isSafeInteger(pageCount) || pageCount < 1) {
    throw new WorkerFault('INVALID_PDF', 'PDF içinde okunabilir sayfa bulunamadı.');
  }
  if (pageCount > LIMITS.sourcePages) {
    throw new WorkerFault('TOO_MANY_PAGES', `Bu dosya geçici ${LIMITS.sourcePages} sayfa geliştirme sınırını aşıyor.`);
  }

  try {
    if (hasSignature(document)) {
      throw new WorkerFault('SIGNED_PDF', 'Dijital imza içeren PDF dosyaları desteklenmiyor.');
    }
    if (hasAcroForm(document)) {
      throw new WorkerFault('INTERACTIVE_FORM', 'Etkileşimli form içeren PDF dosyaları desteklenmiyor.');
    }
  } catch (error) {
    if (error instanceof WorkerFault) throw error;
    throw new WorkerFault('INVALID_PDF', 'PDF belge özellikleri doğrulanamadı. Başka bir dosya deneyin.');
  }

  sourceDocument = document;
  sourcePageCount = pageCount;
  workerScope.postMessage({ type: 'loaded', id, pages: pageCount });
}

async function extract(id: number, mode: WorkerRequest & { type: 'extract' }, baseName: string): Promise<void> {
  const document = sourceDocument;
  if (!document || sourcePageCount === 0) {
    throw new WorkerFault('NO_SOURCE', 'Önce PDF dosyası yükleyin.');
  }

  const startedAt = Date.now();
  const plan = parseSelection(mode.selection, mode.mode, sourcePageCount);
  const base = safeNameBase(baseName);
  const files: OutputFile[] = [];
  let pdfBytesTotal = 0;

  for (let index = 0; index < plan.groups.length; index += 1) {
    assertWithinTime(startedAt);
    progress(id, 'extracting', index + 1, plan.groups.length);
    const output = await PDFDocument.create({ updateMetadata: false });
    const copiedPages = await output.copyPages(document, plan.groups[index].map((page) => page - 1));
    for (const page of copiedPages) output.addPage(page);
    const saved = await output.save({ addDefaultPage: false });
    assertWithinTime(startedAt);

    const projectedPdfBytes = pdfBytesTotal + saved.byteLength;
    if (saved.byteLength > LIMITS.outputBytes || projectedPdfBytes > LIMITS.outputBytes) {
      throw new WorkerFault('OUTPUT_TOO_LARGE', 'PDF çıktıları geçici boyut sınırını aşıyor. Daha küçük bir seçim deneyin.');
    }
    if (projectedPdfBytes > LIMITS.resultBytes) {
      throw new WorkerFault('RESULT_TOO_LARGE', 'Sonuçlar geçici bellek bütçesini aşıyor. Daha küçük bir seçim deneyin.');
    }
    const fileBuffer = copyToArrayBuffer(saved);
    pdfBytesTotal = projectedPdfBytes;

    files.push({
      name: outputName(base, index + 1),
      buffer: fileBuffer,
      pages: plan.groups[index],
    });
  }

  let zip: { name: string; buffer: ArrayBuffer } | null = null;
  if (files.length > 1) {
    progress(id, 'packaging', 0, 1);
    assertWithinTime(startedAt);
    const zipEstimate = estimateZipBytes(files);
    if (zipEstimate > LIMITS.zipBytes || pdfBytesTotal + zipEstimate > LIMITS.resultBytes) {
      throw new WorkerFault('RESULT_TOO_LARGE', 'PDF ve ZIP sonuçları birlikte geçici bellek bütçesini aşıyor. Daha küçük bir seçim deneyin.');
    }

    const entries: Record<string, Uint8Array> = {};
    for (const file of files) entries[file.name] = new Uint8Array(file.buffer);
    const zipBytes = zipSync(entries, { level: 0 });
    assertWithinTime(startedAt);
    if (zipBytes.byteLength > LIMITS.zipBytes || pdfBytesTotal + zipBytes.byteLength > LIMITS.resultBytes) {
      throw new WorkerFault('RESULT_TOO_LARGE', 'PDF ve ZIP sonuçları birlikte geçici bellek bütçesini aşıyor. Daha küçük bir seçim deneyin.');
    }
    zip = { name: `${base}-pages.zip`, buffer: copyToArrayBuffer(zipBytes) };
  }

  const transfer: ArrayBuffer[] = files.map((file) => file.buffer);
  if (zip) transfer.push(zip.buffer);
  workerScope.postMessage({ type: 'complete', id, files, zip }, transfer);
}

async function handle(request: WorkerRequest): Promise<void> {
  if (busy) {
    sendError(request.id, 'BUSY', 'Önceki işlem sürüyor. Tamamlanmasını veya iptal edilmesini bekleyin.');
    return;
  }

  busy = true;
  try {
    if (request.type === 'load') {
      await loadPdf(request.id, request.file);
    } else {
      await extract(request.id, request, request.baseName);
    }
  } catch (error) {
    if (error instanceof WorkerFault) {
      sendError(request.id, error.code, error.message);
    } else if (error instanceof EncryptedPDFError) {
      sendError(request.id, 'ENCRYPTED_PDF', 'Şifreli PDF dosyaları desteklenmiyor.');
    } else {
      sendError(request.id, 'PROCESSING_FAILED', 'PDF işlemi tamamlanamadı. Dosya bozuk olabilir veya seçim geçici kaynak sınırlarını aşabilir.');
    }
  } finally {
    busy = false;
  }
}

workerScope.onmessage = (event) => {
  void handle(event.data);
};
