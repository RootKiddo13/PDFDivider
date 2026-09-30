# Pages erişim sorunu ve alternatif deneme yayını — 2026-09-30

## Güncel sonuç — kalıcı Netlify yayını

**22:34 İstanbul — kullanıcı istediği URL değişikliği:** Netlify proje adı `pdfdivider` olarak kaydedildi. Güncel adres **https://pdfdivider.netlify.app/**; dashboard aynı proje ID'sinde yeni adı ve Public görünürlüğü doğruladı. Windows ana sayfa HTTP 200; IAB uygulamayı yeni origin'de açtı. [Yeni yayın görüntüsü](2026-09-30-pdfdivider-netlify.jpg). Önceki `rootkiddo-pdfdivider.netlify.app` adı geçmiş kayıt olarak aşağıda kalır; Netlify ad değişikliği ekranına göre eski adres artık bu projeyi sunmaz. CI/özel repo izin adımı hâlâ bekliyor.

Kullanıcı, Netlify kopyasını **telefonundan** açtığını tekrar doğruladı. GitHub Netlify Auth e-posta okuma onayını kullanıcı tamamladı; claim, RootKiddo13 takımında proje overview ekranıyla doğrulandı. Başlangıçtaki pasif OAuth düğmesinin nedeni ölçülmedi; parent düğmeyi zorla etkinleştirmedi veya onayı kullanıcı adına vermedi.

Claim sonrası Netlify'nin varsayılan private görünümü, önceden herkese açık yayımlanması istenen statik uygulama için **Public** olarak tamamlandı. Proje adı `rootkiddo-pdfdivider`; kalıcı URL **https://rootkiddo-pdfdivider.netlify.app/**. Proje ID `746a4bdd-19e2-4ff2-b2eb-930f78fdfadc`; mevcut production deploy `6abd5c9711ecd8370f930308` (Drop). Dashboard "Your project is public / Anyone can visit" gösterdi. **Önceki unclaimed bir saatlik sona erme ve My-Drop-Site şifresi artık geçerli değil.**

Windows'tan şifresiz ana sayfa ve `/assets/pdf.worker-DKouweXg.js` HTTP 200 döndü; IAB yeni URL'de uygulama arayüzünü açtı. [Kalıcı açık yayın görüntüsü](2026-09-30-netlify-public.jpg). Telefon onayı önceki Drop hostname içindir; yeni hostname telefon testi ve gerçek PDF işlev/kapasite kapıları ayrıca açık.

**CI henüz kurulmadı:** Developer settings → Link repository → existing repository → GitHub ekranı hazır. GitHub düğmesi desteklenen Playwright ve AX tıklamalarında pencere açmadı, console error/warn listesi boştu; popup nedeni doğrulanmadı. GitHub repo izinleri verilmedi. Kullanıcı açık GitHub düğmesine manuel basıp gerçek izin ekranına gelince yalnız özel `RootKiddo13/PDFDivider` kapsamı incelenecek/onaylanacak. Yerel netlify.toml hazır; Git push yapılmadı. Cloudflare eski CI projesi duruyor.

Alttaki deneme/claim bekleme kayıtları önceki aşamanın tarihçesidir; canlı durum bu bölümdeki kalıcı yayındır.

## Doğrulanan durum

- Kullanıcı, telefonda mobil veriyle de `pdfdivider.pages.dev` açılmadığını bildirdi. Önceki Chrome ekranlarında NXDOMAIN ve bağlantı reseti vardı; operatör/Chrome sürümü henüz alınmadı.
- Cloudflare dashboard'da production `main / 6696815`, deployment `943c13af-ab85-47ee-8b55-a90fcdb020c9`, status **success**. Build logu 9 asset ve başarılı yayın gösteriyor; Functions yok.
- Cloudflare Status API kontrolünde Pages, Authoritative/Recursive DNS ve Network **operational**. Madrid performans olayı **monitoring**; bu bağlantıyla ilişkisi doğrulanmadı.
- Windows'ta 1.1.1.1 ve 8.8.8.8, A `172.66.45.32 / 172.66.46.224` ve AAAA kayıtları döndürüyor. DNS'i atlayıp aynı hostname ile `--resolve` denemesi de TLS reseti alıyor.
- IPv4 curl, TLS 1.2 ve TLS 1.3 denemeleri reset alıyor. IPv6 denemesi timeout; cihazın genel IPv6 erişimi doğrulanmadığından neden çıkarılmadı.
- `pages.dev`, `echoid.pages.dev`, `rootkiddo.pages.dev` curl denemeleri de reset alıyor. `www.cloudflare.com` normal isteği HTTP 200; ayrıca **aynı `172.66.45.32` IP'sine**, `www.cloudflare.com` adı/SNI ve geçerli sertifika kontrolüyle yapılan istek HTTP 200 döndü.
- Kullanıcının masaüstü Chrome sekmesinde yeni `?connection-check=20260930` isteği PDF Divider arayüzünü açtı. Tarayıcı ve curl bağlantı davranışları farklı; ECH/HTTP3/proxy/istemci ayrımının hangisi etkili olduğu ölçülmedi.

