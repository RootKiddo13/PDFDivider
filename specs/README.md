# Spec İndeksi

## Belge haritası

- [01 — MVP scope](01-mvp-scope.md) — onaylı üst düzey akışın ayrıntıları ve kabul ölçütleri taslak.
- [02 — Sayfa seçimi ve çıktılar](02-page-selection-and-outputs.md) — seçim dilbilgisi, dört çıktı modu, hata ve indirme davranışı.
- [03 — Mobil ve performans](03-mobile-performance.md) — mobil kullanılabilirlik, bellek ve ölçüm kapıları.
- [Uygulama sırası](../agent-loop/implementation-order.md) — spec'lerin bağımlılıklarına göre aşamalar.
- [Teknik kararlar](../technical-decisions.md) — uygulama seçimleri ve ölçülmemiş geliştirme sınırları.
- [brief.md](../brief.md) — ürün amacı ve onaylı yön.
- [const.md](../const.md) — kullanıcı tarafından onaylanan kararlar.
- [hosting.md](../hosting.md) — veri akışı, hosting yönü ve yayın kapıları.
- [reports.md](../reports.md) — araştırma ve çalışma raporlarının merkezi.
- [agent-loop/README.md](../agent-loop/README.md) — implementation loop başlangıç protokolü.

## Spec kuralı

Spec'ler kullanıcı davranışını, kabul ölçütlerini, hata durumlarını ve ilgili gizlilik/veri akışını ayrıntılandırır. Onaylanan üst düzey ürün yönü sabit kalır; henüz seçilmemiş uygulama ayrıntıları taslak olarak işaretlenir.

## Durum

- Ürün yönü ve yüksek seviyeli MVP kapsamı: **onaylı**.
- Üç spec üzerinden geliştirme başlangıcı kullanıcı tarafından yetkilendirildi. Loop kayıtları gerçek ilerlemeyi tutar.
- Teknik seçimler uygulama kararlarıdır; hosting, domain, doğrulanmış kapasite ve minimum cihaz desteği açık kalır.
