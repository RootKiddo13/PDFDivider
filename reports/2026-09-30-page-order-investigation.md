# Sayfa sırası araştırması — 2026-09-30

## Bildirim ve mevcut sonuç

Kullanıcı ilk sayfa yerine son sayfanın seçildiğini bildirdi. Ekran görüntüsü `part-001.pdf` adlı bir çıktıda okuyucunun `1/1` gösterdiğini ve bitiş metnini gösteriyor. Kaynak PDF, seçili mod ve girilen sayfa seçimi henüz verilmedi; kullanıcıdan istendi. **Kök neden doğrulanmadı; bildirim açık.**

## Statik bulgular

- `src/pdf.worker.ts:58` dosya adını çıktı sırasından üretir. `part-001`, ilk üretilen çıktı demektir; kaynak sayfa 1 anlamına gelmez. Tek son sayfa çıkarılması aynı adı ve okuyucuda 1/1 sonucunu üretebilir. Bu olasılık kullanıcının gerçek girdisi olarak kabul edilmedi.
- `src/selection.ts:181` seçimleri grup içinde artan kaynak sırasına göre düzenler; her sayfa ayrı modunda tek sayfalı gruplara dönüştürür. Klasik bölme artan kesim sınırlarından ardışık gruplar oluşturur. Son sayfayı ilk sayfaya çeviren işlem görülmedi.
- `src/pdf.worker.ts:228` 1 tabanlı kaynak sayfasını `page - 1` ile pdf-lib indeksine çevirir ve dönen sayfaları aynı sırayla ekler. [Resmi pdf-lib copyPages örneği](https://pdf-lib.js.org/docs/api/classes/pdfdocument#copypages) sıfır tabanlı indeks kullanımını destekler. Kurulu 1.17.1 kaynağında `PDFDocument.ts:722` `srcPages[indices[idx]]` kullanır.
- `src/main.ts:408` çıktı dizisini aynı sırayla işler, her dosyanın buffer'ı için ayrı Blob ve object URL üretir. Ad ve URL aynı dosya nesnesinden alınır. `src/main.ts:597` worker'a o anki mod ve seçim metnini gönderir. Bu yollarda son dosyanın ilk linke atanması statik olarak görülmedi.
- [Resmi getPages açıklaması](https://pdf-lib.js.org/docs/api/classes/pdfdocument#getpages) görüntülenme sırasını belirtir; uygulama basılı sayfa numarası/PDF etiketi yerine bu sıradaki 1 tabanlı konumu seçer. Kaynağın etiketi/yapısı mevcut olmadan olası uyumsuzluk doğrulanamaz.

Parent UI/indirme yolunu ve resmi API'yi inceledi; core Luna worker seçim/worker/kurulu kütüphane yolunu bağımsız inceledi. Uygulama değişikliği veya test yapılmadı. Ekran görüntüsü kaynak sayfa ile çıktı sayfasını tek başına karşılaştırmaya yeterli değildir.

## Sonraki adım

Kaynak PDF ve tam mod/girdi geldiğinde kaynak sayfa 1 ve son sayfayı üretilen içerikle karşılaştır; önizlenen kaynak sayfa numaraları ile çıktıyı eşleştir. Girdi gerçekten kaynak sayfa 1 iken son sayfa üretiliyorsa dosyaya özgü sayfa ağacı/parser davranışı ve gerçek çıktı bytes incelenmeli. Dosya adında kaynak sayfa bilgisinin gösterilmemesi mevcut bir kullanım belirsizliğidir; seçim hatasının kök nedeni olarak ilan edilmedi. Kullanıcı araştırma istediği için kod değişmedi.
