# 03 — Mobil ve Düşük Donanım Performansı

**Durum:** Geliştirme yetkilendirildi; aşağıdaki sayısal hedefler ölçülmedi. PDF motoru ve geliştirme seçimleri [teknik kararlar](../technical-decisions.md) içindedir. Gerçek cihaz desteği ve yayın kapasitesi açık kalır.

## Amaç ve sabit ürün koşulları

PDF ayırma telefonlarda ve düşük donanımlı cihazlarda kullanılabilir olmalı. PDF baytları her ziyaretçinin tarayıcısında işlenir; uygulama sunucusuna yüklenmez veya orada saklanmaz. Bu gereksinim [const.md](../const.md) içindeki onaylı yöndür.

Bu spec'teki sayısal performans değerleri **önerilen kabul hedefleridir**, ölçüm sonucu değildir. Daha önce anılan 50 MB / 300 sayfa yalnızca ölçüm için bir araştırma noktasıdır; ürün limiti veya doğrulanmış kapasite değildir. Kesin limitler gerçek cihaz ölçümlerinden sonra seçilecektir.

## Kullanıcı ve etkileşim ölçütleri — taslak

- Mobilde sistem dosya seçicisiyle tek PDF seçilebilmeli. Sürükle-bırak masaüstü için ek kolaylıktır; mobil ana akış buna bağlı olamaz.
- Temel işlemler dokunmatik kullanılmalı: hedefler öneri olarak en az 44×44 CSS piksel; sayfa seçimi, aralık girişi, başlatma, iptal, sıfırlama ve indirme için görünür odak/durum geri bildirimi.
- Sayfa seçimi küçük görseller olmadan da eksiksiz çalışmalı. Sayfa numarası, tek sayfa/aralık/dağınık seçim/tüm sayfalar ve klasik bölme akışları ekran okuyucu ve klavyeyle de kullanılabilir olmalı. Thumbnail üretilememesi extraction'ı engellememeli.
- Uzun sayfa listesi için sanallaştırma ve yalnız görünür/yakın sayfaları lazy render etme önerilir. DOM'da aynı anda tutulan eleman ve eşzamanlı render edilen thumbnail sayısına ölçümle sınır koyulsun; tüm sayfaları bir kerede yüksek çözünürlükte rasterize etme.
- İşlem sürerken kullanıcı dosya seçimi, iptal ve durum göstergesini kullanabilmeli. Önerilen hedef: dokunma/klavye girdisine görsel yanıt p95 ≤100 ms; normal çalışma sırasında 200 ms üzeri ana iş parçacığı blokları oluşmamalı. Bu değerler cihaz matrisinde doğrulanacak öneri hedefleridir.

## İşleme ve bellek tasarım kısıtları

