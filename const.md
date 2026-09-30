# PDF Divider — Onaylı Kararlar

Bu dosya kullanıcı tarafından onaylanan üst düzey ürün yönünü kaydeder. Uygulama ayrıntısı taslaklarını sabit karar gibi göstermez.

- Ürün adı: **PDF Divider**.
- Onaylı arayüz yönü: [tasarım referansı](design/approved-concept-v1.png) gibi turuncudan bordoya geçen zemin, krem Roboto başlıklar, altın belge işareti ve koyu araç paneli. Masaüstünde iki sütun, mobilde alt alta akış; telefon çerçevesi ve örnek alan adı gerçek arayüz öğesi değildir.
- 2026-09-30 tipografi tercihi: site genelinde **Roboto** kullanılır; Thin ve italic kullanılmaz. Ağırlıkların hiyerarşisini uygulama belirler; seçilen Regular 400, Medium 500 ve Bold 700 teknik karar belgesindedir.
- Ürün, herkese açık yayımlanacak bir web uygulamasıdır.
- 2026-09-30 yayın kararı: ücretsiz Cloudflare Pages üzerinde `pages.dev` adresiyle GitHub'daki özel PDFDivider deposundan CI build ve production yayını kurulacak; kullanıcı ilk yayından sonra telefonundan deneyecek. Özel domain bu aşamada yoktur.
- Kullanımın üst düzey akışı: tek PDF seçme → sayfaları/aralıkları veya bölme sınırlarını belirleme → PDF çıktıları indirme.
- Tek sayfa, dahil sayfa aralığı, dağınık sayfa listesi, karışık aralık/liste ve tüm sayfaların çıkarılması desteklenecek; klasik PDF bölme korunacak.
- Telefonlarda ve düşük donanımlı cihazlarda kullanılabilirlik ve performans temel ürün gereksinimidir.
- Ücretsiz kullanımda kullanıcı hesabı veya paywall gerekmez.
- PDF işleme her ziyaretçinin tarayıcısında yapılır; PDF uygulama sunucusuna yüklenmez veya orada saklanmaz.
- Kullanıcı için ücretsizdir; dosya boyutu ve sayfa kapasitesi ölçümle belirlenecek, sınırsızlık sözü verilmeyecektir.
- Birleştirme, dönüştürme, OCR, belge düzenleme, bulut saklama ve yerel masaüstü/mobil uygulamalar MVP kapsamı dışındadır.

Kullanıcı 2026-09-30 tarihinde implementation order ve orkestrasyon loop'u ile geliştirmeyi başlatmayı, ardından Cloudflare Pages Free üzerinden GitHub CI ile ilk yayını yetkilendirdi. Rutin teknik tercihler [technical-decisions.md](technical-decisions.md), seçim/indirme davranışı spec 02 içindedir. Özel domain, ölçülmüş kapasite ve minimum cihaz desteği açık kalır. Önceki 50 MB / 300 sayfa önerisi doğrulanmış yayın limiti değildir.
