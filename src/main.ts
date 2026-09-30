import './style.css';
import { LIMITS } from './limits';
import { parseSelection } from './selection';
import { initializeTheme } from './theme';
import type { Mode, OutputFile, SelectionPlan, WorkerRequest, WorkerResponse } from './contracts';

const app = document.querySelector<HTMLElement>('#app');

if (app) {
  app.innerHTML = `
    <div class="page-shell">
      <header class="topbar">
        <a class="brand" href="#top" aria-label="PDF Divider ana sayfa">
          <svg class="brand-mark" viewBox="0 0 42 42" aria-hidden="true" focusable="false"><path d="M11 5.5h13l8 8V36H11z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M24 5.5v8h8M15 18h7v12h-7zM24 18h4v12h-4zM15 23h13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
          <span>PDF Divider</span>
        </a>
        <div class="theme-control">
          <label class="theme-label" for="theme-preference">Tema</label>
          <select id="theme-preference" aria-label="Renk teması">
            <option value="system">Cihaz teması</option>
            <option value="light">Açık tema</option>
            <option value="dark">Koyu tema</option>
          </select>
        </div>
      </header>
      <main id="top" class="site-main">
        <section class="workspace" aria-labelledby="page-title">
          <div class="tool-heading"><h1 id="page-title">Sayfaları ayır</h1><p>PDF’nizi seçin, istediğiniz sayfaları çıkarın.</p></div>
          <ol class="workflow-steps" aria-label="İşlem adımları">
            <li data-step="1" class="is-current" aria-current="step"><span class="step-indicator">1</span><span class="step-label">PDF seç</span></li>
            <li data-step="2"><span class="step-indicator">2</span><span class="step-label">Sayfaları belirle</span></li>
            <li data-step="3"><span class="step-indicator">3</span><span class="step-label">İndir</span></li>
          </ol>
          <label class="file-picker" for="pdf-file">
            <span class="file-icon" aria-hidden="true"><svg class="split-document" viewBox="0 0 64 64" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path class="split-page-left" d="M12 12h11l6 6v34H12zM23 12v6h6M17 27h7M17 33h7M17 39h5"/><path class="split-page-right" d="M35 12h11l6 6v34H35zM46 12v6h6M40 27h7M40 33h7M40 39h5"/><path class="split-cut" d="M32 8v48"/></svg></span>
            <span class="file-picker-copy"><strong>PDF seçin</strong><small>veya dosyanızı buraya bırakın</small></span>
            <span class="picker-action">Dosya seç</span>
            <input id="pdf-file" type="file" accept=".pdf,application/pdf" aria-describedby="file-help" />
          </label>
          <p id="file-help" class="field-help">En fazla ${formatGB(LIMITS.fileBytes)} GB · PDF’niz sunucuya yüklenmez.</p>
          <div id="file-summary" class="file-summary" hidden></div>
          <div id="pdf-settings" hidden>
          <div class="mode-row">
            <span class="mode-label">Çıktı biçimi</span>
            <div class="mode-segments" role="group" aria-label="Çıktı biçimi">
              <button type="button" data-mode="single" aria-pressed="true" disabled>Tek PDF</button>
              <button type="button" data-mode="pages" aria-pressed="false" disabled>Her sayfa</button>
              <button type="button" data-mode="groups" aria-pressed="false" disabled>Gruplar</button>
              <button type="button" data-mode="cuts" aria-pressed="false" disabled>Böl</button>
            </div>
            <select id="mode" name="mode" disabled aria-label="Çıktı biçimi" aria-describedby="mode-help">
              <option value="single">Seçili sayfaları tek PDF yap</option>
              <option value="pages">Her seçili sayfayı ayrı PDF yap</option>
              <option value="groups">Seçim gruplarını ayrı PDF yap</option>
              <option value="cuts">Klasik bölme</option>
            </select>
          </div>
          <p id="mode-help" class="mode-help">Seçtiğiniz sayfaları tek PDF içinde bir araya getirin.</p>
          <div class="selection-field">
            <label id="selection-label" for="selection">Sayfa seçimi</label>
            <div class="selection-input-wrap">
              <input id="selection" type="text" inputmode="text" autocomplete="off" spellcheck="false" placeholder="Örn. 1-5, 9, 11-13" disabled aria-describedby="selection-help" />
              <button id="all-pages" class="text-button" type="button" hidden>Tüm sayfalar</button>
            </div>
          </div>
          <p id="selection-help" class="field-help selection-help">PDF’niz yüklendikten sonra sayfa numaraları doğrulanır.</p>
          <p id="selection-error" class="inline-error" role="alert" hidden></p>
          <section id="preview" class="selection-preview" aria-label="Seçim özeti" hidden>
            <div class="preview-topline"><span class="preview-label">Çıktı özeti</span><span id="preview-count" class="preview-count"></span></div>
            <ol id="preview-groups" class="preview-groups"></ol>
            <p id="duplicate-note" class="duplicate-note" hidden></p>
          </section>
          </div>
          <div id="error" class="error-panel" role="alert" hidden></div>
          <div id="status" class="status-line" role="status" aria-live="polite" aria-atomic="true">Önce bir PDF seçin.</div>
          <div class="actions">
            <button id="extract" class="primary-button" type="button" disabled>PDF oluştur</button>
            <button id="cancel" class="secondary-button" type="button" hidden>İptal et</button>
            <button id="reset" class="secondary-button" type="button" hidden>Temizle</button>
          </div>
          <section id="downloads" class="downloads" aria-labelledby="download-title" hidden>
            <div class="download-heading"><span class="success-mark" aria-hidden="true">✓</span><div><h2 id="download-title">PDF’leriniz hazır</h2><p id="download-summary"></p></div></div>
            <div id="primary-download" class="primary-download"></div>
            <details class="individual-downloads" id="individual-details" hidden><summary>PDF’leri tek tek indir</summary><ol id="download-list"></ol></details>
          </section>
          <details class="notice"><summary>Desteklenen belgeler</summary><p>Şifreli, imzalı veya etkileşimli formlu PDF’ler bu sürümde desteklenmiyor. Notlar ve yer imleri çıktıda korunmayabilir; sayfa metni ve grafikleri kopyalanır.</p></details>
          <details class="limits-details">
            <summary>Boyut ve işlem bilgisi</summary>
            <p>Kaynak PDF en fazla ${formatGB(LIMITS.fileBytes)} GB olabilir. Oluşturulan PDF’lerin toplamı ve ZIP dosyası ayrı ayrı en fazla ${formatGB(LIMITS.outputBytes)} GB olabilir. Sayfa, çıktı dosyası ve seçim grubu sayısı için sabit üst sınır yoktur. Her işlem için süre sınırı ${LIMITS.timeoutMs / 1000} saniyedir. Büyük dosyaların işlenebilmesi cihazınızın belleğine bağlıdır; bu değerler doğrulanmış cihaz kapasitesi garantisi değildir.</p>
          </details>
        </section>
      </main>
      <footer class="footer"><span>Ücretsiz · Hesap gerektirmez</span><span>Dosyanız cihazınızda kalır.</span></footer>
    </div>
  `;

  initializeTheme();
  const pdfSettings = get<HTMLDivElement>('#pdf-settings');
  const fileInput = get<HTMLInputElement>('#pdf-file');
  const filePicker = get<HTMLLabelElement>('.file-picker');
  const fileSummary = get<HTMLDivElement>('#file-summary');
  const modeSelect = get<HTMLSelectElement>('#mode');
  const modeButtons = [...app.querySelectorAll<HTMLButtonElement>('[data-mode]')];
  const selectionInput = get<HTMLInputElement>('#selection');
  const selectionLabel = get<HTMLLabelElement>('#selection-label');
  const selectionHelp = get<HTMLParagraphElement>('#selection-help');
  const selectionError = get<HTMLParagraphElement>('#selection-error');
  const allPagesButton = get<HTMLButtonElement>('#all-pages');
  const preview = get<HTMLElement>('#preview');
  const previewCount = get<HTMLSpanElement>('#preview-count');
  const previewGroups = get<HTMLOListElement>('#preview-groups');
  const duplicateNote = get<HTMLParagraphElement>('#duplicate-note');
  const statusLine = get<HTMLDivElement>('#status');
  const errorPanel = get<HTMLDivElement>('#error');
  const extractButton = get<HTMLButtonElement>('#extract');
  const cancelButton = get<HTMLButtonElement>('#cancel');
  const resetButton = get<HTMLButtonElement>('#reset');
  const downloads = get<HTMLElement>('#downloads');
  const downloadSummary = get<HTMLParagraphElement>('#download-summary');
  const primaryDownload = get<HTMLDivElement>('#primary-download');
  const individualDetails = get<HTMLDetailsElement>('#individual-details');
  const downloadList = get<HTMLOListElement>('#download-list');
  const selectionPreview = get<HTMLElement>('#preview');
  const workflowSteps = get<HTMLOListElement>('.workflow-steps');
  const workflowItems = [...workflowSteps.querySelectorAll<HTMLLIElement>('[data-step]')];

  let sourceFile: File | null = null;
  let pageCount = 0;
  let worker: Worker | null = null;
  let nextRequestId = 0;
  let activeRequestId = 0;
  let busy = false;
  let downloadClicked = false;
  let activeTimer: number | undefined;
  const objectUrls = new Set<string>();

  function get<T extends Element>(selector: string): T {
    const node = app!.querySelector<T>(selector);
    if (!node) throw new Error(`Missing UI element: ${selector}`);
    return node;
  }

  function mode(): Mode {
    return modeSelect.value as Mode;
  }

  function revokeDownloads(): void {
    downloadClicked = false;
    for (const url of objectUrls) URL.revokeObjectURL(url);
    objectUrls.clear();
    primaryDownload.replaceChildren();
    downloadList.replaceChildren();
    downloads.hidden = true;
    individualDetails.hidden = true;
    updateWorkflowSteps();
  }

  function clearTimer(): void {
    if (activeTimer !== undefined) window.clearTimeout(activeTimer);
    activeTimer = undefined;
  }

  function terminateWorker(): void {
    clearTimer();
    worker?.terminate();
    worker = null;
    busy = false;
    app!.setAttribute('aria-busy', 'false');
  }

  function setError(message: string, requireReselect = false): void {
    terminateWorker();
    revokeDownloads();
    errorPanel.textContent = message;
    errorPanel.hidden = false;
    busy = false;
    if (requireReselect) {
      sourceFile = null;
      pageCount = 0;
      fileInput.value = '';
      fileSummary.hidden = true;
      modeSelect.disabled = true;
      selectionInput.disabled = true;
      resetButton.hidden = true;
      extractButton.hidden = false;
      extractButton.disabled = true;
      preview.hidden = true;
      statusLine.textContent = 'Yeni bir PDF seçerek yeniden başlayın.';
    }
    updateButtons();
  }

  function setStatus(message: string): void {
    statusLine.textContent = message;
  }

  function clearError(): void {
    errorPanel.hidden = true;
    errorPanel.textContent = '';
  }

  function updateWorkflowSteps(): void {
    const hasValidPdf = Boolean(sourceFile && pageCount > 0);
    const outputsReady = !downloads.hidden;
    const allComplete = outputsReady && downloadClicked;
    const currentStep = outputsReady ? (allComplete ? 0 : 3) : (hasValidPdf ? 2 : 1);
    const completedThrough = allComplete ? 3 : outputsReady ? 2 : hasValidPdf ? 1 : 0;

    workflowSteps.dataset.complete = String(allComplete);
    for (const item of workflowItems) {
      const step = Number(item.dataset.step);
      item.classList.toggle('is-current', step === currentStep);
      item.classList.toggle('is-complete', step <= completedThrough);
      if (step === currentStep) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    }
  }

  function updateButtons(): void {
    pdfSettings.hidden = !sourceFile || pageCount < 1;
    extractButton.disabled = busy || !sourceFile || pageCount < 1;
    cancelButton.hidden = !busy;
    resetButton.hidden = !sourceFile && downloads.hidden;
    modeSelect.disabled = busy || !sourceFile || pageCount < 1;
    for (const button of modeButtons) button.disabled = modeSelect.disabled;
    selectionInput.disabled = busy || !sourceFile || pageCount < 1;
    allPagesButton.hidden = busy || !sourceFile || pageCount < 1 || mode() === 'cuts';
    updateWorkflowSteps();
  }

  function updateModeCopy(): void {
    const currentMode = mode();
    for (const button of modeButtons) button.setAttribute('aria-pressed', String(button.dataset.mode === currentMode));
    const copy: Record<Mode, { help: string; label: string; placeholder: string; fieldHelp: string }> = {
      single: {
        help: 'Seçtiğiniz sayfalar kaynak sırasıyla tek PDF içinde birleştirilir.',
        label: 'Sayfa seçimi',
        placeholder: 'Örn. 1-5, 9, 11-13',
        fieldHelp: 'Tek sayfa, aralık veya virgülle ayrılmış sayfalar yazın. Aralık uçları dahildir.',
      },
      pages: {
        help: 'Seçtiğiniz her sayfa için ayrı bir PDF hazırlanır.',
        label: 'Sayfa seçimi',
        placeholder: 'Örn. 1, 5, 9',
        fieldHelp: 'Tek sayfa, aralık veya virgülle ayrılmış sayfalar yazın.',
      },
      groups: {
        help: 'Noktalı virgülle ayırdığınız her grup ayrı bir PDF olur.',
        label: 'PDF grupları',
        placeholder: 'Örn. 1-5; 9; 11-13',
        fieldHelp: 'Virgül grup içindeki sayfaları ayırır; noktalı virgül yeni PDF grubu başlatır.',
      },
      cuts: {
        help: 'Belgeyi belirttiğiniz sayfalardan sonra keserek ardışık PDF parçaları oluşturur.',
        label: 'Şu sayfalardan sonra kes',
        placeholder: 'Örn. 3, 7, 11',
        fieldHelp: 'Her sayı o sayfanın sonrasına kesim ekler. Son sayfadan sonra kesim girilmez.',
      },
    };
    const selected = copy[currentMode];
    get<HTMLParagraphElement>('#mode-help').textContent = selected.help;
    selectionLabel.textContent = selected.label;
    selectionInput.placeholder = selected.placeholder;
    selectionHelp.textContent = selected.fieldHelp;
    selectionInput.setAttribute('aria-label', selected.label);
    updateButtons();
    if (sourceFile && pageCount) updatePreview();
  }

  function compactPages(pages: number[]): string {
    if (pages.length === 0) return 'Sayfa yok';
    const parts: string[] = [];
    let start = pages[0];
    let end = start;
    for (let index = 1; index < pages.length; index += 1) {
      const page = pages[index];
      if (page === end + 1) {
        end = page;
      } else {
        parts.push(start === end ? String(start) : `${start}–${end}`);
        start = page;
        end = page;
      }
    }
    parts.push(start === end ? String(start) : `${start}–${end}`);
    return parts.join(', ');
  }

  function parseCurrentSelection(): SelectionPlan | null {
    selectionError.hidden = true;
    selectionError.textContent = '';
    if (!selectionInput.value.trim()) {
      return null;
    }
    try {
      return parseSelection(selectionInput.value, mode(), pageCount);
    } catch (error) {
      selectionError.textContent = error instanceof Error ? error.message : 'Sayfa seçimini kontrol edin.';
      selectionError.hidden = false;
      return null;
    }
  }

  function updatePreview(): void {
    if (!sourceFile || pageCount < 1 || busy) {
      selectionPreview.hidden = true;
      extractButton.disabled = true;
      return;
    }
    const plan = parseCurrentSelection();
    if (!plan) {
      selectionPreview.hidden = true;
      extractButton.disabled = true;
      return;
    }
    previewGroups.replaceChildren();
    const totalCopied = plan.groups.reduce((sum, group) => sum + group.length, 0);
    previewCount.textContent = `${plan.groups.length} PDF · ${totalCopied} sayfa`;
    for (const [index, group] of plan.groups.entries()) {
      const item = document.createElement('li');
      const label = document.createElement('span');
      label.textContent = plan.groups.length === 1 ? 'Çıktı' : `PDF ${index + 1}`;
      const pages = document.createElement('strong');
      pages.textContent = compactPages(group);
      item.append(label, pages);
      previewGroups.append(item);
    }
    duplicateNote.hidden = plan.duplicateCount === 0;
    duplicateNote.textContent = plan.duplicateCount
      ? `${plan.duplicateCount} yinelenen sayfa seçimden çıkarılacak.`
      : '';
    selectionPreview.hidden = false;
    extractButton.disabled = false;
  }

  function createWorker(): Worker {
    const nextWorker = new Worker(new URL('./pdf.worker.ts', import.meta.url), { type: 'module' });
    nextWorker.addEventListener('message', (event: MessageEvent<WorkerResponse>) => {
      if (worker !== nextWorker || event.data.id !== activeRequestId) return;
      handleWorkerMessage(event.data);
    });
    nextWorker.addEventListener('error', () => {
      if (worker === nextWorker) setError('PDF işlenirken beklenmeyen bir hata oluştu. Yeni bir PDF seçip yeniden deneyin.', true);
    });
    nextWorker.addEventListener('messageerror', () => {
      if (worker === nextWorker) setError('PDF işlemi tarayıcıyla iletişim kuramadı. Yeni bir PDF seçip yeniden deneyin.', true);
    });
    return nextWorker;
  }

  function beginRequest(request: WorkerRequest, description: string): void {
    if (!worker) return;
    clearTimer();
    activeRequestId = ++nextRequestId;
    const requestWithId = { ...request, id: activeRequestId } as WorkerRequest;
    busy = true;
    app!.setAttribute('aria-busy', 'true');
    extractButton.hidden = true;
    downloads.hidden = true;
    cancelButton.hidden = false;
    clearError();
    setStatus(description);
    updateButtons();
    activeTimer = window.setTimeout(() => {
      if (worker) setError('İşlem 120 saniye içinde tamamlanmadı. Yeni bir PDF seçerek yeniden deneyin.', true);
    }, LIMITS.timeoutMs);
    try {
      worker.postMessage(requestWithId);
    } catch {
      setError('Dosya tarayıcı worker’ına aktarılamadı. Yeni bir PDF seçip yeniden deneyin.', true);
    }
  }

  function handleWorkerMessage(message: WorkerResponse): void {
    if (message.type === 'progress') {
      if (message.stage === 'loading') setStatus('PDF okunuyor…');
      else if (message.stage === 'extracting') {
        const count = message.total > 0 ? ` (${message.current}/${message.total} PDF)` : '';
        setStatus(`PDF sayfaları kopyalanıyor${count}…`);
      } else setStatus('İndirme dosyası hazırlanıyor…');
      return;
    }
    if (message.type === 'loaded') {
      clearTimer();
      busy = false;
      app!.setAttribute('aria-busy', 'false');
      extractButton.hidden = false;
      pageCount = message.pages;
      modeSelect.disabled = false;
      selectionInput.disabled = false;
      selectionInput.value = '';
      fileSummary.hidden = false;
      fileSummary.textContent = `${sourceFile?.name ?? 'PDF'} · ${pageCount} sayfa · ${formatBytes(sourceFile?.size ?? 0)}`;
      setStatus('PDF hazır. Sayfa seçiminizi yazın.');
      updateButtons();
      updatePreview();
      return;
    }
    if (message.type === 'error') {
      setError(userErrorFor(message.code), true);
      return;
    }
    if (message.type === 'complete') {
      clearTimer();
      busy = false;
      terminateWorker();
      sourceFile = null;
      fileInput.value = '';
      pdfSettings.hidden = true;
      try {
        if (!finishDownloads(message.files, message.zip)) return;
      } catch {
        setError('İndirme dosyaları hazırlanamadı. Yeni bir PDF seçip yeniden deneyin.', true);
        return;
      }
      modeSelect.disabled = true;
      selectionInput.disabled = true;
      extractButton.hidden = true;
      cancelButton.hidden = true;
      resetButton.hidden = false;
      setStatus('İşlem tamamlandı. Dosyaları indirin veya temizleyin.');
      app!.setAttribute('aria-busy', 'false');
    }
  }

  function finishDownloads(files: OutputFile[], zip: { name: string; buffer: ArrayBuffer } | null): boolean {
    if (files.length === 0) {
      setError('İşlem PDF çıktısı üretmedi. Yeni bir PDF seçip yeniden deneyin.', true);
      return false;
    }
    if (files.length > 1 && !zip) {
      setError('Çoklu PDF arşivi oluşturulamadı. Yeni bir PDF seçip daha küçük bir seçimle yeniden deneyin.', true);
      return false;
    }
    const pdfBytes = files.reduce((sum, file) => sum + file.buffer.byteLength, 0);
    if (pdfBytes > LIMITS.outputBytes || (zip?.buffer.byteLength ?? 0) > LIMITS.zipBytes) {
      setError(`PDF çıktılarının toplamı veya ZIP dosyası ${formatGB(LIMITS.outputBytes)} GB sınırını aşıyor. Daha küçük bir seçim deneyin.`, true);
      return false;
    }
    downloadSummary.textContent = files.length === 1 ? 'Bir PDF oluşturuldu.' : `${files.length} PDF oluşturuldu.`;
    if (files.length === 1) {
      const file = files[0];
      const url = makeObjectUrl(file.buffer, 'application/pdf');
      file.buffer = new ArrayBuffer(0);
      appendDownloadLink(primaryDownload, file.name, url, 'PDF’yi indir');
      individualDetails.hidden = true;
    } else {
      for (const file of files) {
        const url = makeObjectUrl(file.buffer, 'application/pdf');
        file.buffer = new ArrayBuffer(0);
        const item = document.createElement('li');
        appendDownloadLink(item, file.name, url, `${file.name} indir`);
        downloadList.append(item);
      }
      if (zip) {
        const zipUrl = makeObjectUrl(zip.buffer, 'application/zip');
        zip.buffer = new ArrayBuffer(0);
        appendDownloadLink(primaryDownload, zip.name, zipUrl, 'Tüm PDF’leri ZIP olarak indir');
      }
      individualDetails.hidden = false;
    }
    downloads.hidden = false;
    updateWorkflowSteps();
    downloads.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'nearest' });
    return true;
  }

  function makeObjectUrl(buffer: ArrayBuffer, mimeType: string): string {
    const url = URL.createObjectURL(new Blob([buffer], { type: mimeType }));
    objectUrls.add(url);
    return url;
  }

  function appendDownloadLink(container: Element, filename: string, url: string, label: string): void {
    const link = document.createElement('a');
    link.className = 'download-link';
    link.href = url;
    link.download = filename;
    link.textContent = label;
    container.append(link);
  }

  function chooseFile(file: File | undefined): void {
    if (!file) return;
    terminateWorker();
    revokeDownloads();
    clearError();
    sourceFile = null;
    pageCount = 0;
    fileSummary.hidden = true;
    preview.hidden = true;
    selectionInput.value = '';
    selectionError.hidden = true;
    duplicateNote.hidden = true;
    modeSelect.value = 'single';
    updateModeCopy();
    extractButton.hidden = false;
    cancelButton.hidden = true;
    resetButton.hidden = true;
    fileInput.value = '';

    if (file.size > LIMITS.fileBytes) {
      setError(`PDF dosyası ${formatGB(LIMITS.fileBytes)} GB sınırını aşıyor. Daha küçük bir PDF seçin.`, false);
      setStatus('Dosya boyutu sınırı aşıldı.');
      updateButtons();
      return;
    }
    sourceFile = file;
    fileSummary.hidden = false;
    fileSummary.textContent = `${file.name} · ${formatBytes(file.size)} · Sayfa sayısı okunuyor`;
    try {
      worker = createWorker();
      beginRequest({ type: 'load', id: 0, file }, 'PDF tarayıcınızda açılıyor…');
    } catch {
      setError('Bu tarayıcıda PDF worker’ı başlatılamadı. Yeni bir PDF seçip yeniden deneyin.', true);
    }
  }

  function userErrorFor(code: string): string {
    const messages: Record<string, string> = {
      EMPTY_FILE: 'Bu dosya boş. Başka bir PDF seçin.',
      FILE_TOO_LARGE: `PDF dosyası ${formatGB(LIMITS.fileBytes)} GB sınırını aşıyor.`,
      NOT_PDF: 'Seçtiğiniz dosya PDF biçiminde değil. Bir PDF dosyası seçin.',
      INVALID_PDF: 'Bu dosya geçerli veya okunabilir bir PDF değil. Başka bir dosya seçin.',
      ENCRYPTED_PDF: 'Parolalı PDF’ler bu sürümde desteklenmiyor. Parolasız bir PDF seçin.',
      SIGNED_PDF: 'Dijital imza içeren PDF’ler bu sürümde desteklenmiyor. Başka bir PDF seçin.',
      INTERACTIVE_FORM: 'Etkileşimli form içeren PDF’ler bu sürümde desteklenmiyor. Başka bir PDF seçin.',
      NO_SOURCE: 'PDF kaynağı artık kullanılabilir değil. Yeni bir PDF seçin.',
      OUTPUT_TOO_LARGE: `Oluşturulan PDF’lerin toplamı ${formatGB(LIMITS.outputBytes)} GB sınırını aşıyor. Daha küçük bir seçim deneyin.`,
      ZIP_TOO_LARGE: `ZIP dosyası ${formatGB(LIMITS.zipBytes)} GB sınırını aşıyor. Daha küçük bir seçim deneyin.`,
      TIMEOUT: 'İşlem zaman sınırını aştı. Daha küçük bir PDF veya seçim deneyin.',
      BUSY: 'Başka bir işlem sürüyor. İşlemi bitirin veya iptal edip yeniden deneyin.',
      PROCESSING_FAILED: 'PDF işlenemedi. Başka bir PDF seçip yeniden deneyin.',
    };
    return messages[code] ?? 'PDF işlenemedi. Başka bir PDF seçip yeniden deneyin.';
  }

  function cancelAndReset(message = 'İşlem iptal edildi. Yeni bir PDF seçerek başlayın.'): void {
    terminateWorker();
    revokeDownloads();
    clearError();
    sourceFile = null;
    pageCount = 0;
    fileInput.value = '';
    fileSummary.hidden = true;
    selectionInput.value = '';
    selectionInput.disabled = true;
    selectionError.hidden = true;
    modeSelect.disabled = true;
    modeSelect.value = 'single';
    updateModeCopy();
    preview.hidden = true;
    duplicateNote.hidden = true;
    extractButton.hidden = false;
    extractButton.disabled = true;
    cancelButton.hidden = true;
    resetButton.hidden = true;
    setStatus(message);
    updateButtons();
  }

  function formatBytes(bytes: number): string {
    if (bytes >= 1_000_000_000) return `${formatGB(bytes)} GB`;
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KiB`;
    return `${(bytes / (1024 * 1024)).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} MiB`;
  }

  function formatGB(bytes: number): string {
    return (bytes / 1_000_000_000).toLocaleString('tr-TR', { maximumFractionDigits: 1 });
  }

  fileInput.addEventListener('change', () => chooseFile(fileInput.files?.[0]));
  downloads.addEventListener('click', (event) => {
    const target = event.target;
    const link = target instanceof Element ? target.closest<HTMLAnchorElement>('a[download]') : null;
    if (!link) return;
    downloadClicked = true;
    updateWorkflowSteps();
  });
  filePicker.addEventListener('dragover', (event) => {
    event.preventDefault();
    filePicker.classList.add('is-dragging');
  });
  filePicker.addEventListener('dragleave', (event) => {
    if (!filePicker.contains(event.relatedTarget as Node | null)) filePicker.classList.remove('is-dragging');
  });
  filePicker.addEventListener('drop', (event) => {
    event.preventDefault();
    filePicker.classList.remove('is-dragging');
    chooseFile(event.dataTransfer?.files[0]);
  });
  modeSelect.addEventListener('change', () => {
    selectionInput.value = '';
    selectionError.hidden = true;
    updateModeCopy();
    selectionInput.focus();
  });
  for (const button of modeButtons) {
    button.addEventListener('click', () => {
      if (button.disabled || !button.dataset.mode || button.dataset.mode === modeSelect.value) return;
      modeSelect.value = button.dataset.mode;
      modeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }
  selectionInput.addEventListener('input', updatePreview);
  allPagesButton.addEventListener('click', () => {
    if (!pageCount || mode() === 'cuts') return;
    selectionInput.value = `1-${pageCount}`;
    selectionInput.focus();
    updatePreview();
  });
  extractButton.addEventListener('click', () => {
    const file = sourceFile;
    const currentWorker = worker;
    if (!file || !currentWorker || !pageCount) return;
    const plan = parseCurrentSelection();
    if (!plan) {
      selectionInput.focus();
      return;
    }
    revokeDownloads();
    const baseName = file.name.toLowerCase().endsWith('.pdf') ? file.name : `${file.name}.pdf`;
    beginRequest({ type: 'extract', id: 0, mode: mode(), selection: selectionInput.value, baseName }, 'PDF’ler hazırlanıyor…');
  });
  cancelButton.addEventListener('click', () => cancelAndReset());
  resetButton.addEventListener('click', () => cancelAndReset('Temizlendi. Yeni bir PDF seçerek başlayın.'));

  window.addEventListener('pagehide', (event) => {
    if (event.persisted) return;
    terminateWorker();
    revokeDownloads();
  });
  window.addEventListener('pageshow', (event) => {
    if (event.persisted && sourceFile && !worker) {
      setStatus('Bu sayfa yenilendi. PDF’yi yeniden seçerek devam edin.');
      sourceFile = null;
      pageCount = 0;
      updateButtons();
    }
  });

  updateModeCopy();
  updateButtons();
}
