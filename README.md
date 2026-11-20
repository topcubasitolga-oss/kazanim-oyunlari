# Kazanım Oyunları

Türkiye Yüzyılı Maarif Modeli öğrenme çıktılarına göre hazırlanmış, sesli ve görselli ilkokul oyunları. Öğretmen sınıf, ders, öğrenme alanı ve öğrenme çıktısını seçer; ardından 15 oyun şablonundan birini açar.

**Durum:** pilot sürüm. Sorular taslaktır, yayından önce uzman ekip onayından geçecektir.

## Kapsam

- 1. sınıf Hayat Bilgisi: Ben ve Okulum
- 1. sınıf Matematik: 1. ve 4. tema (sorular her açılışta kurala göre yeniden üretilir)

## Şablonlar

Bil Bakalım, Kutuyu Aç, Balon Patlat, Eşleştir, Hafıza Kartları, Grupla, Çarkıfelek, Doğru mu Yanlış mı, Yarışma, Eşini Bul, Bilgi Kartları, Köstebek Vur, Sırala, Labirent, Uçan Meyve.

## Örnek durak: Sayılar Yolu

`ornek/` klasörü, tek bir öğrenme çıktısının (MAT.1.1.1) uçtan uca bitmiş hâlidir: harita, konuşan ibibik, çıkartma ödülleri ve üç farklı oyun (Sepete Topla, Balonu Yakala, Eşini Bul). Emoji kullanılmaz; bütün görseller aynı çizim dilindedir.

## Dosyalar

| Dosya | İçerik |
|---|---|
| `index.html` | Sayfa iskeleti |
| `style.css` | Tasarım |
| `app.js` | Seçim ekranı ve 15 oyun şablonu |
| `data.js` | Hayat Bilgisi soru havuzu |
| `data-mat.js` | Matematik soru üreticileri |
| `data-extra.js` | Sıralama dizileri |
| `assets.js` | Görseller (gömülü) |

Derleme adımı yoktur; `index.html` dosyasını tarayıcıda açmak yeterlidir.
