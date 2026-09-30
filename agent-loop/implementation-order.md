# Implementation Order

**Durum:** Planlama tamamlandı; ilk uygulama dilimi `project foundation` için bekliyor. Her dilim bağımlılık sırasına göre açılır ve kendi reviewer/parent kabulünü bekler. Sıra, [01 MVP](../specs/01-mvp-scope.md), [02 seçim ve çıktılar](../specs/02-page-selection-and-outputs.md), [03 mobil/perf](../specs/03-mobile-performance.md) kapsamlarını izler.

## Sabit başlangıç yönü

- Paket yöneticisi: npm.
- Uygulama: framework olmadan TypeScript + Vite.
- PDF load/page-copy/save: `pdf-lib`, Web Worker içinde.
- Çoklu PDF paketleme: `fflate`, worker içinde ZIP.
- İşleme yerel tarayıcıda kalır. Uygulama backend'i, PDF upload/storage, sunucu işleme bu işin kapsamına girmez.
- UI'nın nihai görsel düzeni, browser/OS sürüm tabanı, kapasite limitleri ve production hosting/domain kararı bu teknoloji yönünden çıkarılamaz; açık kaldıkları yerde parent kararı gerekir.

## Bağımlı dilimler

### 1. Project foundation

**Amaç:** Kaynak ve build yapısını ayağa kaldıran en küçük web iskeleti.

**Kapsam:** npm/TypeScript/Vite yapılandırması; app giriş noktası ve erişilebilir, dar kapsamlı shell; worker modülünü sonraki faz için taşıyabilecek dosya/komut yapısı; README'de yerel build/run bilgisi. Henüz PDF parser, extraction, thumbnails veya gerçek kapasite limiti yok.

**Kabul kapısı:** Vite production build başarılı; statik inceleme doğru entry/config ve kullanıcı PDF'si içeren bir network çağrısı olmadığını gösteriyor; proje kurulumu ve build komutları belgeli. Test eklenmez/çalıştırılmaz, kullanıcı ayrıca istemediği sürece. Reviewer bulgusu çözülür ve parent dosya sahipliği/diff/kanıt paketini kabul eder.

### 2. Selection core + worker load/extract

**Amaç:** Spec 02'nin giriş semantiğini normalize edip doğrulamak ve seçili sayfaları PDF çıktısına kopyalayan worker akışını eklemek.

**Kapsam:** Tek sayfa, aralık, dağınık/karışık seçim, tüm sayfalar ve klasik kesim semantiği; işlemsiz önce girdi/token/grup/çıktı bütçesi doğrulama; `pdf-lib` ile kaynak PDF'yi yükleme, `copyPages` ile sayfa içeriğini çıktı gruplarına kopyalama ve PDF üretme; worker'dan sınırlı durum/ilerleme/hata mesajları; input baytını worker'a geçirme stratejisi açık ve kopya maliyeti göz önünde. Normal akışta dosya baytları sunucuya gönderilmez.

**Kabul kapısı:** Spec 02'deki geçerli/geçersiz örneklerin beklenen grupları kod incelemesiyle takip edilebilir; sıra/kesim/tekrarlı sayfa ve taşma sınırları sessizce clamp/truncate etmez; çıktı grupları kaynak sayfa sırasını korur; output PDF buffer'ları worker yanıtında tanımlı biçimde taşınır; parse/işlem hataları yapılandırılmış hata olur. Build/static inspection başarılı ve reviewer + parent kabulü vardır. Test ancak kullanıcı isterse.

### 3. Mobile UI + preview + download + cancel/reset

**Amaç:** Mobilde kullanılabilir akışı, isteğe bağlı preview'ı ve temizlenebilir indirmeyi tamamlamak.

**Kapsam:** Sistem dosya seçicisi; thumbnail olmadan tüm seçim modları; telefonda metinle seçim; erişilebilir dokunma/klavye durumları; önerilen lazy/virtual thumbnail; worker yaşam döngüsü, progress/cancel/reset/yeni dosya; object URL ve canvas temizliği; tek output için PDF indirme ve birden fazla output için worker `fflate` ZIP teslimi; güvenli dosya adı ve anlaşılır hata/limit mesajı. Eşikler ölçüm yokken ürün limiti gibi kodlanmaz.

