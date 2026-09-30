# Mobil bağlantı hatası ve backend incelemesi — 2026-09-30

1. Gönderilen ekran görüntüsünde mobil Chrome `pdfdivider.pages.dev` açılırken `ERR_CONNECTION_RESET` gösteriyor; ilk HTML yerine bağlantı hatası ekranı var.
2. Bu belirti yavaş yüklenen ilk içerikten farklıdır: tarayıcı HTTP sayfa yanıtını göstermeden önce bağlantı kesiliyor.
3. PDF Divider'ın backend/API sunucusu yoktur; Cloudflare Pages yalnız statik site dosyalarını yayımlar.
4. PDF dosyası uygulama kodunda aynı origin'den başlatılan Web Worker'a verilir ve sayfalar ziyaretçinin tarayıcısında işlenir (`src/main.ts`, `src/pdf.worker.ts`).
5. Son Pages production dağıtımının CI logu build ve asset yayınının başarılı olduğunu gösteriyor; PDF işleme için Pages Function tanımlı değildir.
6. Kontrol anında Cloudflare Status, Pages bileşenini Operational gösteriyordu ([durum sayfası](https://www.cloudflarestatus.com/services)).
7. Aynı gün Madrid'de ağ performansı olayı Monitoring durumundaydı; bunun bu telefondaki hataya sebep olduğu kanıtlanmış değildir ([olay kaydı](https://www.cloudflarestatus.com/incidents/fs7dz54l226c)).
8. Bu Windows bağlantısı `pdfdivider.pages.dev` DNS kayıtlarını çözdü ama doğrudan TLS isteği reset aldı; Codex in-app browser ise canlı ana sayfayı ve favicon'u açtı.
9. Kanıtlar kod/backend arızasından çok telefona giden DNS, operatör, proxy veya Cloudflare edge ağ yolunu işaret ediyor; mobil ağ testi olmadan kök neden kesinleşmiyor.
10. Sonraki ayrım için aynı telefonda Wi-Fi ve mobil veriyle ana sayfayı, ardından `https://pdfdivider.pages.dev/favicon.svg?v=1` adresini karşılaştır; bu incelemede kod değiştirilmedi.
