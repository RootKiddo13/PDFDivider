# PDF Divider — Rapor Merkezi

Bu dosya araştırma ve iş raporlarının ana indeksidir. Kısa hazırlık kayıtları burada tutulur; gerektiğinde ayrıntılı raporlar `reports/` altına eklenip buradan bağlanır. Rapor, yalnızca gerçekten yapılan işi ve kanıtını kaydeder.

## Son teslim — 2026-09-30

[Ücretsiz yayın araştırması](reports/2026-09-30-free-hosting-research.md): Cloudflare Pages Free, Netlify Free, GitHub Pages ve Vercel Hobby resmi koşulları karşılaştırıldı. Cloudflare Pages + Git entegrasyonu + `pages.dev` önerildi; repo/hosting projesi/yayın henüz yapılmadı. Sayfa sırası ve gerçek PDF/cihaz doğrulaması yayın kapısı.

Yerel preview `ERR_CONNECTION_REFUSED` verdiğinde 4173 portunda dinleyici yoktu. `npm.cmd run preview -- --port 4173 --strictPort` ile yeniden başlatıldı; HTML, CSS ve yerel Roboto fontu HTTP 200 döndü. Bu adres yalnız preview süreci açıkken çalışır; production yayını değildir.

[Sayfa sırası araştırması](reports/2026-09-30-page-order-investigation.md): kullanıcı son sayfanın ilk sayfa gibi çıkarıldığını bildirdi. Statik seçim/worker/indirme ve resmi API incelemesinde ters sıralama kanıtlanmadı; `part-001` çıktı sırasıdır. Kaynak PDF ve mod/girdi istendi; kök neden açık, kod değişmedi.

[Roboto tipografi uygulaması](reports/2026-09-30-roboto-typography.md): tüm siteye yerel Regular 400, Medium 500 ve Bold 700 uygulandı; Thin/italic yok. Türkçe font kapsamı ve build varlıkları statik incelendi, derleme ve bağımsız kaynak incelemesi geçti. Gerçek browser/telefon görünümü doğrulanmadı.

[Onaylı görsel tasarım uygulaması](reports/2026-09-30-approved-redesign.md): turuncu/bordo masaüstü ve mobil görünüm kodlandı. Derleme geçti; bağımsız incelemenin iki mod kontrolü bulgusu giderilip yeniden incelendi. PDF çekirdeği/kontrat/limit dosyaları değişmedi. Gerçek browser/telefon doğrulaması ve yayın yapılmadı.

[İlk implementation raporu](reports/2026-09-30-initial-implementation.md): core ve mobil UI kodlandı, final tip kontrolü/build geçti, iki bağımsız kaynak incelemesi tamamlandı. Blob kopyası için bellek guard'ı düzeltildi. Gerçek PDF/browser/telefon doğrulaması ve production yayını yapılmadı. Yerel preview başlatıldı; Codex sekme isteği queued döndü. Ayrıntılı kanıt, çıktılar ve kalan kapılar raporda.

## 2026-09-30 — Spec'ler, uygulama sırası ve foundation

Kullanıcı mobil/düşük donanım önceliğini ve tek/aralık/dağınık/tüm sayfa çıkarma kapsamını belirledi; ardından orkestrasyonla geliştirmeyi başlatmayı yetkilendirdi.

- Üç spec hazır: [kapsam](specs/01-mvp-scope.md), [seçim ve çıktılar](specs/02-page-selection-and-outputs.md), [mobil/performans](specs/03-mobile-performance.md). İndirme, özel PDF ret davranışı ve iptal/sıfırlama ayrıntıları uygulama seçimleri olarak eklendi.
- [Uygulama sırası](agent-loop/implementation-order.md), loop/handoff belgeleri tamamlandı; current state [active-run](agent-loop/active-run.md) içindedir.
- Parent TypeScript/Vite/npm iskeletini ve sabit worker mesaj türlerini yazdı. Sürüm sorguları npm registry üzerinden yapıldı; Node 22.23.2, npm 12.0.2, Vite 8.3.1, TypeScript 7.0.2, pdf-lib 1.17.1, fflate 0.8.3. npm install ile 23 paket kuruldu ve package-lock.json üretildi.
- İlk tip kontrolü CSS modül tür bildirimi eksikliğiyle durdu; src/vite-env.d.ts eklendi. Sonraki npm run build başarılı: başlangıç HTML 0.79 kB, CSS 0.13 kB, JS 0.74 kB; Vite bundle süresi 194 ms. Bunlar yalnız boş foundation çıktılarıdır, entegre PDF uygulaması boyutları değildir.
- Bağımsız Luna incelemesinde foundation için config/protocol engeli bulunmadı. PDF+ZIP beraber tutulunca bağımsız byte sınırlarının toplam bellek riskini artırdığı bulundu; parent 100 MiB toplam sonuç guard'ı ekledi, core builder'a ZIP öncesinde uygulama görevi verdi.

