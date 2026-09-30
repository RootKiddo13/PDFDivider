# PDF Divider — Proje ve Ajan Talimatları

## Kaynaklar ve okuma sırası

Yeni bir PDF Divider çalışmasında şu belgeleri bu sırayla oku:

1. `AGENTS.md` (veya Claude oturumunda bu dosyanın eşleniği olan `claude.md`) — çalışma kuralları ve belge haritası.
2. `const.md` — kullanıcı tarafından kesinleştirilmiş ürün kararları.
3. `brief.md` — amaç, kullanıcı ve mevcut ürün yönü.
4. `reports.md` — rapor indeksi ve yalnız mevcut işle ilgili son kayıt; bütün rapor geçmişini yükleme.
5. `hosting.md` — veri akışı, hosting seçenekleri ve yayın kapıları.
6. `specs/README.md`, ardından yalnızca seçilen işin ilgili spec'i.
7. Implementation başladıysa `agent-loop/active-run.md` ve ilgili handoff/review kayıtları.

## Karar ve rapor kaynakları

- `const.md` onaylanmış kararları tutar. Belirsiz teknik tercihler buraya girmez.
- `brief.md` ürün amacını ve onaylanan üst düzey yönü açıklar.
- `specs/01-mvp-scope.md` onaylanan ürün yönünü ve hâlâ taslak olan akış/uygulama ayrıntılarını ayırır.
- `hosting.md` veri akışını ve yayın kapılarını kaydeder. Sağlayıcı ve domain seçilmiş kabul edilmez; yığın seçimleri technical-decisions.md içindedir.
- `reports.md` araştırma ve çalışma raporlarının merkezidir. Ayrıntılı ek raporlar gerektiğinde `reports/` altında tutulup buraya bağlanır.

## Onaylanmış ürün yönü

- Ürün adı: **PDF Divider**.
- Herkese açık yayımlanacak bir web uygulamasıdır.
- Tek bir PDF seçilir; tek sayfa, aralık, dağınık/karışık seçim, tüm sayfaları çıkarma ve klasik bölme akışları desteklenir.
- Telefonlar ve düşük donanımlı cihazlar için kullanılabilirlik ve optimizasyon temel gereksinimdir.
- Ücretsiz kullanımda hesap veya paywall gerekmez.
- PDF işleme her ziyaretçinin tarayıcısında yapılır; PDF dosyası uygulama sunucusuna yüklenmez veya orada saklanmaz.
- Dosya boyutu ve sayfa kapasitesi ölçümden sonra belirlenecektir; sınırsızlık vaadi verilmez.
- Birleştirme, dönüştürme, OCR, belge düzenleme, bulut saklama ve yerel masaüstü/mobil uygulamalar MVP kapsamı dışındadır.

## Çalışma kuralları

- Kullanıcı 2026-09-30 tarihinde geliştirmeyi başlatmayı açıkça istedi. Mevcut aşama implementation; yayın henüz yetkilendirilmiş bir işlem değildir.
- Sıra: spec'leri belirle → implementation order → loop protokolü → implementation. Her aşamanın gerçek durumunu kaydet; kanıtsız PASS sonucu yazma.
- Kullanıcının seçtiği `codex-orchestrator` skill'i ile scope'u daraltılmış agent görevleri kullan. Ana ajan entegrasyon ve son kararın sahibidir; worker gerekli spec/kaynak/handoff ile çalışır. Bütün sohbeti veya repo'yu her worker'a yükleme; worker başka agent açmaz.
- Rutin uygulama seçimlerini gerekçesiyle agent-loop/implementation-order.md veya teknik karar belgesine kaydet. Kullanıcının onaylı yönünü değiştirme; ölçülmemiş kapasiteyi doğrulanmış limit gibi gösterme.
- Gizlilik açıklamaları gerçek davranışla uyumlu olmalı. PDF içeriğini, dosya adını veya metadata'yı loglama ya da üçüncü tarafa gönderme.
- Yalnızca sentetik veya herkese açık örnek belge kullan; özel PDF'leri repoya ekleme.
- Teknik seçimler ve geçici geliştirme sınırları [technical-decisions.md](technical-decisions.md) içindedir. Hosting, domain, doğrulanmış kapasite ve minimum cihaz kapsamı açık kalır.
- Kullanıcı ayrıca istemedikçe test ekleme veya çalıştırma. Derleme, tip kontrolü ve statik kaynak incelemesinin sonuçlarını uygulama/gerçek cihaz testi olarak sunma.
- Production yayını, DNS değişikliği veya ücretli kaynak gerektiren adımları yalnızca kapsam ve kullanıcı yetkisi elverdiğinde yap.

## Ajan talimatı eşliği

`AGENTS.md` ve `claude.md` bu projedeki ajan talimatlarının eş dosyalarıdır. Birinde yapılan talimat değişikliği diğerine de aynen uygulanmalıdır.