**Kabul kapısı:** Spec 01–03 akışı bir kaynak dosyadan uçtan uca bağlanır; her seçim biçimi thumbnail olmadan çalışır; cancel/reset sonrasında stale sonuç UI veya indirmeyi değiştirmez; kaynak referansları/worker/URL/canvas temizliği için kod yolu mevcuttur; çıktılar browser download akışına ulaşır; görsel ve erişilebilirlik statik kontrolü yapılır; ağ/payload gözden geçirilir ve seçili PDF'nin tarayıcı dışına çıkmadığı kanıtlanır. Reviewer ve parent kabul eder. Gerçek mobil cihaz kontrolü sonraki fazdır.

### 4. Parent integration + independent static review

**Amaç:** Önceki dilimleri aynı commit/durumda birleştirip ürünü spec'lere göre kontrol etmek.

**Kabul kapısı:** Parent tam diff'i ve mimari sınırları inceler; varsa bağımsız reviewer bulguları hedefli tek repair turunda çözülür; build/static kontrollerin gerçek çıktısı kaydedilir; spec 01–03'teki her kabul ölçütü `geçti / açık / ölçüm bekliyor` diye sınıflanır; gizlilik/ağ davranışı gözden geçirilir. Parent açıkça kabul etmeden `PASS` verilmez. Test ekleme/çalıştırma ancak kullanıcı isterse.

### 5. Real-device capacity measurement + release preparation (future gate)

**Amaç:** Destek kapsamı ve limitleri gerçek cihaz verisiyle belirlemek, ardından release hazırlığını tamamlamak.

**Kapsam:** spec 03'teki iOS Safari, düşük/orta sınıf Android ve belge/çıktı matrisini gerçek cihazda ölç; PDF bytes/page/output-limit zarfını başarısızlık/yanıt/memory davranışına göre seç; hedef tarayıcı indirme ve yaşam döngüsünü doğrula; production hosting/domain, gizlilik metni, izleme/log ilkeleri ve release checklist'ini belirle.

**Kabul/çıkış kapısı:** Her desteklenen cihaz sınıfında tekrarlanabilir sonuçlar, her fixture için extraction/çıktı ve UI yanıtı kanıtı, sekme kapanması/OOM olmadığı, ölçüm yönteminin sınırları ve açık özellikler belgeli; limitler test edilmiş envelope ve güvenlik payı ile kullanıcıya açık; gizlilik/ağ kontrolü geçer; release kapsamı ve maliyetleri parent tarafından gözden geçirilir. Şu an fiziksel mobil ölçüm yapılmış değildir. Production yayınlama, DNS veya ücretli kaynak adımları ayrıca kullanıcı yetkisi gerektirir.

## Her dilimde çalışma sırası

1. Parent yalnız bir dilim, gerekli spec ve minimal bağlam paketini atar; builder tek yazıcı olur.
2. Builder en fazla 15 dakikalık ilk teslimde diff, gerçek build/static kanıtı ve açık işleri handoff şablonuna yazar.
3. Bağımsız reviewer aynı teslimi spec ölçütlerine göre inceler; kodu değiştirmek yerine dosya/satır ve yeniden üretilebilir bulgu döndürür.
4. Gerekirse tek hedefli fixer turu en fazla 5 dakika sürer; reviewer tekrar kontrol eder. Çözülmeyen konu `BLOCKED` olarak parent'a gider.
5. Parent entegrasyon/diff ve kanıtı inceler. Kabul ederse active-run'da sıradaki dilime geçer; `PASS` yalnız bu dilim için kaydedilir.

Handoff alanları için [handoff-template.md](handoff-template.md), güncel durum için [active-run.md](active-run.md) kullanılır. Paylaşılan doküman/report'larda tek yazıcı parent'tır.
