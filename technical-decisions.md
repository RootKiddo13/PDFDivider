# Teknik uygulama kararları

2026-09-30: Kullanıcı spec'lerden sonra implementation order ve orkestrasyon loop'u ile geliştirmeye başlanmasını istedi. Aşağıdaki rutin teknik seçimler bu yetkiyle yapıldı; kapasite ölçümü yapılmadı.

## Yığın

- TypeScript + Vite; küçük tek araç için UI framework'ü eklenmedi. Statik dosya çıktısı herhangi bir uygun statik hosta taşınabilir. [Vite rehberi](https://vite.dev/guide/)
- npm ve kilit dosyası; mevcut Node 22.23.2, Vite'ın Node gereksinimini karşılıyor.
- pdf-lib: ayrı module Web Worker'da load/copyPages/save. Sayfaları resimleştirerek PDF üretme yok. Şifreli PDF için ignoreEncryption kullanılmaz. [pdf-lib API](https://pdf-lib.js.org/docs/api/classes/pdfdocument)
- fflate: ZIP üretimi aynı worker içinde; UI üzerinde ZIP hesaplama yapılmaz. PDF zaten sıkıştırılmış olabileceği için ZIP store yaklaşımı tercih edilir. [fflate](https://github.com/101arrowz/fflate)
- PDF.js, thumbnail üretimi, harici font servisi ve analytics ilk sürüme eklenmez. Metin tabanlı sayfa ve çıktı özeti tam işlevlidir.

## Tipografi — 2026-09-30

Kullanıcının [Roboto tercihi](https://www.dafont.com/roboto.font) tüm metne uygulanır. Yalnız dik Regular 400, Medium 500 ve Bold 700 kullanılır; Thin ve italic dosyaları eklenmez. Dafont arşivindeki 2011 Version 1.00000 TTF dosyaları FontTools ile tüm glifler korunarak WOFF2'ye çevrildi; Türkçe harf kapsamı ve ağırlık metadata'sı statik olarak incelendi. Üç font toplam 160.604 bayttır.

Fontlar `src/assets/fonts/` içinden Vite tarafından hash'li uygulama varlıklarına çevrilir. `font-display: swap` ve sans-serif fallback kullanılır; üçüncü taraf font/CDN isteği eklenmez. Arşivin kullanım izni [NOTICE.txt](src/assets/fonts/NOTICE.txt) içinde aynen korunur ve `public/font-notices/roboto-NOTICE.txt` üzerinden yayın çıktısına eklenir; kaynak/sürüm bilgisi [font kaydında](src/assets/fonts/README.md) tutulur.

## Geliştirme güvenlik bütçeleri — doğrulanmış ürün kapasitesi değil

İlk kodlanan sürümde kaynak kullanımını sınırlamak için tek dosyada 50 MiB, 300 kaynak sayfası, 100 çıktı, gruplar boyunca toplam 1000 kopyalanacak sayfa, 4096 giriş karakteri, 512 seçim öğesi ve 100 grup koruması uygulanır. Toplam üretilmiş PDF baytı 100 MiB, ZIP 110 MiB ile sınırlanır. İşlem için 120 saniye zaman aşımı konur. Bunlar kaynak tüketimini mutlak biçimde garanti etmez: PDF parser belleği ve dosya karmaşıklığı farklıdır. Arayüz bu değerleri geçici geliştirme sınırları diye açıklar.

Gerçek düşük donanımlı iOS/Android cihaz ölçümleri yapılmadan bu rakamlarla production kapasitesi veya tarayıcı desteği vaat edilmez. Ölçüm planı [spec 03](specs/03-mobile-performance.md) içindedir; yayın kapısı açıktır.

Bağımsız incelemelerde PDF+ZIP ve ardından ArrayBuffer+Blob'un eşzamanlı tutulması riski bulundu. Ham PDF+ZIP sonuç toplamı en fazla 50 MiB tutulur; Blob oluşturulurken ikinci bir kopya varsayımıyla 100 MiB sonuç yerleşim bütçesi ayrılır. ZIP oluşturulmadan önce arşiv başlıkları/dosya adları dahil üst sınır hesaplanır; UI Blob oluşturulmadan önce aynı guard'ı tekrar uygular. Bu hesap GC zamanlaması, PDF parser, kaynak belge ve tarayıcının toplam tepe belleği için garanti değildir; gerçek cihaz ölçümü hâlâ gerekir.

## Davranış

Varsayılan mod seçilen sayfaları tek PDF yapar. Çoklu çıktılarda ZIP ana seçenek; her dosyayı ayrı indirme de sunulur. Tekilleştirilen seçim kullanıcıya bildirilir. Aynı çıktı içindeki sayfalar kaynak sırasını izler. Şifreli, imzalı ve etkileşimli formlu belgeler ilk sürümde reddedilir. Bozuk PDF için anlaşılır hata gösterilir. Yer imleri, etiketler ve açıklamaların korunacağı garanti edilmez; işlem öncesi açıklanır.

İptal/yeni dosya/sıfırlama worker'ı sonlandırır ve eski sonuçları geçersiz kılar; geçici indirme URL'leri bırakılır. Belge, dosya adı ve metadata ağ isteğine veya analitiğe gönderilmez. Uygulama varlıkları hosttan yüklenir. Production dağıtımı ve domain henüz seçilmedi.
