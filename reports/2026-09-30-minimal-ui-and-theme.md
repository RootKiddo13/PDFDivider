# Minimal kart arayüzü ve cihaz teması — 2026-09-30

## Kullanıcı isteği ve sonuç

Kullanıcı [1 numaralı Untitled UI referansını](https://dribbble.com/shots/18890140-Upload-file-modal-Untitled-UI) seçip geliştirmeyi yetkilendirdi; açık/koyu tema ve cihazın temasını izleme istedi. Aynı PDF Divider akışı nötr, tek merkez kart düzenine uyarlandı: küçük marka/başlık, sade dosya alanı, tek ana aksiyon, açılabilir yardım bölümleri. PDF yüklenince mod ve sayfa seçimi açılır; sonuçta indirme alanı gösterilir. Yerel Roboto korundu, favicon nötr renklere uyarlandı, yeni UI/animasyon paketi eklenmedi.

Tema menüsü: **Cihaz teması / Açık tema / Koyu tema**. Varsayılan cihazdır. `prefers-color-scheme` değişimi cihaz tercihinde otomatik uygulanır; manuel seçim localStorage'da hatırlanır ve OS değişimiyle ezilmez. Storage kullanılamazsa uygulama hata vermeden bellekte çalışır. Diğer sekmelerin tercih değişimi storage olayıyla izlenir. İlk render için head bootstrap, CSS gelmeden renk tercihini uygular; native color-scheme ve theme-color güncellenir.

## Doğrulama

- TypeScript/Vite build başarılı. İlk derlemede MediaQueryList feature detection, legacy fallback'i `never` türüne daralttı; bir hedefli worker düzeltmesiyle giderildi.
- Bağımsız CSS worker entegrasyon kaynak incelemesinde PDF yükleme/hata/reset/sonuç durumlarına engel bulmadı; çift disclosure işareti ihtimali parent tarafından düzeltildi.
- Yerel önizlemede açık/koyu görünüm ve koyu tercihin reload sonrası korunması gözlendi. 390×844 görünümde document clientWidth/scrollWidth ikisi de 390; yatay taşma yok. Geçici viewport override kaldırıldı.
- Canlı sitede açık/koyu seçenekleri ve koyu tercihin reload sonrası `data-theme=dark / data-theme-preference=dark` olması doğrulandı; bitişte Cihaz teması seçildi.
- Fiziksel OS tema değişimi, storage engeli/cross-tab olayları ve gerçek PDF işlemi bu turda runtime olarak denenmedi; bunlar kod incelemesi düzeyindedir. Test suite eklenmedi/çalıştırılmadı; cihaz performansı/büyük PDF kapasitesi ölçülmedi.
- Final build: CSS 14,49 kB (gzip 3,45 kB), JS 21,26 kB (gzip 7,59 kB). Boyutlar hız benchmark'ı değildir.
- Worker hash'i `pdf.worker-6kZWOZcI.js` aynı kaldı; worker/selection/contracts/limits dosyaları bu tasarım turunda değiştirilmedi. 1,5 GB boyut politikası ve 120 saniye işlem süresi sürer.

## Yayın ve kanıt

Netlify mevcut `pdfdivider` projesine statik build yüklendi; production **6abd76edf8d14720feebbed5**, "Currently published", **23:54 İstanbul**. https://pdfdivider.netlify.app/ HTTP 200; HTML yeni `index-CBujj_72.js`, `index-Dxq6YRGK.css` ve erken tema bootstrap'ını kullanıyor. Git CI bağlantısı hâlâ açık; yayın elle ZIP yüklemesiyle yapıldı.

- [Canlı açık tema](2026-09-30-minimal-light.jpg)
- [Canlı koyu tema](2026-09-30-minimal-dark.jpg)

Koordinasyon: iki eş düzey GPT-6 Luna worker; CSS yalnız style.css, tema yalnız theme.ts. Parent main/index/favicon/entegrasyon/rapor/yayın sahibiydi. Bir TypeScript worker onarımı ve disclosure CSS düzeltmesi yapıldı. Maliyet/token verisi mevcut değil; tasarruf veya cihaz hızı iddiası yok.
