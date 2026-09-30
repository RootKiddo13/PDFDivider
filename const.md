# PDF Divider — Onaylı Kararlar

Bu dosya kullanıcı tarafından onaylanan üst düzey ürün yönünü kaydeder. Uygulama ayrıntısı taslaklarını sabit karar gibi göstermez.

- Ürün adı: **PDF Divider**.
- Güncel kapasite kararı (2026-09-30): Kaynak PDF, oluşturulan PDF'lerin toplamı ve ZIP dosyası ayrı ayrı en fazla **1,5 GB (1.500.000.000 bayt)** olabilir. Kullanıcı sayfa ve çıktı sayısı sınırlarının da kaldırılmasını istedi; bunları dolaylı sınırlayan seçim/grup/kopyalama adet engelleri kaldırılır. Bu politika cihazda doğrulanmış kapasite garantisi değildir.
- Güncel onaylı arayüz yönü: Kullanıcı [Untitled UI dosya kartı referansını](https://dribbble.com/shots/18890140-Upload-file-modal-Untitled-UI) seçti. Nötr açık/koyu renkler, ortada tek işlem kartı, küçük başlık ve sade kontroller uygulanır. Varsayılan cihaz teması otomatik izlenir; kullanıcı açık/koyu/cihaz temasını seçebilir ve seçim tarayıcıda saklanır. Önceki turuncu/bordo [konsept](design/approved-concept-v1.png) geçmiş referanstır.
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
