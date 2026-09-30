# Roboto tipografi uygulaması — 2026-09-30

## Sonuç

Kullanıcının [Roboto tercihi](https://www.dafont.com/roboto.font) tüm siteye uygulandı. Başlık, marka, araç alanı, açıklamalar ve kontroller aynı Roboto ailesini kullanır. Thin ve italic yoktur. Regular 400 gövde, Medium 500 başlıklar/ikincil vurgu, Bold 700 etiketler ve ana eylemler için kullanılır. Başlık harf aralığı ve satır yüksekliği Roboto metriklerine göre düzenlendi.

## Kaynak ve varlıklar

- Dafont arşivinden yalnız `Roboto-Regular.ttf`, `Roboto-Medium.ttf`, `Roboto-Bold.ttf` alındı. Version 1.00000; 2011, copyright Google 2011. FontTools ile WOFF2'ye çevrildi; glif kümesi daraltılmadı.
- `src/assets/fonts/` içindeki üç font: 52.816, 53.804 ve 53.984 bayt; toplam **160.604 bayt**. Kaynak fontların ve çıktıların ağırlık/italic metadata'sı ve Türkçe harfleri statik olarak incelendi.
- Arşivin izin metni `src/assets/fonts/NOTICE.txt` içinde aynen korundu; yayın çıktısında `font-notices/roboto-NOTICE.txt` olarak bulunur. Başka Roboto sürümünün lisansı bu arşive atfedilmedi.
- `src/style.css` üç normal font-face ve `font-display: swap` kullanır. Vite fontları hash'li yerel build varlıkları olarak sunar; harici font servisi/CDN eklenmedi.

## Kanıt

Parent `npm.cmd run build` çalıştırdı: TypeScript ve Vite başarılı, Vite bundle süresi 229 ms. Çıktı CSS 13,26 kB (gzip 3,88), ana JS 22,64 kB (gzip 7,88), PDF worker 441,15 kB. Üç WOFF2 dosyası ve izin metni dist içinde mevcut; derlenmiş CSS URL'leri bu dosyaları gösterir. CSS aileleri Roboto ve sans fallback; yalnız 400/500/700 ağırlıkları bulunur.

PDF seçim/worker/kontrat/limit dosyalarının SHA-256 değerleri önceki görsel teslimle aynı. UI worker yalnız style.css değiştirdi. İkinci Luna worker bağımsız statik incelemede font yolları, ağırlık eşlemesi, kontrol mirası ve mobil kurallarda tipografi engeli bulmadı; hedefli onarım gerekmedi. Parent gerçek font metadata'sını ve build varlıklarını inceledi.

Gerçek browser/font yüklenmesi, görsel yerleşim, PDF işlemi veya fiziksel telefon testi yapılmadı. Loop VALIDATION_PENDING kalır. Preview için `http://127.0.0.1:4173/?font=roboto` sekme isteği queued döndü; production yayını yapılmadı.