- Ağır parse/extraction işi için Web Worker değerlendirilmesi önerilir. Worker, işi ana iş parçacığından ayırıp arayüz yanıtını iyileştirebilir; tek başına toplam bellek kullanımını düşürmez. Mesajlaşmada `ArrayBuffer` structured clone ile çoğaltılabilir; transferable list ile sahiplik aktarımı kopyayı önleyebilir ve kaynak buffer'ı gönderen tarafta kullanılamaz hale getirir. Akış bu sahiplik değişimini gözetmeli. [MDN: Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers), [MDN: Transferable objects](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Transferable_objects)
- Worker oluşturulamaması veya destek sorunu için davranış belirlenmeli. Ana iş parçacığında büyük synchronous işleme sessiz fallback olmamalı; arayüzü kilitlemeyecek biçimde reddetme, küçük işlerde kontrollü fallback veya anlaşılır hata seçenekleri ölçüm ve teknik seçim sırasında karşılaştırılmalı.
- İlk sürüm pdf-lib `copyPages` ile sayfa kopyalar; rasterizasyon ve thumbnail üretimi yoktur. Bu kabiliyet tek başına her PDF özelliğinin korunacağını kanıtlamaz. Form ve imza saptanınca ret kodlandı; annotation, outline ve benzeri özelliklerin davranışı ayrıca doğrulanmalı. [PDF-LIB: PDFDocument.copyPages](https://pdf-lib.js.org/docs/api/classes/pdfdocument#copypages)
- Thumbnail çözünürlüğü, aynı anda canlı canvas sayısı ve cache için sabit kaynak bütçesi belirlenmeli. Öneri: küçük önizlemeleri görünürlük/ekran yoğunluğuna göre üret, render bitince canvas backing store'u küçült/boşalt, thumbnail cache'i sayfa adedi yerine toplam piksel/bayt bütçesiyle sınırla; kaydırma sırasında eski cache'i tahliye et. Eşikler ölçümle seçilecek.
- Bellek hesabı input dosya boyutundan ibaret değil: ham input, parser nesneleri, kopyalanan sayfalar, output buffer/Blob ve ZIP aynı anda bellekte bulunabilir. İlk sürümde PDF+ZIP toplam guard'ı ve Blob kopyası payı vardır; worker Blob üretiminden önce bırakılır. ZIP ve tekil indirme seçildi; bunların tepe bellek maliyeti gerçek cihazda ölçülmeli. pdf-lib save sonucu ancak buffer üretildikten sonra sınanabildiğinden guard mutlak bellek garantisi değildir.
- Dosya seçimi, iptal, yeni dosyaya geçiş ve tamamlanma sonrası kaynak referansları, worker, render task, canvas, object URL ve Blob URL'leri temizlenmeli; ilgili PDF.js task/worker varsa resmi dispose/destroy API'si kullanılmalı. Dinamik `URL.createObjectURL` URL'leri iş bittiğinde `URL.revokeObjectURL` ile bırakılmalı. [MDN: File API ve object URL temizliği](https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications), [PDF.js API](https://mozilla.github.io/pdf.js/api/)
- İptal ve sıfırlama tekrarlanabilir olmalı: işlem iptalinden sonra yeni dosya başlatılabilmeli; eski işin sonucu yeni dosyanın durumunu veya çıktısını ezmemeli. Tarayıcı sekmesi bellek baskısı nedeniyle kapanırsa kurtarma garantisi verilemez; kullanıcının dosyası sunucuda olmadığı için tekrar seçmesi gerekebilir.

## Tarayıcı ve gizlilik doğrulaması

- Aday destek kapsamı: güncel Safari/iOS, Android Chrome ve masaüstü Chrome/Edge/Firefox/Safari. Bunlar henüz onaylı destek listesi değildir. Gerçek minimum OS/tarayıcı sürümleri ve Safari iOS cihazları belirlenmeden uyumluluk vaadi verilmemeli.
- iOS Safari ve Android düşük/orta donanım gerçek cihazlarda ölçülmeli; masaüstü emülasyonu cihaz belleği, termal kısıt ve OS tarafından sekme sonlandırılmasını temsil etmez. Worker kurulumu, PDF parse/extraction, indirme davranışı, iptal/yeniden başlatma, object URL temizliği ve sekme geri dönüşü her aday platformda denenmeli.
- Web Worker ve OffscreenCanvas özelliklerinin varlığı/kullanılabilirliği çalışma anında kontrol edilip hedef cihazlarda doğrulanmalı. Safari'deki bazı OffscreenCanvas kabiliyetlerinin sürüm bazında geldiği resmi WebKit notlarında belirtilir; bu yüzden API varlığı bütün render iş akışının desteklendiği anlamına gelmez. [WebKit: Safari 17 Offscreen Canvas](https://webkit.org/blog/14445/webkit-features-in-safari-17-0/)
- Normal akışta seçilen PDF için `fetch`/XHR, form submit, beacon, analytics veya uygulama loglarına dosya baytı, dosya adı, sayfa metni ya da metadata gönderilmemeli. PDF worker scripti gibi uygulama varlıklarının ağdan yüklenmesi, kullanıcının seçtiği PDF'nin gönderilmesinden ayrıdır. Üretim benzeri testte DevTools/network proxy ile dosya seçimi, preview, extraction, hata ve download akışlarının istek gövdeleri gözden geçirilmeli.

## Kapasite zarfı ve doğrulama planı

Dosya MB'si ve sayfa sayısı tek başına yeterli kapasite ölçüsü değildir. Küçük dosyadaki çok sayıda sayfa, büyük taranmış sayfalar, yüksek çözünürlüklü görseller, karmaşık vektörler/fontlar, bozuk/şifreli PDF ve çok sayıda çıktı farklı parse, render, kopyalama ve bellek maliyeti yaratır. Bu nedenle sonuçlar her cihaz sınıfı × belge sınıfı × seçim/çıktı biçimi kombinasyonu için kaydedilsin.

Önerilen fixture matrisi (örnek boyutlar; limit değildir):

| Boyut | Ölçülecek durumlar |
|---|---|
| Cihaz | Düşük/orta sınıf iPhone (Safari), düşük/orta sınıf Android (Chrome), desteklenecek masaüstü tarayıcılar |
| Dosya ve sayfa | Küçük/orta/büyük byte; az/orta/çok sayfa; 50 MB ve 300 sayfa yalnızca önceki keşif ölçüm noktaları |
| İçerik | Metin ağırlıklı, taranmış/image-heavy, büyük tek sayfa taraması, yoğun vektör, çok font/görsel içeren karma belge |
| Bölme şekli | Tek sayfa, kısa/uzun aralık, dağınık seçim, tüm sayfalar, seçilen sınırlarla klasik ardışık bölme; tek output'tan çok sayıda output'a kadar |
| Yaşam döngüsü | Thumbnail kapalı/açık, iptal, reset, ikinci dosya, tekrarlı extraction, indirme biçimi adayları |

Her koşulda kaydet: seçme→hazır olma süresi, extraction süresi, UI p95 input yanıtı ve long task gözlemi, peak/sonrası bellek örnekleri mümkün olduğunda, başarısızlık/sekme kapanması, çıktıların açılabilirliği, kalite/özellik karşılaştırması, ağ istekleri. PDF içeriği, isim ve metadata ölçüm loglarına yazılmamalı; sentetik veya herkese açık fixture kullanılsın.

Ölçüm yöntemi: gerçek cihaz OS/tarayıcı bilgisi ve pil/termal başlangıç durumu kaydedilsin; temiz sayfa başlangıcı ve aynı fixture ile en az 5 tekrar yapılsın; p50/p95 süre ve en kötü bellek/başarısızlık raporlansın. Destek zarfına alınacak her cihaz sınıfı × fixture için önerilen geçiş ölçütü: 10 ardışık extraction denemesi başarılı, her çıktı açılabilir/doğru sayfalı, iptal/reset sonrası yeni deneme başarılı, sekme kapanması/OOM yok ve UI yanıt hedefi karşılanmış olmalı. 5+10 sayıları ölçüm planı önerisidir; koşular arası fark varsa örneklem artırılmalı. DevTools/OS araçlarıyla bellek baskısı ve sekme sonlandırılması izlenmeli. `performance.measureUserAgentSpecificMemory()` yalnız uygun güvenli, cross-origin-isolated ortamlarda kullanılabilir; API sınırlı tarayıcı desteğine sahiptir, baytlar tarayıcılar arası karşılaştırılamaz ve her OS bellek bileşenini ölçtüğü garanti değildir. `performance.memory` standart dışı/eski ve Chromium'a özgüdür; tek başına kabul kanıtı yapılmamalı. [MDN: measureUserAgentSpecificMemory](https://developer.mozilla.org/en-US/docs/Web/API/Performance/measureUserAgentSpecificMemory), [MDN: performance.memory](https://developer.mozilla.org/en-US/docs/Web/API/Performance/memory)

Ürün limitini seçme kapısı: desteklenecek en düşük cihaz sınıfında, her temsilî fixture için tekrar edilebilir başarı; yanıt hedefinin karşılanması; OS/sekme kapanması veya out-of-memory belirtisi olmaması; tüm çıktıların geçerli olması; iptal/reset sonrası bellek ve durumun toparlanması; ağ gizliliği kontrolünün geçmesi. Limit, test edilmiş değerlerden güvenlik payıyla aşağıda belirlenip açık karar olarak kaydedilsin. Test edilmemiş daha büyük dosya/sayfa sayısına kapasite vaadi verilmesin. Kesin dosya/sayfa limiti, cihaz kapsamı ve threshold'lar ürün kararı olarak açık kalır.

## Açık kararlar

1. Seçilen pdf-lib worker mimarisinin hedef cihazlarda doğrulanması.
2. Desteklenecek minimum tarayıcı/OS sürümleri ve gerçek cihaz listesi.
3. Testlerden sonra dosya byte, sayfa ve çıktı sayısı limitleri.
4. İlk sürümde thumbnail yok; ileride eklenirse çözünürlük ve cache bütçesi.
5. ZIP ve ayrı indirme seçeneklerinin gerçek cihazlardaki bellek/indirme davranışı.
6. İlk sürümün özel PDF ret davranışının gerçek örneklerle doğrulanması.
