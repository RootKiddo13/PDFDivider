# PDF Divider

PDF Divider, tek PDF'den istediğiniz sayfaları çıkaran ve belgeyi bölen ücretsiz bir web uygulamasıdır. PDF tarayıcıdaki worker'da işlenir; dosya uygulama sunucusuna yüklenmez veya orada saklanmaz.

## Durum

İlk MVP kodu yazıldı; üç spec, uygulama sırası ve loop kayıtları güncel. Tip kontrolü/production build geçti ve çekirdek/arayüz bağımsız kaynak incelemesinden geçti. Gerçek PDF akışı, fiziksel telefonlarda kapasite/uyumluluk ölçümü ve production yayını yapılmadı. Durum [active-run](agent-loop/active-run.md), kanıtlar [teslim raporu](reports/2026-09-30-initial-implementation.md) içindedir.

## Başlangıç belgeleri

- [AGENTS.md](AGENTS.md) — çalışma talimatları ve kaynak haritası; [claude.md](claude.md) ile eş içerik.
- [const.md](const.md) — onaylı kararlar.
- [brief.md](brief.md) — ürün özeti.
- [reports.md](reports.md) — rapor merkezi ve çalışma kayıtları.
- [hosting.md](hosting.md) — veri akışı, hosting seçenekleri ve yayın kapıları.
- [specs/README.md](specs/README.md) — spec haritası ve hazırlık durumu.
- [specs/01-mvp-scope.md](specs/01-mvp-scope.md) — onaylı üst düzey yönü koruyan ayrıntılı çalışma taslağı.
- [agent-loop/README.md](agent-loop/README.md) — implementation loop hazırlık protokolü.
- [Uygulama sırası](agent-loop/implementation-order.md) — bağımlı geliştirme dilimleri.
- [Teknik kararlar](technical-decisions.md) — yığın ve geçici geliştirme korumaları.

## Çalıştırma

Node 22.12+ veya Vite'ın desteklediği daha yeni Node sürümü gerekir. `npm ci`, ardından `npm run dev` ile yerel geliştirme önizlemesi açılır. `npm run build` tip kontrolü ve statik production çıktısını `dist/` içine üretir. `npm run preview` bu çıktıyı yerelde sunar. Ürünün hedefi internette yayınlanan statik web uygulamasıdır; yerel komutlar geliştirme içindir.

Kullanıcı ayrıca istemedikçe otomatik test eklenmez/çalıştırılmaz. Derleme ve statik inceleme, gerçek PDF akışı veya gerçek telefon ölçümü yerine geçmez. Cloudflare Pages Free + Git entegrasyonu ile [PDF Divider yayında](https://pdfdivider.pages.dev/); GitHub'daki özel `RootKiddo13/PDFDivider` deposunun `main` dalı otomatik CI yayını yapar. Bölünmüş PDF SVG logo `public/favicon.svg` adresinde sunulur. [Yayın kaydı](reports/2026-09-30-github-sync-and-ci-publish.md) ve [hosting planı](hosting.md) günceldir.
