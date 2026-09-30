# Ücretsiz yayın araştırması — 2026-09-30

## Karar özeti

PDF Divider yalnız statik Vite çıktısı sunar; kullanıcı PDF'si ve üretilen dosyalar tarayıcı worker'ında kalır. Bu yapı için **Cloudflare Pages Free + Git entegrasyonu + `*.pages.dev`** önerilir. Hosting sağlayıcısı ve production dağıtımı henüz onaylanmadı/oluşturulmadı. Ücretsiz statik yayın, kullanıcının telefonunda sınırsız PDF kapasitesi anlamına gelmez.

| Seçenek | Resmi ücretsiz koşul ve uygunluk | Bu proje için değerlendirme |
| --- | --- | --- |
| Cloudflare Pages Free | 500 build/ay, 20.000 dosya/site, 25 MiB/varlık; Functions kullanılmadığında statik varlık istekleri ücretsiz ve sınırsız. Ücretsiz `*.pages.dev` adresi. [Limitler](https://developers.cloudflare.com/pages/platform/limits/), [statik istekler](https://developers.cloudflare.com/pages/functions/pricing/), [Git kurulumu](https://developers.cloudflare.com/pages/get-started/git-integration/) | Önerilen yol. PDF için backend gerekmez; sürekli küçük statik varlık servisinde kredi kotası yok. Hizmet sürekliliği veya kullanıcı cihaz kapasitesi garantisi çıkarılamaz. |
| Netlify Free | Yeni kredi planında 300 kredi/ay; build, bant genişliği ve istekler kredi tüketir, aylık bakiye tükenirse siteler dönem sonuna kadar duraklar. Ticari projelere izin verdiğini açıkça belirtir. [Kredi kuralları](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/), [Free plan](https://www.netlify.com/blog/introducing-netlify-free-plan/) | Çalışır, ancak trafik ve dağıtım kredisi nedeniyle ücretsiz kullanım daha öngörülemez. |
| GitHub Pages | Ücretsiz GitHub planında kaynak depo public olmalı; 1 GB site, yumuşak 100 GB/ay bant genişliği sınırı. Ticari SaaS/işletme hostu olarak kullanımına kısıt var. [Resmi sınırlar](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) | Statik olarak mümkün; ileride ürün/hizmet yönü ve repo görünürlüğü açısından daha zayıf. Proje alt yolunda Vite `base` ayarı gerekebilir. |
| Vercel Hobby | Ücretsiz Hobby planı kişisel/ticari olmayan kullanımla sınırlı. [Plan](https://vercel.com/docs/plans/hobby), [fair use](https://vercel.com/docs/limits/fair-use-guidelines) | Herkese açık bir ürünün olası ticari gelişimi için önerilmez. |

## Teknik uygunluk ve kurulum

- Mevcut `dist/`: **8 dosya / 638.615 bayt**; en büyük varlık `pdf.worker-*.js` **441.159 bayt**. Üç yerel WOFF2, HTML, CSS, ana JS ve font kullanım bildirimi dahil. Tek varlık 25 MiB sınırının çok altında.
- [Cloudflare Vite kurulumu](https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/): build `npm run build`, çıktı `dist`. Root directory alanı boş bırakılarak repo kökü kullanılır; üretim dalı `main` önerilir. `package-lock.json` kaynakta tutulur. [Build imajı](https://developers.cloudflare.com/pages/configuration/build-image/) varsayılan Node 22.16.0; kurulu Vite `^20.19.0 || >=22.12.0` ister. Yerelde doğrulanan Node 22.23.2 `NODE_VERSION` ile sabitlenebilir.
- Mevcut kod `new URL('./pdf.worker.ts', import.meta.url)` ile worker'ı Vite build'inde `assets/` içine çıkarır. Statik host aynı origin'den bu dosyayı sunar; Pages Functions, ücretli sunucu, PDF storage veya domain satın alımı gerektirmez.
- Git entegrasyonu her push'ta deploy eder. [Cloudflare'a göre](https://developers.cloudflare.com/pages/get-started/direct-upload/) Direct Upload projesi sonradan Git entegrasyonuna çevrilemez; manuel yükleme seçilecekse bunu bilerek seçmek gerekir. Mevcut proje henüz Git deposu değil.
- Cloudflare [özel alan adını](https://developers.cloudflare.com/pages/configuration/custom-domains/) proje oluşturulduktan sonra ayrıca bağlar; kök alan adında Cloudflare nameserver yönü gerekir, alt alanda CNAME mümkündür. İlk yayında ücretsiz `*.pages.dev` yeterlidir. Alan adı adının kullanılabilirliği henüz kontrol edilmedi.

## Açık kapılar

1. Önceki “son sayfa ilk sayfa” bildirimi [araştırmada](2026-09-30-page-order-investigation.md) açık; kaynak PDF/mod/girdi olmadan doğrulanmadı.
2. Gerçek PDF işlevleri ve iOS/Android kapasitesi/indirme akışı ölçülmedi. Mevcut geliştirme sınırları production vaadi değildir.
3. Production ağ incelemesi PDF içeriği, adı ve metadata'sının uzak servise çıkmadığını doğrulamalı. Analytics/Functions eklenmesi önerilmiyor.
4. GitHub/Cloudflare hesap bağlantısı, repo, Pages projesi, domain ve yayın henüz yok. Kullanıcının açık yayın kararına kadar dış sisteme yazma yapılmadı.

Araştırma resmi sağlayıcı belgelerine dayanır; koşullar yayın günü tekrar gözden geçirilmelidir.
