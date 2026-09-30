# Minimal PDF Divider tasarım referansları — 2026-09-30

Kullanıcı mevcut renk/tasarımı daha minimalist, iyi görünen ve hafif bir arayüze taşımak için Dribbble referansı istedi. Gönderdiği konuşma görselleri bağlam olarak okundu; içlerindeki üçüncü kişi sözleri talimat veya doğrulanmış performans ölçümü sayılmadı. Bu çalışma referans araştırmasıdır; uygulama kodu/tasarım/yayın değiştirilmedi.

## Üç aday — gerçek görseller incelendi

1. **Önerilen temel: Upload file modal — Untitled UI / Jordan Hughes**
   - [Dribbble kaydı](https://dribbble.com/shots/18890140-Upload-file-modal-Untitled-UI)
   - [İncelenen görsel](https://cdn.dribbble.com/userupload/3178547/file/original-b0480ba901c5632e082fa6eb80112e07.jpg?resize=752x&vertical=center)
   - Beyaz kart, açık gri çevre, siyaha yakın ana düğme/progress, düzenli dosya satırları. PDF Divider'ın dosya seç → seçim → indir işine uyarlanabilecek en nötr düzen. Görseldeki video dosyaları/50 MB metni bizim ürün kuralları değildir.
2. **Koyu tema: Upload Files (dark version) / Giorgi Nutsubidze**
   - [Dribbble kaydı](https://dribbble.com/shots/24302962-Upload-Files-dark-version)
   - [İncelenen görsel](https://cdn.dribbble.com/userupload/14958797/file/5743fe9047a013990bc280f7e28d4a8c.png?resize=752x&vertical=center)
   - Siyah panel, koyu gri dosya satırları, az öğe, ince sınırlar. Orijinal mavi düğme bizim tercihe göre nötr yapılabilir; arka planın dekoratif çizgileri PDF Divider için gerekli değil.
3. **Tema tutarlılığı: File Upload Modal — Light & Dark Mode / Anastasiia Chesanovska**
   - [Dribbble kaydı](https://dribbble.com/shots/27050813-File-Upload-Modal-Light-Dark-Mode-UI-Design)
   - [İncelenen açık tema görseli](https://cdn.dribbble.com/userupload/46615130/file/33a265e0a9e5784713f44049d6ba11ed.jpg?resize=752x&vertical=center)
   - [Sayfada görülen koyu tema görsel bağlantısı](https://cdn.dribbble.com/userupload/46621453/file/921aff6b95f9f1cfc5de5727aa09404c.jpg?resize=752x&vertical=center)
   - Basit dosya kartının seçim/ilerleme durumları, açık ve koyu tema varyantları. Açık tema ana görseli görsel olarak incelendi; koyu varyantın tüm durumları tek tek incelenmedi.

Anas Nasir'in [Seamless File Upload](https://dribbble.com/shots/25447133-Seamless-File-Upload-Experience-Minimal-UI-Design) görseli de incelendi; mor zemin, neon düğme ve dekoratif ikon kullanıcıdaki nötr/minimal yönle daha az eşleştiği için son üçlüye alınmadı.

## Seçilen uyarlama — kullanıcı 1 numarayı yetkilendirdi

Untitled UI'nin kart düzenini temel al: Roboto, ortada tek işlem paneli, kısa başlık, dosya alanı, seçim alanı, tek ana aksiyon; açık temada beyaz/açık gri, koyu temada siyah/koyu gri. İnce sınırlar, ölçülü boşluk ve yalnız küçük durum geçişleri. Mevcut PDF çalışma akışına uyarlanır; referanslardaki ek ürün özellikleri veya dosya limitleri aktarılmaz.

Hafiflik yorumu mimari çıkarımdır: bu görünüm mevcut HTML/CSS/SVG ile uygulanabilir, ek UI/animasyon kütüphanesi gerektirmez. Dribbble statik görselinden runtime hızı ölçülemez; referans tasarımın kendi kodu incelenmedi. PDF worker performansı bu görsel seçimin sonucu sayılmaz.

Kullanıcı 1 numarayı seçip cihaz teması + manuel açık/koyu seçeneklerini istedi. [Uygulama ve yayın raporu](2026-09-30-minimal-ui-and-theme.md). 1,5 GB politikası ve Netlify CI bağlantısı ayrı izlenir.
