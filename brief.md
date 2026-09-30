# PDF Divider — Brief

**Durum:** Ürün yönü onaylandı; üç spec üzerinden implementation başlangıcı yetkilendirildi.

## Ürün amacı

PDF Divider, ziyaretçilerin PDF belgelerinden istedikleri sayfaları çıkarmasını ve belgeleri bölmesini sağlayan ücretsiz, herkese açık bir web uygulamasıdır. Telefonlar ve düşük donanımlı cihazlar temel hedeflerdir.

## Onaylı üst düzey yön

- Ziyaretçi tek bir PDF seçer; tek sayfa, aralık, dağınık veya karışık sayfa seçimi ya da bölme sınırlarını belirleyerek PDF çıktıları indirir.
- Tüm sayfaları çıkarma ve klasik bölme akışları da desteklenir. Çıktıların tek dosya veya ayrı gruplar olarak sunulmasının ayrıntıları ilgili spec'te tanımlanır.
- Mobil kullanım ve düşük donanımda optimizasyon, sonradan eklenecek bir iyileştirme değil temel gereksinimdir.
- Ücretsiz kullanım için hesap veya paywall gerekmez.
- Uygulama web üzerinden herkese açık biçimde yayımlanacaktır.
- PDF işleme her ziyaretçinin tarayıcısında yapılır. PDF uygulama sunucusuna yüklenmez veya uygulama tarafından saklanmaz.
- Ücretsiz olması sınırsız kapasite vaadi değildir. Dosya boyutu ve sayfa kapasitesi ölçümden sonra belirlenecektir.
- Birleştirme, dönüştürme, OCR, belge düzenleme, bulut saklama ve yerel masaüstü/mobil uygulamalar MVP dışındadır.

## Açık uygulama ayrıntıları

TypeScript/Vite/npm, pdf-lib worker ve fflate uygulama seçimleridir. Tek çıktı PDF, çoklu çıktı ZIP ve tekil indirme seçenekleriyle sunulur. Özel PDF davranışı spec 02'de tanımlıdır. Hosting, domain, gerçek cihaz ölçümleriyle belirlenecek kapasite, minimum destek kapsamı ve yayın zamanı açık kalır. Ayrıntılar [teknik kararlar](technical-decisions.md) içindedir.

Ayrıntılı akış ve kabul ölçütleri [spec haritası](specs/README.md), bağımlı aşamalar [uygulama sırası](agent-loop/implementation-order.md), gerçek çalışma durumu [active-run](agent-loop/active-run.md) üzerinden takip edilir.
