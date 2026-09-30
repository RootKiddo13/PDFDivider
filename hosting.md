# PDF Divider — Hosting ve Veri Akışı Planı

**Güncel yayın:** Mobil Pages erişim sorunu üzerine aynı statik build, kullanıcı tarafından telefonunda açıldığı doğrulanan Netlify yolunda claim edilip kalıcı/public yayımlandı: **[pdfdivider.netlify.app](https://pdfdivider.netlify.app/)**. Şifresiz sayfa/worker HTTP 200. Netlify Git CI henüz bağlı değil; yerel netlify.toml hazır. [Güncel erişim raporu](reports/2026-09-30-pages-access-followup.md).

**Önceki yayın:** Kullanıcı 2026-09-30'da Cloudflare Pages Free + GitHub CI yayınını yetkilendirdi; özel RootKiddo13/PDFDivider deposu main üzerinden otomatik dağıtılıyor. `pdfdivider.pages.dev` ve Cloudflare CI duruyor fakat kullanıcının telefonunda erişim sorunlu. Hosting karşılaştırması [araştırma raporunda](reports/2026-09-30-free-hosting-research.md).

## Ürün veri akışı

Son kod yayını: [1,5 GB boyut politikası](reports/2026-09-30-1_5gb-size-policy.md). Kaynak PDF, PDF toplamı ve ZIP ayrı ayrı 1,5 GB; sayfa/çıktı/grup/seçim adet engelleri kaldırıldı. Build ve elle Netlify production yayını doğrulandı. 120 saniye işlem süresi ve gerçek cihaz kapasitesi ölçümü ayrıdır.

Kararlaştırılmış yön, seçilen PDF'nin her ziyaretçinin tarayıcısındaki worker'da işlenmesidir. Uygulama statik dosyalardan dağıtılacak; PDF upload/backend/storage eklenmez. Gizlilik metni ve teknik tasarım gerçek ağ trafiğiyle uyumlu olmalı; belge içeriği, dosya adı ve PDF metadata'sı analitik veya uygulama loglarına girmemelidir. Kaynak incelemesi ile runtime ağ kontrolünün kanıtları ayrı raporlanmalıdır.

## Hosting yönü

2026-09-30 erişim çözümü: Netlify claim/Public tamamlandı; Drop süresi/şifresi kalktı ve anlaşılır kalıcı URL verildi. Netlify CI, GitHub düğmesinin kullanıcı tarafından açılıp gerekli repo izninin incelenmesini bekliyor. Aşağıdaki Cloudflare CI ayarları eski yayın yolunun kaydıdır.

- Tarayıcı içi PDF işleme, PDF verisini almak veya işlemek için uygulama backend'i gerektirmez.
- Statik web hosting uygun yöndür; PDF işleme için ücretli uygulama sunucusu gerekmez.
- **Uygulanan yol: Cloudflare Pages Free + GitHub'da özel proje deposu + ücretsiz `pdfdivider.pages.dev` adresi.** Cloudflare Pages projesi `pdfdivider`; production branch `main`; otomatik dağıtımlar açık.
- Git entegrasyonu her push için build ve dağıtım sağlar; ilk üretim yayını için `npm run build`, çıktı `dist`, repo kökü (Root directory alanı boş), üretim dalı `main` olarak planlanır. Cloudflare v3 build ortamının varsayılan Node 22.16.0 sürümü mevcut Vite gereksinimi `^20.19.0 || >=22.12.0` ile uyumludur. Yeniden üretilebilirlik gerekirse `NODE_VERSION` pinlenebilir.
- İlk proje yolu seçimi önemlidir: Cloudflare [Direct Upload projesini sonradan Git entegrasyonuna dönüştürmüyor](https://developers.cloudflare.com/pages/get-started/direct-upload/). Güncelleme loop'u için Git entegrasyonu önerilir. Git hesabı kullanmak istenmezse Direct Upload ayrı seçenek olarak kalır.
- `pages.dev` adresi ilk sürüm için yeterlidir; alan adı satın alma veya DNS değişikliği gerekmez. Özel alan adı ileride ayrı karardır.
- Bu yayın yolu kullanıcı tarafından yetkilendirildi ve `const.md` içine işlendi; gerçek dağıtım sonucu ayrıca doğrulanacak.

## Yayına hazırlık sırası — öneri

1. Özel GitHub deposu açıldı; `.gitignore` node_modules, dist, `.env*` ve PDF dosyalarını dışlıyor. İlk commit/push tamamlandı. Kaynakta sır, özel PDF veya uzak upload çağrısı için statik engel bulunmadı.
2. Cloudflare Pages Free hesabında Git deposunu bağla. Build komutu `npm run build`, build çıkışı `dist`, Root directory alanı boş (repo kökü), üretim dalı `main`. İsteğe bağlı `NODE_VERSION=22.23.2` yerel build ile aynı sürümü sabitler.
3. İlk `*.pages.dev` CI dağıtımı başarılı; Cloudflare build logunda TypeScript/Vite derlemesi, 8 dosya yüklemesi ve "Assets published" görüldü. Canlı sayfa Codex in-app browser'da açıldı ve düzen göründü. PDF worker'ın gerçek PDF işlem akışı, telefon uyumluluğu ve kapasite henüz doğrulanmadı; ölçülmeyen rakamları garanti gibi sunma.
4. Açık sayfa sırası bildirimini kaynak PDF/girdiyle sonuçlandır; PDF çıkarma/bölme, ZIP/tekil indirme, iptal ve gizlilik ağ akışını gerçek tarayıcıda doğrula. Telefon ve düşük donanım sınırlarını kullanıcı mobil testinden gelen kanıtla güncelle.
5. Kullanıcı isterse daha sonra özel domain, DNS ve ücretini ayrıca kararlaştır. İşlev gereği Pages Functions, R2, veritabanı, depolama veya analitik ekleme.

Cloudflare Free sınırları 2026-09-30 araştırmasında 500 build/ay, 20.000 dosya/site ve 25 MiB/tek varlık olarak belgelenmişti. Mevcut `dist/` 8 dosya, toplam 638.615 bayt; en büyük varlık PDF worker 441.159 bayt. Bu teknik uygunluk hesabı gerçek yayının veya trafik/cihaz performansının doğrulanması değildir. [Resmi limitler](https://developers.cloudflare.com/pages/platform/limits/), [statik istek fiyatlandırması](https://developers.cloudflare.com/pages/functions/pricing/), [build ortamı](https://developers.cloudflare.com/pages/configuration/build-image/).

## Kapasite ve maliyet

Kullanıcının ücretsiz erişimi sınırsız işlem veya kapasite garantisi değildir. Dosya boyutu ve sayfa sayısı limitleri hedef tarayıcı/cihazlarda yapılacak ölçümden sonra belirlenecektir. Henüz ölçüm, limit değeri veya desteklenen cihaz listesi yoktur.

2026-09-30 mobil `ERR_CONNECTION_RESET` incelemesi: uygulama statik Pages varlıklarından oluşur, Pages Function/backend bulunmaz. Son CI deploy başarılı ve Pages status Operational idi. Windows curl DNS çözümlemesinden sonra TLS'de reset alırken Codex in-app browser sayfayı açtı. Ayrıntı `reports/2026-09-30-mobile-connection-investigation.md`; mobil Wi-Fi/operatör karşılaştırması olmadan kök neden belirlenmedi.

## Yayın öncesi kontrol başlıkları

1. Cloudflare Pages Free + Git entegrasyonu tamamlandı; ücretsiz `pages.dev` kullanılıyor ve özel domain maliyeti ertelendi. Sonraki commit'ler CI dağıtımı tetikler.
2. Kapasite limitlerini ölçüm kanıtıyla belirle.
3. Normal ve hata akışında PDF verisinin tarayıcıdan çıkmadığını doğrula.
4. Gizlilik açıklamalarını gerçek ağ/veri akışıyla karşılaştır.
5. Desteklenen tarayıcıları, hata davranışını ve indirme biçimini netleştir.
6. İlk ücretsiz `pages.dev` production yayını tamamlandı; özel domain/DNS veya ücretli kaynak için ayrıca karar al.

Önceki `cloud.md` içeriği bu dosyaya taşınarak sağlayıcı ve fiyat iddiaları karar gibi görünmeyecek biçimde düzenlendi.
