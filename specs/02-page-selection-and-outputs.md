# 02 — Page Selection and Outputs

**Durum:** Üst düzey gereksinimler onaylı; ilk uygulama yazıldı ve statik inceleme/derleme tamamlandı. Yığın [teknik kararlar](../technical-decisions.md) içindedir. Kod yolları incelendi; gerçek PDF çıktı doğrulaması yapılmadı.

## Kullanıcı gereksinimleri

- Tek PDF üzerinde tek sayfa, dahil uçlu aralık, dağınık sayfalar ve bunların kombinasyonu seçilebilmelidir.
- Gerçek sayfa sayısı yüklendikten sonra anlaşılır bir “Tüm sayfalar” kontrolü, seçimi `1-N` olarak doldurmalıdır.
- Klasik PDF bölme ve sayfa çıkarma aynı, anlaşılır deneyimde bulunmalıdır.
- Telefonlarda sayfa seçimi metin alanıyla kullanılabilmelidir; thumbnail zorunlu değildir.
- Giriş, PDF'nin gerçek toplam sayfa sayısına göre doğrulanır. Var olmayan sayfa aralığını sessizce kırpmak/clamp etmek yasaktır.
- PDF tarayıcıda işlenir; PDF sunucuya yüklenmez veya sunucuda saklanmaz.

## Önerilen sayfa sözdizimi

Sayfa numaraları 1 tabanlıdır; aralık uçları dahildir. Önerilen giriş alanı sayfa numaralarını ve aralıkları kabul eder:

- Tek sayfa: `9`
- Dahil aralık: `1-30`
- Dağınık sayfalar: `1,5,9,11,13`
- Sayfa ve aralık karışımı: `1-5,9,11-13`

