# PDF Divider — Hosting ve Veri Akışı Planı

**Durum:** TypeScript/Vite statik web uygulaması için ücretsiz yayın seçenekleri 2026-09-30'da incelendi. **Cloudflare Pages Free öneridir; kullanıcı tarafından kesinleştirilmiş sağlayıcı, domain veya production yayını yoktur.** Karşılaştırma ve kaynaklar [araştırma raporunda](reports/2026-09-30-free-hosting-research.md).

## Ürün veri akışı

Kararlaştırılmış yön, seçilen PDF'nin her ziyaretçinin tarayıcısındaki worker'da işlenmesidir. Uygulama statik dosyalardan dağıtılacak; PDF upload/backend/storage eklenmez. Gizlilik metni ve teknik tasarım gerçek ağ trafiğiyle uyumlu olmalı; belge içeriği, dosya adı ve PDF metadata'sı analitik veya uygulama loglarına girmemelidir. Kaynak incelemesi ile runtime ağ kontrolünün kanıtları ayrı raporlanmalıdır.

## Hosting yönü

- Tarayıcı içi PDF işleme, PDF verisini almak veya işlemek için uygulama backend'i gerektirmez.
- Statik web hosting uygun yöndür; PDF işleme için ücretli uygulama sunucusu gerekmez.
- **Öneri: Cloudflare Pages Free + GitHub'da özel proje deposu + ücretsiz `*.pages.dev` adresi.** Kaynak repo şu an Git deposu değildir; repo/Cloudflare projesi henüz oluşturulmadı veya bağlanmadı.
- Git entegrasyonu her push için build ve dağıtım sağlar; ilk üretim yayını için `npm run build`, çıktı `dist`, repo kökü (Root directory alanı boş), üretim dalı `main` olarak planlanır. Cloudflare v3 build ortamının varsayılan Node 22.16.0 sürümü mevcut Vite gereksinimi `^20.19.0 || >=22.12.0` ile uyumludur. Yeniden üretilebilirlik gerekirse `NODE_VERSION` pinlenebilir.
- İlk proje yolu seçimi önemlidir: Cloudflare [Direct Upload projesini sonradan Git entegrasyonuna dönüştürmüyor](https://developers.cloudflare.com/pages/get-started/direct-upload/). Güncelleme loop'u için Git entegrasyonu önerilir. Git hesabı kullanmak istenmezse Direct Upload ayrı seçenek olarak kalır.
- `pages.dev` adresi ilk sürüm için yeterlidir; alan adı satın alma veya DNS değişikliği gerekmez. Özel alan adı ileride ayrı karardır.
- Bu öneri, sağlayıcıyı kullanıcı onayı verilmiş bir ürün kararı olarak `const.md` içine taşımaz.

## Yayına hazırlık sırası — öneri

1. Açık sayfa sırası bildiriminin kaynak PDF ve girdiyle sonucunu belirle; PDF çıkarma/bölme, ZIP/tekil indirme, iptal ve gizlilik ağ akışını tarayıcıda doğrula. Telefon ve düşük donanım sınırları için gerçek cihaz ölçümünü tamamla; ölçülmeyen limitleri vaat etme.
2. Proje için özel GitHub deposu aç, kaynakları gözden geçir ve `node_modules/`, `dist/`, gerçek kullanıcı PDF'leri veya sırları commit etme. Mevcut `.gitignore` ilk iki klasörü zaten dışlar. Repo kurulumu henüz yapılmadı.
3. Cloudflare Pages Free hesabında Git deposunu bağla. Build komutu `npm run build`, build çıkışı `dist`, Root directory alanı boş (repo kökü), üretim dalı `main`. İsteğe bağlı `NODE_VERSION=22.23.2` yerel build ile aynı sürümü sabitler.
4. Kullanıcı production yayını istediğinde ilk `*.pages.dev` dağıtımını yap. Açılan URL'de HTML/CSS/font/worker yüklenmesini, gerçek PDF akışlarını ve PDF byte'larının siteye gönderilmediğini doğrula. Sorun varsa sürümü düzelt ve yeniden dağıt.
5. Kullanıcı isterse daha sonra özel domain, DNS ve ücretini ayrıca kararlaştır. İşlev gereği Pages Functions, R2, veritabanı, depolama veya analitik ekleme.

Cloudflare Free sınırları 2026-09-30 araştırmasında 500 build/ay, 20.000 dosya/site ve 25 MiB/tek varlık olarak belgelenmişti. Mevcut `dist/` 8 dosya, toplam 638.615 bayt; en büyük varlık PDF worker 441.159 bayt. Bu teknik uygunluk hesabı gerçek yayının veya trafik/cihaz performansının doğrulanması değildir. [Resmi limitler](https://developers.cloudflare.com/pages/platform/limits/), [statik istek fiyatlandırması](https://developers.cloudflare.com/pages/functions/pricing/), [build ortamı](https://developers.cloudflare.com/pages/configuration/build-image/).

## Kapasite ve maliyet

Kullanıcının ücretsiz erişimi sınırsız işlem veya kapasite garantisi değildir. Dosya boyutu ve sayfa sayısı limitleri hedef tarayıcı/cihazlarda yapılacak ölçümden sonra belirlenecektir. Henüz ölçüm, limit değeri veya desteklenen cihaz listesi yoktur.

## Yayın öncesi kontrol başlıkları

1. Önerilen Cloudflare Pages Free yolunu ve Git/Direct Upload tercihini yayın öncesinde netleştir; ücretsiz `pages.dev` adresiyle özel domain maliyeti ertelenebilir.
2. Kapasite limitlerini ölçüm kanıtıyla belirle.
3. Normal ve hata akışında PDF verisinin tarayıcıdan çıkmadığını doğrula.
4. Gizlilik açıklamalarını gerçek ağ/veri akışıyla karşılaştır.
5. Desteklenen tarayıcıları, hata davranışını ve indirme biçimini netleştir.
6. Production yayını veya DNS değişikliğinden önce açık kullanıcı onayı al.

Önceki `cloud.md` içeriği bu dosyaya taşınarak sağlayıcı ve fiyat iddiaları karar gibi görünmeyecek biçimde düzenlendi.
