# Teknik uygulama kararları

2026-09-30: Kullanıcı spec'lerden sonra implementation order ve orkestrasyon loop'u ile geliştirmeye başlanmasını istedi. Aşağıdaki rutin teknik seçimler bu yetkiyle yapıldı; kapasite ölçümü yapılmadı.

## Yığın

- TypeScript + Vite; küçük tek araç için UI framework'ü eklenmedi. Statik dosya çıktısı herhangi bir uygun statik hosta taşınabilir. [Vite rehberi](https://vite.dev/guide/)
- npm ve kilit dosyası; mevcut Node 22.23.2, Vite'ın Node gereksinimini karşılıyor.
- pdf-lib: ayrı module Web Worker'da load/copyPages/save. Sayfaları resimleştirerek PDF üretme yok. Şifreli PDF için ignoreEncryption kullanılmaz. [pdf-lib API](https://pdf-lib.js.org/docs/api/classes/pdfdocument)
- fflate: ZIP üretimi aynı worker içinde; UI üzerinde ZIP hesaplama yapılmaz. PDF zaten sıkıştırılmış olabileceği için ZIP store yaklaşımı tercih edilir. [fflate](https://github.com/101arrowz/fflate)
- PDF.js, thumbnail üretimi, harici font servisi ve analytics ilk sürüme eklenmez. Metin tabanlı sayfa ve çıktı özeti tam işlevlidir.

## Tipografi — 2026-09-30

Kullanıcının [Roboto tercihi](https://www.dafont.com/roboto.font) tüm metne uygulanır. Yalnız dik Regular 400, Medium 500 ve Bold 700 kullanılır; Thin ve italic dosyaları eklenmez. Dafont arşivindeki 2011 Version 1.00000 TTF dosyaları FontTools ile tüm glifler korunarak WOFF2'ye çevrildi; Türkçe harf kapsamı ve ağırlık metadata'sı statik olarak incelendi. Üç font toplam 160.604 bayttır.

Fontlar `src/assets/fonts/` içinden Vite tarafından hash'li uygulama varlıklarına çevrilir. `font-display: swap` ve sans-serif fallback kullanılır; üçüncü taraf font/CDN isteği eklenmez. Arşivin kullanım izni [NOTICE.txt](src/assets/fonts/NOTICE.txt) içinde aynen korunur ve `public/font-notices/roboto-NOTICE.txt` üzerinden yayın çıktısına eklenir; kaynak/sürüm bilgisi [font kaydında](src/assets/fonts/README.md) tutulur.

## Minimal görünüm ve cihaz teması — 2026-09-30

Kullanıcı Untitled UI'nin nötr dosya kartı düzenini seçti. Mevcut HTML/CSS, yerel Roboto ve SVG ile tek merkez panel uygulanır; yeni UI/animasyon paketi eklenmez. PDF yüklendikten sonra mod ve sayfa seçimi kontrolleri açılır. Destek ve kapasite bilgileri açılabilir bölümlerdedir.

`src/theme.ts` cihaz/açık/koyu seçeneklerini yönetir; cihaz varsayılandır. `matchMedia('(prefers-color-scheme: dark)')` change olayı cihaz tercihinde görünümü günceller; elle seçilen tercih otomatik OS değişimiyle ezilmez. `pdfdivider-theme` localStorage anahtarı güvenli okuma/yazma ve storage olayı ile sekmeler arasında eşitlenir; storage engelinde tema seçimi bellekte çalışır. `index.html` başında yüklenen `public/theme-init.js`, CSS/uygulama beklenirken renkleri belirler. Native color-scheme ve theme-color aynı renklerle güncellenir. [MDN matchMedia](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia), [change olayı](https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/change_event), [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

## Netlify güvenlik başlıkları — 2026-10-02

`netlify.toml` tüm statik yollar için CSP, çerçevelemeyi engelleyen başlıklar, `nosniff`, `no-referrer` ve kullanılmayan cihaz/ödeme API'leri için izin kısıtları uygular. CSP yalnız aynı origin'deki script, stil, font, görsel ve PDF worker'ına izin verir; ağ bağlantısı, nesne gömme ve form gönderimini kapatır. Başlangıç teması inline script'ten yerel `public/theme-init.js` dosyasına taşındı; böylece `script-src 'self'` için `unsafe-inline` gerekmez. Netlify'ın mevcut HSTS başlığı yeniden tanımlanmaz.

## Güncel kapasite politikası

Kullanıcının güncel 2026-09-30 kararıyla kaynak PDF, üretilmiş PDF'lerin toplamı ve ZIP dosyası **ayrı ayrı 1.500.000.000 bayt (ondalık 1,5 GB)** ile sınırlanır. Giriş boyutu UI ve worker'da, toplam PDF boyutu worker ve indirme hazırlığında, ZIP tahmini/gerçek boyutu worker ve indirme hazırlığında kontrol edilir. Kullanıcı sayfa ve çıktı sayısı sınırlarını da kaldırdı; 300 kaynak sayfası, 100 çıktı, 1000 kopyalanan sayfa, 4096 seçim karakteri, 512 seçim öğesi ve 100 grup guard'ları kaldırıldı. Sayfa numarasının pozitif güvenli tam sayı olması, kaynak sayfa aralığına uyması ve seçim dilbilgisi doğrulanır. Her load/extract isteği için mevcut 120 saniye zaman aşımı ve kullanıcı iptali uygulanır. Bu politika parser veya toplam tarayıcı belleğine garanti vermez.

Gerçek düşük donanımlı iOS/Android cihaz ölçümleri yapılmadan bu rakamlarla production kapasitesi veya tarayıcı desteği vaat edilmez. Ölçüm planı [spec 03](specs/03-mobile-performance.md) içindedir; yayın kapısı açıktır.

Önceki 50 MiB birleşik PDF+ZIP ve 100 MiB Blob yerleşim guard'ları kaldırıldı; aynı verinin PDF ve ZIP içinde tutulması, yeni 1,5 GB boyut politikasını yarıya indirmez. PDF toplamı ile ZIP ayrı denetlenir. ZIP oluşturulmadan önce arşiv başlıkları/dosya adları dahil üst sınır hesaplanır; ardından gerçek ZIP boyutu kontrol edilir. Kaynak, parse edilmiş PDF, üretilmiş PDF'ler, ZIP ve Blob kopyaları eşzamanlı tutulabileceğinden toplam bellek tek dosyanın boyutundan fazla olabilir. Bu değerler gerçek cihazda ölçülmüş kapasite değildir.

## Davranış

Varsayılan mod seçilen sayfaları tek PDF yapar. Çoklu çıktılarda ZIP ana seçenek; her dosyayı ayrı indirme de sunulur. Tekilleştirilen seçim kullanıcıya bildirilir. Aynı çıktı içindeki sayfalar kaynak sırasını izler. Şifreli, imzalı ve etkileşimli formlu belgeler ilk sürümde reddedilir. Bozuk PDF için anlaşılır hata gösterilir. Yer imleri, etiketler ve açıklamaların korunacağı garanti edilmez; işlem öncesi açıklanır.

İptal/yeni dosya/sıfırlama worker'ı sonlandırır ve eski sonuçları geçersiz kılar; geçici indirme URL'leri bırakılır. Belge, dosya adı ve metadata ağ isteğine veya analitiğe gönderilmez. Uygulama varlıkları hosttan yüklenir. Production dağıtımı ve domain henüz seçilmedi.
