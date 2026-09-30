import './style.css';
import { LIMITS } from './limits';
import { parseSelection } from './selection';
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
        <span class="privacy-pill"><span aria-hidden="true">✦</span> Ücretsiz · Hesap gerektirmez</span>
      </header>
      <main id="top" class="site-main">
        <section class="hero" aria-labelledby="page-title">
          <p class="eyebrow">PDF sayfalarınız, sizin seçiminiz</p>
          <h1 id="page-title">PDF’yi bölün.<br /><span>Kontrol sizde.</span></h1>
          <span class="title-rule" aria-hidden="true"></span>
          <p class="intro-copy">İstediğiniz sayfaları seçin.<br class="desktop-break" /> Dosyanız cihazınızda kalır.</p>
          <div class="trust-badge"><span aria-hidden="true">✦</span> Tarayıcıda işlenir</div>
        </section>
        <section class="workspace" aria-labelledby="tool-title">
          <div class="tool-heading"><span class="tool-kicker">PDF aracı</span><h2 id="tool-title">Sayfaları ayır</h2><p>Sayfaları seçin, çıktı biçiminizi belirleyin.</p></div>
          <label class="file-picker" for="pdf-file">
            <span class="file-icon" aria-hidden="true"><svg viewBox="0 0 32 36" focusable="false"><path d="M6 2.5h13l7 7V33H6zM19 2.5v7h7M10 17h12M10 21h12M10 25h8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></span>
            <span class="file-picker-copy"><strong>PDF seçin</strong><small>veya dosyanızı buraya bırakın</small></span>
            <span class="picker-action">Dosya seç</span>
            <input id="pdf-file" type="file" accept=".pdf,application/pdf" aria-describedby="file-help" />
          </label>
          <p id="file-help" class="field-help">En fazla ${formatMiB(LIMITS.fileBytes)} MiB · PDF’niz sunucuya yüklenmez.</p>
          <div id="file-summary" class="file-summary" hidden></div>
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
          <div id="error" class="error-panel" role="alert" hidden></div>
          <div id="status" class="status-line" role="status" aria-live="polite" aria-atomic="true">Önce bir PDF seçin.</div>
          <div class="actions">
            <button id="extract" class="primary-button" type="button" disabled>PDF oluştur <span aria-hidden="true">↗</span></button>
            <button id="cancel" class="secondary-button" type="button" hidden>İptal et</button>
            <button id="reset" class="secondary-button" type="button" hidden>Temizle</button>
          </div>
          <section id="downloads" class="downloads" aria-labelledby="download-title" hidden>
            <div class="download-heading"><span class="success-mark" aria-hidden="true">✓</span><div><h2 id="download-title">PDF’leriniz hazır</h2><p id="download-summary"></p></div></div>
            <div id="primary-download" class="primary-download"></div>
            <details class="individual-downloads" id="individual-details" hidden><summary>PDF’leri tek tek indir</summary><ol id="download-list"></ol></details>
          </section>
          <div class="notice" role="note"><span class="notice-icon" aria-hidden="true">i</span><p>Şifreli, imzalı veya etkileşimli formlu PDF’ler bu sürümde desteklenmiyor. Notlar ve yer imleri çıktıda korunmayabilir; sayfa metni ve grafikleri kopyalanır.</p></div>
          <details class="limits-details">
            <summary>Geçici geliştirme sınırları</summary>
            <p>Şu an dosya boyutu ${formatMiB(LIMITS.fileBytes)} MiB, kaynak sayfa sayısı ${LIMITS.sourcePages}, çıktı sayısı ${LIMITS.outputs} ve toplam kopyalanan sayfa ${LIMITS.copiedPages} ile sınırlıdır. PDF ve ZIP sonuçları toplamı en fazla ${formatMiB(LIMITS.resultBytes)} MiB olabilir; indirme dosyaları hazırlanırken oluşabilecek ek kopyalar için ${formatMiB(LIMITS.resultResidentBytes)} MiB sonuç bütçesi ayrılır. Bu, tüm tarayıcının toplam bellek kullanımı için garanti değildir. Sınırlar geçicidir; gerçek düşük donanımlı iOS ve Android cihazlarda ölçülmemiştir ve ürün kapasitesi vaadi değildir.</p>
          </details>
        </section>
      </main>
      <footer class="footer"><a class="footer-brand" href="#top">PDF Divider</a><span>PDF’niz sunucuya yüklenmez.</span></footer>
    </div>
  `;

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

  let sourceFile: File | null = null;
  let pageCount = 0;
  let worker: Worker | null = null;
  let nextRequestId = 0;
  let activeRequestId = 0;
  let busy = false;
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
    for (const url of objectUrls) URL.revokeObjectURL(url);
    objectUrls.clear();
    primaryDownload.replaceChildren();
    downloadList.replaceChildren();
    downloads.hidden = true;
    individualDetails.hidden = true;
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

  function updateButtons(): void {
    extractButton.disabled = busy || !sourceFile || pageCount < 1;
    cancelButton.hidden = !busy;
    resetButton.hidden = !sourceFile && downloads.hidden;
    modeSelect.disabled = busy || !sourceFile || pageCount < 1;
    for (const button of modeButtons) button.disabled = modeSelect.disabled;
    selectionInput.disabled = busy || !sourceFile || pageCount < 1;
    allPagesButton.hidden = busy || !sourceFile || pageCount < 1 || mode() === 'cuts';
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
    if (selectionInput.value.length > LIMITS.inputCharacters) {
      selectionError.textContent = `Seçim metni en fazla ${LIMITS.inputCharacters.toLocaleString('tr-TR')} karakter olabilir.`;
      selectionError.hidden = false;
      return null;
    }
    if (!selectionInput.value.trim()) {
      return null;
    }
    try {
      const plan = parseSelection(selectionInput.value, mode(), pageCount);
      const copiedPages = plan.groups.reduce((sum, group) => sum + group.length, 0);
      if (plan.groups.length > LIMITS.outputs || plan.groups.length > LIMITS.groups) {
        throw new Error(`En fazla ${LIMITS.outputs} PDF çıktısı oluşturulabilir.`);
      }
      if (copiedPages > LIMITS.copiedPages) {
        throw new Error(`Toplam kopyalanacak sayfa sayısı ${LIMITS.copiedPages} sınırını aşıyor.`);
      }
      return plan;
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
      if (pageCount > LIMITS.sourcePages) {
        setError(`Bu PDF ${pageCount} sayfa içeriyor. Geçici geliştirme sınırı ${LIMITS.sourcePages} sayfa; başka bir PDF seçin.`, true);
        return;
      }
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
    const resultBytes = files.reduce((sum, file) => sum + file.buffer.byteLength, 0) + (zip?.buffer.byteLength ?? 0);
    if (resultBytes > LIMITS.resultBytes || resultBytes * 2 > LIMITS.resultResidentBytes) {
      setError('Sonuçlar geçici bellek bütçesini aşıyor. Daha az sayfa veya çıktı seçip yeniden deneyin.', true);
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
      setError(`Dosya ${formatBytes(file.size)} boyutunda. Geçici sınır ${formatMiB(LIMITS.fileBytes)} MiB; daha küçük bir PDF seçin.`, false);
      setStatus('Dosya sınırı aşıldı.');
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
      FILE_TOO_LARGE: `PDF, geçici ${formatMiB(LIMITS.fileBytes)} MiB dosya sınırını aşıyor.`,
      NOT_PDF: 'Seçtiğiniz dosya PDF biçiminde değil. Bir PDF dosyası seçin.',
      INVALID_PDF: 'Bu dosya geçerli veya okunabilir bir PDF değil. Başka bir dosya seçin.',
      ENCRYPTED_PDF: 'Parolalı PDF’ler bu sürümde desteklenmiyor. Parolasız bir PDF seçin.',
      SIGNED_PDF: 'Dijital imza içeren PDF’ler bu sürümde desteklenmiyor. Başka bir PDF seçin.',
      INTERACTIVE_FORM: 'Etkileşimli form içeren PDF’ler bu sürümde desteklenmiyor. Başka bir PDF seçin.',
      TOO_MANY_PAGES: `PDF, geçici ${LIMITS.sourcePages} sayfa sınırını aşıyor. Daha az sayfalı bir dosya seçin.`,
      NO_SOURCE: 'PDF kaynağı artık kullanılabilir değil. Yeni bir PDF seçin.',
      OUTPUT_TOO_LARGE: 'Seçiminiz geçici çıktı bütçesini aşıyor. Daha az sayfa veya çıktı seçin.',
      RESULT_TOO_LARGE: `Sonuçlar geçici ${formatMiB(LIMITS.resultBytes)} MiB bellek bütçesini aşıyor. Daha az sayfa veya çıktı seçin.`,
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
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KiB`;
    return `${(bytes / (1024 * 1024)).toLocaleString('tr-TR', { maximumFractionDigits: 1 })} MiB`;
  }

  function formatMiB(bytes: number): string {
    return (bytes / (1024 * 1024)).toLocaleString('tr-TR', { maximumFractionDigits: 0 });
  }

  fileInput.addEventListener('change', () => chooseFile(fileInput.files?.[0]));
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