Önerilen ayrıştırma dilbilgisi (`N`, PDF'nin gerçek sayfa sayısıdır):

```text
page-selection := group                         # tek PDF / her sayfa ayrı modu
group-selection := group (";" group)*          # grupları ayrı PDF modu
group := item ("," item)*
item := page | page "-" page
page := ASCII-digit+                            # sonra 1 <= page <= N doğrulanır
classic-cuts := page ("," page)*               # yalnız "şu sayfalardan sonra kes" modu
```

Ayraçların çevresindeki boşluk kırpılabilir; sayı içinde boşluk ve başka ayraç kabul edilmez. `;` yalnız grup modunda, virgül klasik modda yalnız kesim sınırlarını ayırır.

Virgül bir **çıktı grubu içindeki seçili sayfaların birleşimini** ifade eder. Sayfa sırası, kullanıcı girdisinin sırasından bağımsız olarak kaynak PDF sırasıdır. Noktalı virgül `;` ayrı çıktı gruplarını ayırır; bu nedenle virgül sayfa seçimiyle grup ayrımı karışmaz. Noktalı virgül yalnız “Seçim gruplarını ayrı PDF yap” modunda kullanılır.

Önerilen normalleştirme: aynı çıktı grubu içindeki tekrar eden sayfa numaraları bir kez çıkarılır ve gösterimde tekrar uyarısı verilir. Her çıktı içindeki sayfalar kaynak PDF sırasındadır; gruplar arası sıra kullanıcı giriş sırasını izler. Ayrı gruplar arasında aynı sayfanın tekrarı mümkündür; bu açık grup seçimi olduğundan ayrı çıktılarda tekrar edebilir.

## Önerilen tutarlı modlar

| Mod | Alanın anlamı | Örnek sonuç |
|---|---|---|
| Seçili sayfaları tek PDF yap | Virgülle ayrılmış sayfalar/aralıklar bir çıktı grubudur | `1,5,9` → tek PDF: kaynak sayfaları 1, 5, 9 |
| Her seçili sayfayı ayrı PDF yap | Seçilen tüm sayfalar ayrı birer çıktı olur | `1,5,9` → üç tek sayfalı PDF |
| Seçim gruplarını ayrı PDF yap | Virgül bir grubun içini birleştirir; `;` yeni çıktı grubu başlatır | `1-5;9;11-13` → üç PDF: 1–5, 9, 11–13 |
| Klasik ardışık bölme | Alan, “şu sayfadan sonra kes” sınırlarını alır; seçili sayfa listesi değildir | 3 ve 7'den sonra kes → 1–3, 4–7, kalan sayfalar |

## İlk MVP için implementation choices

Bunlar üst düzey gereksinimden ayrılmış, ilk implementation için seçilen davranışlardır; ölçülmüş performans veya tarayıcı sonucu iddiası değildir.

- Varsayılan mod, seçimi tek PDF çıktısında toplar. Kullanıcı isterse her seçili sayfayı ayrı PDF veya `;` ile belirlediği grupları ayrı PDF olarak alabilir.
- Birden fazla çıktı oluştuğunda ZIP ana indirme eylemidir; ZIP içindeki her PDF için ayrıca tekil indirme eylemi de bulunur. Tek çıktı doğrudan PDF olarak indirilebilir.
- Dosya adları `sourcebase-part-001.pdf` kalıbını kullanır; `sourcebase`, kaynak dosyanın uzantısız adıdır. Yol/ayraç ve dosya sistemlerinde geçersiz karakterler temizlenir. Sıra numarası bütün çıktılarda artar ve adları benzersiz yapar.
- Aynı çıktı grubu içindeki yinelenen sayfalar kaynak sırasına göre tekilleştirilir ve işlem öncesi kullanıcıya uyarı gösterilir. Gruplar arası aynı sayfa tekrarı korunur.
- Şifreli PDF açıkça reddedilir; `ignoreEncryption` veya parola atlatma kullanılmaz. Bozuk ya da ayrıştırılamayan dosyada işlem başlamadan anlaşılır hata gösterilir.
- AcroForm gibi etkileşimli form veya dijital imza saptanırsa ilk MVP işlemi reddeder. Metin ve sayfa grafik içerikleri kaynak sayfalardan kopyalanır; annotations, bookmarks ve erişilebilirlik yapısının korunması vaat edilmez. İşlemden önce özel belge özelliklerinin korunmayabileceği uyarısı gösterilir.
- Uzun işlemde aşama ve o anda üretilen çıktı numarası gösterilir; geçen süreye dayanmayan sahte yüzde ilerleme gösterilmez.
- İptal, çalışan worker'ı sonlandırır ve kısmi/tamamlanmış sonuçları temizler. Reset, seçilen kaynak dosya ve çıktıları atar, oluşturulmuş tüm object URL'leri revoke eder ve belge belleği referanslarını temizler.
- Hiçbir normal, hata, iptal veya reset akışında PDF içeriği, dosya adı veya metadata sunucuya, analytics'e ya da başka uzak hedefe gönderilmez.

Klasik bölme modunda alan etiketi açıkça “Şu sayfalardan sonra kes” olmalıdır. Önerilen gösterim `3,7`; anlamı yalnızca her tamsayı için o sayfanın sonrasına kesim koymaktır. Çıktı parçası üretmek için en az iki sayfa ve 1 ile toplam sayfa sayısı eksi 1 arasında sınır gerekir. Önerilen varsayılan olarak tekrar eden kesim noktaları tekilleştirilir ve kesimler artan kaynak sırasına konur; önizleme gerçek oluşacak aralıkları gösterir.

### Tüm sayfalar kontrolü

PDF açılıp gerçek toplam `N` belirlendikten sonra “Tüm sayfalar” kontrolü etkinleşir. Seçim modlarında kontrol, giriş alanını `1-N` olarak doldurur ve çıktı özeti güncellenir. “Seçili sayfaları tek PDF yap” modunda bu, kaynak sırasındaki 1…N sayfalarını içeren tek PDF üretir. “Her seçili sayfayı ayrı PDF yap” modunda N adet tek sayfalı çıktı önerir ve kaynak bütçesi kontrolünden geçer. Kontrol, thumbnail'lara bağlı değildir. Klasik bölme modunda kesim noktaları anlamına gelmediği için gösterilmez.

## Doğrulama davranışı

- Boş seçim: işlem başlatılmaz; seçim gerektiği belirtilir.
- Sıfır, negatif değer, ondalık sayı veya tamsayı olmayan token: reddedilir; kabul edilen biçim örneklenir.
- Ters aralık (`5-1`): reddedilir; otomatik ters çevirme yapılmaz.
- Sayfa numarası toplam sayfa sayısından büyükse reddedilir ve gerçek toplam gösterilir. Örneğin 3 sayfalık dosyada `1-30` seçimi `1-3` olarak sessizce değiştirilmez.
- Boş token veya boş çıktı grubu (`1,,5`, `1;;5`, başta/sonda `;`): reddedilir.
- Aynı grupta yinelenen seçim tek kez çıkarılır ve kullanıcıya işlem öncesi uyarı gösterilir.
- Klasik bölmede kesim noktası `0`, negatif, ondalık, tamsayı biçimi dışı değer veya `N`/daha büyük değer olursa reddedilir; `N` kesimi boş çıktı üretirdi. Yinelenen kesim noktaları önerilen varsayılanla bir kez uygulanır.
- Sayfa tokenları tamsayı olarak ve taşma olmadan doğrulanır; `1 <= page <= N` kontrolü tamamlanmadan aralık genişletme veya çıktı oluşturma başlamaz. Sayı mevcut sayfa sayısını aşıyorsa doğrudan reddedilir.
- Girdi karakter sayısı/token/grup sayısı ve beklenen çıktı sayısı genişletme/işlem öncesinde bütçeye karşı kontrol edilir. Limit eşikleri telefon ve düşük donanımlı cihaz ölçümünden sonra belirlenecektir. Eşik aşılırsa isteğin tamamı anlaşılır mesajla reddedilir; sessiz truncation, kısmi çıktı veya eksik sayfa üretimi olmaz.
- Güvenli doğrulama sırası: ham karakter/token/grup üst sınırını kontrol et; sayısal token'ı taşmasız ve tam tamsayı olarak çözümle; uçları gerçek `N` ile karşılaştır; genişletilecek sayfa ve beklenen çıktı adedini kaynak bütçesiyle karşılaştır; ancak tüm kontroller geçerse sayfaları/çıktıları oluştur.
- Hiçbir geçersiz girdi sessizce clamp edilmez ya da boş çıktı olarak yutulmaz.

## Gerçek sayfa sayısıyla örnekler

| Kaynak | Mod ve girdi | Beklenen çıktı |
|---|---|---|
| 14 sayfa | “Tüm sayfalar”; Tek PDF modu | Alan `1-14` olur; bir PDF `[1-14]` |
| 14 sayfa | “Tüm sayfalar”; Her sayfa ayrı modu | Alan `1-14` olur; 14 çıktı: `[1]` … `[14]` (kaynak bütçesi uygunsa) |
| 14 sayfa | Tek PDF; `9` | Bir PDF: `[9]` |
| 14 sayfa | Tek PDF; `1-5` | Bir PDF: `[1,2,3,4,5]` |
| 14 sayfa | Tek PDF; `1,5,9,11,13` | Bir PDF: `[1,5,9,11,13]` |
| 14 sayfa | Tek PDF; `1-5,9,11-13` | Bir PDF: `[1,2,3,4,5,9,11,12,13]` |
| 14 sayfa | Her sayfa ayrı; `1,5,9` | Üç PDF: `[1]`, `[5]`, `[9]` |
| 14 sayfa | Grupları ayrı; `1-5;9;11-13` | Üç PDF: `[1,2,3,4,5]`, `[9]`, `[11,12,13]` |
| 14 sayfa | Klasik bölme; `3,7,11` (bu sayfalardan sonra kes) | Dört PDF: `[1-3]`, `[4-7]`, `[8-11]`, `[12-14]` |
| 3 sayfa | Tek PDF; `1-30` | Hata: sayfa 30, toplam 3 sayfayı aşıyor; işlem başlamaz |
| 3 sayfa | Tek PDF; `1-999999999999999999999` | Hata: tamsayı/gerçek sayfa sınırı doğrulaması başarısız; aralık genişletme ve PDF işlemi başlamaz |
| 3 sayfa | Varsayılan tek PDF; `1,2,2,3` | Yinelenen `2` için uyarı; tek PDF `[1,2,3]` |
| 14 sayfa | Tek PDF; `5-1` | Hata: aralık başlangıcı bitişinden büyük |

Köşeli parantezler kaynak sayfa numaralarını gösterir; `[1-3]` ardışık 1, 2, 3 sayfaları demektir.

## Arayüz önerileri — gereksinimlerden ayrı

- Önce dört moddan biri seçilir; yalnız o moda ait kısa açıklama ve giriş alanı görünür.
- Varsayılan olarak “Seçili sayfaları tek PDF yap” modu seçilidir.
- Seçim alanı gerçek `N` toplamını ve örnek sözdizimini gösterir; telefon klavyesiyle düzenlenebilir metin girişi sağlar.
- PDF sayfa sayısı bilindikten sonra “Tüm sayfalar” kontrolü seçimi `1-N` olarak doldurur; thumbnail olmadan çalışır.
- İşlemden önce çıktı gruplarının sayfa numaralarını ve kaç PDF üretileceğini metinle önizlet. Thumbnail'lar eklenirse de temel işlev bunlara bağlı kalmaz.
- Geçersiz girdi alan yanında açıklanır; geçerli girişte sayfa sınırlarının yanlış anlaşılmasını önleyen bir onay özeti gösterilir.

## Açık kararlar

- Seçili tüm sayfalar/gruplar için çıktı oluşturma modlarının adları ve tam arayüz sunumu.
- Seçilen ZIP ve tekil indirme seçeneklerinin hedef tarayıcılarda çalıştığının doğrulanması.
- Hedef tarayıcılar ile özel PDF özelliklerinin hangi durumlarda saptanabileceğinin ölçülmesi; annotations/bookmarks/erişilebilirlik yapısının korunacağına dair vaat yoktur.
- Telefon/düşük donanım ölçümüne bağlı maksimum karakter, token, grup, tek sayfa çıktısı ve tahmini bellek/işlem bütçesi eşikleri.

## Kabul ölçütleri

- Dilbilgisi, sayfa numaralarını 1 tabanlı ve aralık uçlarını dahil yorumlar.
- Her modda giriş semantiği nettir; virgül grup içi seçim birleştirir, `;` yalnız grupları ayırır, klasik moddaki virgül yalnız kesim noktalarını ayırır.
- Geçerli tekli, aralıklı, dağınık ve karışık örnekler doğru sayfaları doğru sayıda çıktıya yerleştirir.
- Her çıktı içindeki sayfalar kaynak sırasını korur; aynı gruptaki tekrarlar tekilleştirilip uyarılır, ayrı gruplardaki tekrarlar korunur.
- Klasik bölme kaynak sayfaların tümünü tam bir kez, boşluk veya örtüşme olmadan ardışık aralıklara ayırır.
- Boş, sıfır, negatif, decimal, ters aralık, boş token ve toplamı aşan sayfa girdileri işlem öncesi anlaşılır hata verir; otomatik clamp yoktur.
- Tamsayı taşması/temsil sınırı ve gerçek `N` kontrol edilmeden hiçbir aralık genişletilmez; `1-999999999999999999999` reddedilir.
- Ham girdi uzunluğu, token/grup sayısı ve beklenen çıktı adedi kaynak bütçesine karşı işlem öncesi kontrol edilir; eşikler ölçümle seçilir, aşım tüm isteği reddeder ve sessiz truncation/kısmi çıktı üretmez.
- “Tüm sayfalar” gerçek `N` üzerinden `1-N` seçer; tek PDF modunda tek PDF, her sayfa ayrı modunda N tek sayfalı çıktı önizler. İkinci mod yalnız kaynak bütçesi uygunsa işleme geçer.
- 3 sayfalık kaynakta `1-30` reddedilir; gerçek sayfa sayısı kullanıcıya gösterilir.
- Her çıktı PDF olarak oluşturulur; çıktı adedi, grup/sayfa sayısıyla eşleşir ve her dosyadaki kaynak sayfa indeksleri doğru sırada ve eksiksizdir.
- Çoklu çıktı ZIP indirmesi ve her PDF'nin tekil indirmesi; tek çıktı doğrudan indirme olarak hedef tarayıcıda bütün dosyaları kayıpsız ulaştırır.
- Her çıktı `sourcebase-part-001.pdf` biçiminde benzersiz, sıralı ad alır; geçersiz yol/dosya adı karakterleri temizlenir.
- Şifreli veya bozuk/ayrıştırılamayan PDF anlaşılır hata verir. AcroForm veya imza saptanırsa işlem reddedilir; özel özelliklerin korunduğu iddia edilmez ve işlem öncesi uyarı görünür.
- Uzun işlemlerde gerçek aşama ve geçerli çıktı sayacı gösterilir; geçen zamana göre uydurma yüzde ilerleme yoktur.
- İptal aktif worker'ı sonlandırır, kısmi/tamamlanmış sonuçları temizler; reset kaynak/çıktı referanslarını kaldırır ve tüm object URL'leri revoke eder.
- Normal, hata, iptal ve reset akışında PDF içeriği, dosya adı veya metadata sunucuya, analitik servisine ya da başka uzak hedefe gönderilmez.

## Çıktı teslim kararı

Seçim modu bir veya birden çok PDF oluşturur. Tek çıktı doğrudan indirilir; çoklu çıktıda ZIP ana indirme eylemi, her PDF ise ayrıca tekil indirmeye açık olur. Dosya adı kalıbı implementation choice olarak tanımlanmıştır; tarayıcı uyumluluğu doğrulanacaktır.
