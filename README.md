# Kazanım Oyunları

Türkiye Yüzyılı Maarif Modeli öğrenme çıktılarına göre hazırlanmış, sesli ve görselli ilkokul oyunları. Öğretmen sınıf, ders, öğrenme alanı ve öğrenme çıktısını seçer; ardından 15 oyun şablonundan birini açar.

**Durum:** pilot sürüm. Sorular taslaktır, yayından önce uzman ekip onayından geçecektir.

## Kapsam

- 1. sınıf Hayat Bilgisi: Ben ve Okulum
- 1. sınıf Matematik: 1. ve 4. tema (sorular her açılışta kurala göre yeniden üretilir)

## Şablonlar

Bil Bakalım, Kutuyu Aç, Balon Patlat, Eşleştir, Hafıza Kartları, Grupla, Çarkıfelek, Doğru mu Yanlış mı, Yarışma, Eşini Bul, Bilgi Kartları, Köstebek Vur, Sırala, Labirent, Uçan Meyve.

## Örnek yollar

`ornek/` klasörü, tek bir öğrenme çıktısının uçtan uca bitmiş hâlini gösterir: harita, konuşan ibibik, çıkartma ödülleri ve birbirinden farklı üç oyun. Emoji kullanılmaz; bütün görseller aynı çizim dilindedir.

| Yol | Çıktı | Duraklar |
|---|---|---|
| Sayılar Yolu (`ornek/`) | MAT.1.1.1, 20'ye kadar sayılar | Sepete Topla, Balonu Yakala, Eşini Bul |
| Sözcükler Yolu (`ornek/sozcukler.html`) | T.O.3.2 h ve T.Y.3.2 f, eş anlamlı sözcükler | Köprüyü Kur, Metinde Bul, Cümleyi Yenile |

`ornek/yol.js` ortak motordur (harita, ibibik, ödül, albüm). Her yol kendi dosyasında tanımlanır (`sayilar.js`, `sozcukler.js`). Sözcük çiftleri, metinler ve cümleler taslaktır.

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