**Koordinasyon:** İki eş düzey GPT-6 Luna worker; biri core/seçim dosyalarını, diğeri mobil UI dosyalarını yazıyor. Parent shared config, kararlar, raporlar ve entegrasyon sahibidir. Worker başka worker açmaz. Teslim başına 15 dakika + bir hedefli 5 dakika onarım bütçesi kullanılır.

**Kanıt sınırı:** Foundation build ve kaynak incelemesi yapıldı. Uygulama akışı, PDF çıktıları, runtime ağ trafiği, fiziksel telefon performansı veya kapasite test edilmedi; test eklenmedi/çalıştırılmadı. Production dağıtımı yapılmadı. Core/UI teslimleri henüz kabul edilmiş değildir.

## 2026-09-30 — Proje öncesi Markdown düzeni

**Sonuç:** PDF Divider için başlangıç belgeleri ürün yönüne göre düzenlendi. Bu çalışma yalnız Markdown dosyalarını kapsadı; uygulama, build, test veya deploy yapılmadı.

- `AGENTS.md` ve `claude.md` eş ajan talimatları olarak oluşturuldu; karar ve belge routing'i ile yalnızca onaylı sınırlar yazıldı.
- `README.md`, `brief.md`, `const.md`, `hosting.md` ve `specs/README.md` başlangıç haritası ve karar kaynakları olarak hazırlandı.
- Önceden var olan `cloud.md`, `hosting.md` adına taşındı ve hosting içeriği sağlayıcı seçilmiş gibi görünmeyecek şekilde düzeltildi. Cloudflare Pages yalnızca önceki notta geçen aday olarak işaretli.
- `specs/01-mvp-scope.md` mevcut taslak olduğu açıkça belirtilerek belirsiz akış ayrıntıları onaylı kararlardan ayrıldı.
- `agent-loop/` içine yalnızca IDLE hazırlık README'si, active run durumu ve handoff şablonu eklendi.

**Açık kararlar:** framework, hosting sağlayıcısı, domain, kesin dosya/sayfa limitleri, indirme biçimi, ayrıntılı iş akışı ve destek kapsamı.

**Doğrulama:** Önceki PDFDivider Markdown dosyaları düzenleme öncesinde okundu. Yeni belge bağlantıları ve dosya hedefleri yazım sonrası kontrol edildi; AGENTS/claude eşliği kontrol edildi. Markdown bağlantı çözümleme taraması yapıldı. Bu doğrulama uygulama davranışı veya kod kalitesi hakkında kanıt değildir.

## Düzeltme — Onaylı yön ve taslak ayrıntılarını ayırma

**Tarih:** 2026-09-30

Üst düzey ürün akışı tekrar açıkça kaydedildi: tek PDF seçme, sayfa sınırlarını belirleme ve ayrı PDF çıktıları indirme; ücretsiz kullanımda hesap/paywall olmaması. MVP dışı kapsamına birleştirme, dönüştürme, OCR, düzenleme, bulut saklama ve native uygulamalar geri eklendi. Önceki taslaktaki altı kabul ölçütü “ayrıntılandırılacak” olarak korundu. Görsel seçim, ZIP/tek tek indirme, kesin limitler ve özel PDF özellikleri taslak/açık bırakıldı.

`README.md`, `brief.md`, `const.md`, `AGENTS.md`, `claude.md`, `specs/README.md` ve `specs/01-mvp-scope.md` durum ifadeleri eşitlendi: ürün yönü onaylı, ayrıntılı spec taslak. Talimat dosyalarındaki mevcut Markdown hazırlığı notu kalıcı kodlama yasağı olmaktan çıkarıldı; sonraki kodlama talebi aşamayı ilerletir.

**Kaynak düzen örnekleri:** [RKWebsite agents.md](../RKWebsite/agents.md), [claude.md](../RKWebsite/claude.md), [brief.md](../RKWebsite/brief.md), [const.md](../RKWebsite/const.md), [notes.md](../RKWebsite/notes.md), [specs/README.md](../RKWebsite/specs/README.md), [agent-loop/README.md](../RKWebsite/agent-loop/README.md), [agent-loop/active-run.md](../RKWebsite/agent-loop/active-run.md), [agent-loop/handoff-template.md](../RKWebsite/agent-loop/handoff-template.md) ve [agent-loop/roles/orchestrator.md](../RKWebsite/agent-loop/roles/orchestrator.md).

**Kanıt:** Parent'ın son dosya taramasında 12 Markdown dosyası bulundu; Markdown dışında dosya yok. `AGENTS.md` ve `claude.md` byte düzeyinde eş, bozuk yerel Markdown bağlantısı 0 ve `cloud.md` mevcut değil. Ürün yönü/kabul ölçütleri doğrudan okundu; ayrıntılı tercihler açık kalıyor. Kod, build, uygulama testi veya deploy yapılmadı.

**Koordinasyon:** `codex-orchestrator` ile 1 GPT-6 Luna worker kullanıldı; parent incelemesinden sonra 1 hedefli belge düzeltmesi yapıldı. Son entegrasyon ve doğrulama parent tarafından tamamlandı.
