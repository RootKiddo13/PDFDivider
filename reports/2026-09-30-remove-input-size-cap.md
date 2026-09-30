# Giriş PDF boyutu sınırını kaldırma — 2026-09-30

## Sonuç

Kullanıcının isteğiyle giriş PDF'sinin sabit 50 MiB boyut engeli kaldırıldı. UI'deki dosya seçme kontrolü, worker'daki boyut reddi, LIMITS.fileBytes ve FILE_TOO_LARGE hata metni temizlendi. Dosya altındaki "En fazla 50 MiB" kaldırıldı; ayrıntılı sınır açıklaması giriş dosyası için sabit boyut sınırı olmadığını belirtiyor. `const.md` ve `technical-decisions.md` güncellendi.

Bu değişiklik giriş dosyasını kapsar: PDF+ZIP sonuçlarının toplam 50 MiB bütçesi, Blob kopyaları için 100 MiB, sayfa/çıktı sayısı ve zaman aşımı korumaları uygulanmaya devam eder. Büyük kaynak dosyanın açılması, bütün sonuçlarının tek seferde indirilebileceği veya fiziksel telefon kapasitesi garantisi değildir.

## Doğrulama ve yayın

- `npm run build` başarılı (TypeScript kontrolü + Vite build).
- Kaynak taramasında fileBytes ve FILE_TOO_LARGE kullanımı kalmadı.
- Build çıktısı mevcut Netlify `pdfdivider` projesine elle yüklendi. Dashboard production deployment **6abd683120963733f04dd412**, "Currently published" ve 22:51 İstanbul zamanını gösterdi.
- Canlı https://pdfdivider.netlify.app/ sayfası reload sonrasında PDF’niz sunucuya yüklenmez metnini ve yeni `/assets/index-DW03be_e.js` varlığını gösterdi; yeni worker `/assets/pdf.worker-SH-dysPo.js`.
- [Canlı UI görüntüsü](2026-09-30-file-cap-removed.jpg).
- Test eklenmedi/çalıştırılmadı; 50 MiB üstü gerçek PDF ile parse/çıktı veya fiziksel telefon kapasitesi denemesi yapılmadı. Bu kayıt kaynak/build/yayın doğrulamasıdır.

Netlify Git CI henüz bağlı değil; yayın mevcut hesabın desteklenen file chooser / ZIP yüklemesiyle tamamlandı. Netlify hesabına veya GitHub private repo erişimine yeni izin eklenmedi.
