# Onaylı görsel yön

Kullanıcı 2026-09-30 tarihinde [bu konsepti](approved-concept-v1.png) onaylayıp mevcut siteye uygulanmasını istedi.

- Turuncu/bordo CSS gradient, krem başlıklar, altın çizgi ve belge simgesi. Kullanıcının aynı günkü son tercihiyle Georgia/serif yerine tüm sitede Roboto kullanılır; Thin ve italic yoktur. Konsept resmi renk ve yerleşim referansı olarak kalır.
- PDF sayfasını merkezdeki turuncu kesik çizgiyle bölen koyu bordo favicon simgesi: `public/favicon.svg`; sekme simgesi olarak `index.html`'den bağlanır.
- Masaüstünde solda ürün mesajı, sağda işlevsel araç kartı. Mobilde aynı akış alt alta, dört modu sunan select kontrolü.
- Görseldeki telefon ve browser çerçevesi, alan adı ve dolu örnek alanlar yalnız sunumdur. Gerçek arayüz kullanıcı dosyası seçilene kadar sahte dosya/sayfa/çıktı göstermez.
- Görsel dosyası tasarım referansıdır; runtime asset olarak yüklenmez. Roboto Regular/Medium/Bold WOFF2 dosyaları uygulamadan sunulur; harici font servisi/CDN, video veya büyük arka plan resmi eklenmez.
- PDF seçim/worker/indirme/iptal/limit/gizlilik davranışları korunur. Destek ve ölçülmemiş kapasite açıklamaları okunabilir tutulur.
