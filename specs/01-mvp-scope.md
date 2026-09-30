# 01 — MVP Scope

**Durum:** İlk implementation yazıldı; derleme ve bağımsız kaynak incelemeleri tamamlandı. Gerçek PDF akışı/telefon kapasitesi henüz doğrulanmadı. [Teslim raporu](../reports/2026-09-30-initial-implementation.md).

## Ürün ve kullanım yönü

PDF Divider, ücretsiz ve herkese açık bir web uygulamasıdır. Kullanıcı tek bir PDF seçer; tek sayfa, aralık veya dağınık sayfa seçimi yapabilir; klasik ardışık bölme de sunulur. Seçim, moduna göre bir PDF ya da birden çok PDF çıktısı üretir. Ücretsiz kullanımda hesap/paywall yoktur. PDF her ziyaretçinin tarayıcısında işlenir; uygulama sunucusuna yüklenmez veya orada saklanmaz.

Onaylı kararlar için [const.md](../const.md), ürün amacı için [brief.md](../brief.md), sayfa seçimi ve çıktı davranışlarının işlenebilir sözleşmesi için [02-page-selection-and-outputs.md](02-page-selection-and-outputs.md) geçerlidir.

## Öncelikli kullanıcı ve cihaz gereksinimi

Uygulama telefonlarda ve düşük donanımlı cihazlarda iyi çalışmaya öncelik verir. Kapasite limitleri gerçek cihaz/tarayıcı ölçümlerine göre makul belirlenir. Daha önce geçen 50 MB ve 300 sayfa değerleri yalnız ölçüm hedefi/öneridir; onaylı limit değildir.

## MVP kapsamı

- Bir seferde tek PDF seçimi.
- Sayfa seçimi: tüm sayfalar, tek sayfa, dahil uçlu aralıklar ve dağınık sayfalar.
- Seçilen sayfaları tek PDF olarak, her sayfayı ayrı PDF olarak veya açıkça gruplanmış birden çok PDF olarak çıkarma.
- Varsayılan tek PDF çıktısı; çoklu çıktıda ZIP ana indirme, her PDF için ayrıca tekil indirme.
- Klasik ardışık PDF bölme.
- Hesap veya paywall olmadan ücretsiz kullanım.
- PDF'yi tarayıcıda işleme ve uygulama sunucusunda dosya saklamama.
- Geçersiz ve gerçek ölçüm sonrası belirlenecek limit üstü dosyalar için anlaşılır hata/işlem durumu.
- Telefon ve düşük donanım önceliğiyle belirlenecek kapasite sınırları; aşırı uzun giriş ve çok sayıda çıktı için kaynak bütçesi kontrolü.

## MVP kapsamı dışı

- PDF'leri birleştirme.
- PDF dönüştürme.
- OCR.
- PDF içeriğini düzenleme.
- Bulut dosya saklama veya sunucuda PDF işleme.
- Yerel masaüstü veya mobil uygulama.

## Kabul ölçütleri

Ayrıntılı doğrulama hedefleri ve örnekler [02-page-selection-and-outputs.md](02-page-selection-and-outputs.md) içindedir. Genel olarak seçilen sayfalar doğru çıktılara ve kaynak sırasına sahip olmalı; klasik bölme tüm kaynak sayfaları kayıpsız ve tekrarsız parçalara ayırmalı; üretilen PDF'ler geçerli olmalı; geçersiz/limit üstü dosyalar kullanıcıya anlaşılır biçimde reddedilmeli; indirme hedef tarayıcılarda çalışmalı; belge verisi tarayıcı dışına gönderilmemelidir.

## Açık uygulama kararları

- Hosting sağlayıcısı ve domain; yığın seçimi [teknik kararlar](../technical-decisions.md) içindedir.
- Ölçümle belirlenecek dosya boyutu/sayfa kapasitesi limitleri; 50 MB/300 sayfa yalnız başlangıç ölçüm hedefi.
- Telefon ve düşük donanım için destek matrisi, performans hedefleri ve ölçüm yöntemi.
- Sayfa seçim arayüzünün gerçek cihaz doğrulaması; ilk sürüm thumbnail üretmez.
- ZIP/tekil indirmenin hedef tarayıcı doğrulaması; ölçülmemiş kapasite limitleri ve özel PDF metadata/özelliklerinin korunması.
- Hata mesajları ve her kabul ölçütünün doğrulama yöntemi.
