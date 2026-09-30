# Agent Handoff

Her builder, bağımsız reviewer ve hedefli repair tesliminde kullan. Yalnız gerçekten yapılmış işleri kaydet. Worker yalnız atandığı dosyaları yazar; ortak dosyalarda tek yazıcı kuralı geçerlidir.

## Kimlik ve kapsam

- Dilim/spec:
- Rol: `builder` / `reviewer` / `fixer`
- Durum: `BUILDING` / `REVIEWING` / `FIXING` / `PARENT_ACCEPTANCE` / `PASS` / `FAIL` / `BLOCKED`
- Bu teslimin dar hedefi:
- Bu teslimin kapsam dışı bıraktıkları:
- Dosya sahipliği ve değişen dosyalar:

## Yapılan iş ve kanıt

- Önemli uygulama/inceleme bulgusu:
- Gerçekte çalıştırılan build/static inspection komutları ve sonuçları:
- Kullanıcının istemediği için çalıştırılmayan testler (uygunsa):
- Gizlilik/ağ davranışı kontrolü ve kanıtı (yapılmadıysa açıkça belirt):
- Gerçek cihaz kontrolü (yapılmadıysa açıkça belirt):
- İlgili diff/çıktı/review konumu:

## Sonraki adım

- Reviewer bulguları (dosya/satır ve yeniden üretim dahil):
- Onarım turu: `kullanılmadı` / `kullanıldı`; süre:
- Kalan açık karar, risk veya engel:
- Tek sonraki eylem ve sahibi:
- Parent kabul kararı: `bekliyor` / `kabul` / `ret` — karar kanıtı:

Reviewer bulgusu çözülmeden veya parent kararı gelmeden worker sonucu faz `PASS` yapmaz. Build/test/review/cihaz kontrolü çalışmadıysa başarılı sayılmaz. `BLOCKED` durumunda aynı engeli varsayımla aşma; eksik kanıtı ve gereken kararı parent'a aktar.
