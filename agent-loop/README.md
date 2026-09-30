# PDF Divider — Implementation Loop

Bu loop, kullanıcı implementation'ı açıkça başlattığında spec'leri küçük ve gözden geçirilebilir teslimlere böler. Kullanıcı 30 Eylül 2026'da implementation başlangıcını yetkilendirdi. Güncel durum ve faz [active-run.md](active-run.md), sıralı iş dilimleri [implementation-order.md](implementation-order.md) içindedir.

## Teknoloji yönü

Parent'ın bu başlangıç için verdiği teknik yön: npm ile vanilla TypeScript + Vite; PDF yükleme/sayfa kopyalama/kaydetme bir Web Worker içinde `pdf-lib`; ZIP paketleme worker içinde `fflate`. Bunlar bu implementation başlangıcının kapsam kararlarıdır. Hosting/domain, cihaz desteği, kesin dosya/sayfa/çıktı limitleri ve production yayını kararı değildir.

## Durum akışı

```text
READY → BUILDING → REVIEWING → (FIXING → REVIEWING) → PARENT_ACCEPTANCE → PASS
             └──────────────────────→ BLOCKED
PASS → sıradaki onaylı dilim için READY
Kod/build/statik kabul + açık runtime kapıları → VALIDATION_PENDING
```

- Builder yalnız atanmış dilimi ve kendisine ait dosyaları değiştirir. Başlamadan önce ilgili spec'i ve gönderilen dar bağlam paketini okur.
- Her teslimden sonra bağımsız reviewer, değişikliği ve gerçek kontrol kanıtını inceler; aynı kodu yazan kişi kendi incelemesini bağımsız review diye raporlayamaz.
- Reviewer bulgusu varsa bir adet hedefli fixer turu yapılır: deliverable başına en çok 5 dakika. İlk build/review dilimi en çok 15 dakikadır. Eşik yetmezse durum `BLOCKED` olur; kanıt ve eksik karar parent'a aktarılır, süre sessizce uzatılmaz.
- Reviewer sonucu `PASS` değildir. Parent entegrasyonu, kapsam/kanıt kontrolü ve açık kabulü olmadan faz `PASS` sayılmaz.
- Bir fazın `PASS` olması yalnız o dilimin kabul edildiğini belirtir; tüm ürünün tamamlandığı anlamına gelmez. Ölçülmemiş kapasite ve yayın kapıları ayrıca açık kalır.

## Çalışma sınırları

- Bu loop içinde nested worker/agent açılmaz. Gerekli builder/reviewer/fixer görevlerini parent ayrı, eş düzey olarak yönetir.
- Görev devri minimal bağlam taşır: hedef spec ve ölçütler, yalnız gerekli API/karar bilgisi, sahip olunan dosyalar, geçerli revision/durum, tek sonraki iş ve doğrulanmış kanıt bağlantıları. Tam konuşma geçmişi kopyalanmaz.
- Aynı paylaşılan dosyada tek yazıcı olur. Diğer roller öneri veya bulgu döndürür; dosyayı ikinci kez eşzamanlı düzenlemez.
- Handoff şablonu [handoff-template.md](handoff-template.md) kullanılır. `reports.md` ve ortak ürün belgelerinin yazarı parent'tır; worker bu kaynakları değiştirmez.
- Build/static inspection yapılabilir. Kullanıcı istemedikçe test eklenmez veya çalıştırılmaz. Çalıştırılmayan build/test başarı gibi yazılmaz. Gerçek cihaz ölçümü yoksa performans/limit doğrulanmış sayılmaz.
- Kod diff'i ve ilgili kontroller gözden geçirilmeden, gizlilik/ağ davranışı incelenmeden ya da ürün kararları sessizce varsayılmadan teslim kabul edilmez.

## Her teslimin kayıtları

- İlgili ürün spec'i: kapsam ve kabul ölçütlerinin kaynağı.
- [active-run.md](active-run.md): güncel state, faz ve devir.
- [implementation-order.md](implementation-order.md): bağımlılık sırası ve faz kapıları.
- [handoff-template.md](handoff-template.md): build/review/repair handoff kaydı.
- [reports.md](../reports.md): ana rapor merkezi; yalnız parent günceller.

Kullanıcı implementation'ı başlatmış olsa da, her deliverable kanıtı tamamlanana dek bu klasör `READY`/`BUILDING` gibi gerçek durumu tutar; önceden `PASS` yazılmaz.

İlk implementation kodu ve derlemesi statik kapsamda kabul edildi. Gerçek dosya/browser/telefon doğrulaması açık olduğundan current run VALIDATION_PENDING; tüm ürün için PASS veya release-ready hükmü verilmedi.