## Sonuç ve sınırlar

HTML/JavaScript'ten önceki TLS reseti, uygulama kodu veya başarısız build ile açıklanmıyor. Aynı IP'nin farklı adla yanıt vermesi, alan adına veya TLS bağlantı biçimine bağlı ağ müdahalesi ihtimalini güçlendiriyor. **Türkiye geneli/BTK engeli kesinleştirilmedi.** Mobil Wi-Fi ve veri sonucunun ikisi de başarısız olması ortak erişim sorununu genişletiyor; aynı kök neden olduğu kanıtlanmış değil.

Önceki trafik ekranındaki hash alt alan adları dashboard'da gerçek deployment adresleriyle eşleşen biçimdedir. `:8443` kayıtlarının kaynağı log olmadan bilinmiyor; bot/tarama açıklaması çıkarımdır.

## Uygulanan erişim denemesi

- Aynı kaynak sürümde `npm run build` başarılı; 9 statik build dosyası ZIP olarak paketlendi. Kod değiştirilmedi; özel Git deposu, PDF veya kullanıcı verisi yüklenmedi.
- Netlify Drop üzerinde ayrı ve geçici deneme yayını oluşturuldu: `https://guileless-fox-abc22b.netlify.app/`.
- Netlify varsayılan deneme şifresi `My-Drop-Site`; unclaimed yayın **yaklaşık 23:03 Europe/Istanbul'da sona erer** (30 Eylül). Bu URL kalıcı production adresi değildir; Git CI bağlı değildir.
- Windows curl bu origin'den HTTP 401 aldı (beklenen parola kapısı); bağlantı reseti yok. Codex IAB'de parola girilince PDF Divider arayüzü açıldı. PDF işlevi/telefon doğrulaması yapılmadı.
- Kanıt: [deneme yayını görüntüsü](2026-09-30-netlify-access-check.jpg).
- Chrome extension dosya yüklemesi yerel dosya URL izni nedeniyle başarısız oldu; izin değiştirilmedi. Yükleme Codex IAB'nin desteklenen dosya seçicisiyle tamamlandı.

## Önceki claim adımı — tamamlandı

**22:12 İstanbul güncellemesi:** Kullanıcı Netlify deneme kopyasının mobilde açıldığını doğruladı. Son eski Pages ekranı `ERR_QUIC_PROTOCOL_ERROR` gösteriyordu; bu da mevcut uygulama HTML'i gösterilmeden önceki bağlantı hatasıdır. Kesin operatör/QUIC nedeni hâlâ ölçülmedi.

Kalıcı Netlify yayını için Claim bağlantısı açıldı ve Netlify signup/login ekranına yönlendi. Ekran, signup işleminin hizmet şartları ve gizlilik politikasını kabul ettiğini açıkça belirtiyor; hesap oluşturma/giriş adımı kullanıcıya bırakıldı. Yaklaşık 23:03'ten önce [claim](https://app.netlify.com/drop/guileless-fox-abc22b/claim) tamamlanmalı. Yerel `netlify.toml` hazır: `npm run build`, `dist`, Node `22.23.2`. Bu config Git'e push edilmedi; Netlify CI bağlı değil. Netlify Free yeni hesaplarda aylık 300 kredi sınırına sahip.

Tek sonraki adım: kullanıcı Netlify hesabıyla claim bağlantısından giriş yapsın veya ücretsiz hesap oluşturmayı kendisi tamamlasın. Ardından kalıcı URL/claim doğrulanacak; özel Git deposu erişimi gerekiyorsa yalnız `RootKiddo13/PDFDivider` için izin adımı ayrıca gösterilecek. Mobil açılma, gerçek PDF işlevi/kapasitesinin testi değildir.

## Resmi kaynaklar

- [Cloudflare Status](https://www.cloudflarestatus.com/api/v2/summary.json)
- [Cloudflare — ISP blocking](https://developers.cloudflare.com/support/troubleshooting/general-troubleshooting/potential-isp-blocking/): genel ihtimal, Türkiye veya bu siteye özel doğrulama değildir.
- [Cloudflare Pages custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/): custom domain desteklenir; aynı Cloudflare ağı kaldığı için IP seviyesindeki sorunu çözeceği garanti edilmez.
- [Netlify Free sınırları](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/credit-based-pricing-plans/)

Koordinasyon: bir GPT-6 Luna worker resmi kaynak incelemesi yaptı; parent canlı DNS/TLS, deployment, build ve deneme yayını sonuçlarını kontrol etti. Kapanış veya kalıcı hosting değişikliği tamamlanmış sayılmadı.
