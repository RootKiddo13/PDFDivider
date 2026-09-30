# 1,5 GB boyut politikası ve adet sınırlarını kaldırma — 2026-09-30

## Kullanıcı kararı ve uygulama

Kullanıcı kaynak dosya, PDF ve ZIP boyutlarını 1,5 GB yapmayı; ayrıca sayfa ve çıktı sayısı sınırlarını kaldırmayı istedi. Güncel politika ondalık **1.500.000.000 bayt** olarak merkezi LIMITS üzerinden uygulanır:

- Kaynak PDF: en fazla 1,5 GB; UI ve worker kontrol eder.
- Oluşturulan PDF'lerin toplamı: en fazla 1,5 GB; worker ve UI kontrol eder.
- ZIP dosyası: en fazla 1,5 GB; worker önce üst boyut tahmini, sonra gerçek arşiv boyutunu kontrol eder, UI da kontrol eder.
- Eski 50 MiB birleşik PDF+ZIP ve 100 MiB ArrayBuffer/Blob guard'ları kaldırıldı. PDF ve ZIP aynı veriyi iki kez tuttuğu için dosya boyutu sınırı yarıya düşmez.
- 300 kaynak sayfası, 100 çıktı, 1000 toplam kopyalanan sayfa, 100 grup, 512 seçim öğesi ve 4096 seçim karakteri sınırları kaldırıldı. Böylece adet engelleri başka noktada tekrar uygulanmaz.
- Pozitif güvenli tam sayı, gerçek kaynak sayfa aralığı, doğru seçim dilbilgisi, boş/geçersiz/parolalı/imzalı/formlu PDF kontrolleri sürer.
- Her load/extract isteğindeki mevcut **120 saniyelik** süre sınırı ve kullanıcı iptali uygulanır; GB cinsindeki istek süre ayarı olarak yorumlanmadı.

Boyut değerleri doğrulanmış cihaz kapasitesi değildir. Kaynak belge, parser, PDF çıktıları, ZIP ve Blob kopyaları eşzamanlı tutulabilir; gerçek bellek ihtiyacı dosya boyutunu aşabilir. Fiziksel telefonda 1,5 GB çalışma garantisi verilmedi.

## Doğrulama ve yayın

`npm run build` TypeScript + Vite kontrolünü geçti. Kaynak taramasında eski count/selection/result budget LIMITS alanları kalmadı; diff kontrolü geçti. Test eklenmedi/çalıştırılmadı; gerçek 1,5 GB PDF, 300+ sayfa veya 100+ çıktı runtime denemesi yapılmadı.

Netlify mevcut `pdfdivider` projesine statik build ZIP'i yüklendi; dashboard **production 6abd6c1304e04f173b00be66 / Currently published / 23:07 İstanbul** gösterdi. Canlı https://pdfdivider.netlify.app/ HTTP 200, HTML yeni `/assets/index-2f6JixMl.js` varlığını kullanıyor; `/assets/pdf.worker-6kZWOZcI.js` HTTP 200. IAB reload sonrasında "En fazla 1,5 GB" ve genişletilmiş boyut açıklaması doğrulandı.

[Canlı boyut politikası görüntüsü](2026-09-30-1_5gb-limits.jpg). `const.md`, `technical-decisions.md`, görev ve proje haritası güncellendi. Netlify Git CI hâlâ bağlı değil; mevcut hesapta elle deployment yapıldı.
