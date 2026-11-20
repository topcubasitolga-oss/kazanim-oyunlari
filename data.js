// Soru havuzu. Biçim:
//  quiz:   {q:"soru", e:"görsel", o:[doğru, çeldirici, çeldirici]}  (seçenek: "metin" ya da ["metin","görsel"])
//  pairs:  [[metin, görsel], [metin, görsel]]
//  groups: {t:"başlık", c:[[kategori, görsel],[kategori, görsel]], i:[[metin, görsel, kategoriSırası]]}
const POOL = {
  grade: "1. sınıf",
  course: "Hayat Bilgisi",
  area: "Ben ve Okulum",
  outcomes: [
    {
      code: "HB.1.1.1",
      text: "Öğretmeni ve arkadaşlarıyla tanışabilme",
      fit: "kismen",
      fitNote: "Tanışma sınıfta yaşanarak öğrenilir. Oyunlar yalnızca selamlaşma ve dinleme davranışlarını pekiştirir.",
      quiz: [
        {q: "Yeni bir arkadaşla tanışırken ne dersin?", e: "🧒", o: [["Merhaba, adın ne?", "👋"], ["Çekil buradan", "😠"], ["Hiçbir şey demem", "🤐"]]},
        {q: "Arkadaşın kendini tanıtıyor. Ne yaparsın?", e: "🗣️", o: [["Onu dinlerim", "👂"], ["Sözünü keserim", "✋"], ["Arkamı dönerim", "🔙"]]},
        {q: "Sabah sınıfa girince ne dersin?", e: "☀️", o: [["Günaydın", "🌞"], ["İyi geceler", "🌙"], ["Hoşça kal", "🚪"]]},
        {q: "Okuldan çıkarken öğretmenine ne dersin?", e: "🏫", o: [["Hoşça kalın", "👋"], ["Günaydın", "🌞"], ["Afiyet olsun", "🍽️"]]},
        {q: "Arkadaşının adını unuttun. Ne yaparsın?", e: "🤔", o: [["Adını kibarca sorarım", "🙂"], ["Ona lakap takarım", "😜"], ["Onunla konuşmam", "🤐"]]},
        {q: "Kendini tanıtırken önce ne söylersin?", e: "🙋", o: [["Adımı söylerim", "🏷️"], ["Bağırırım", "📢"], ["Saklanırım", "🙈"]]},
        {q: "Arkadaşın sana merhaba dedi. Sen ne dersin?", e: "👋", o: [["Merhaba", "😊"], ["Git buradan", "😠"], ["Cevap vermem", "🤐"]]},
        {q: "Biri konuşurken nereye bakarsın?", e: "👀", o: [["Konuşan kişiye", "🧑"], ["Tavana", "⬆️"], ["Pencereden dışarı", "🪟"]]},
        {q: "Oyuna katılmak istiyorsun. Ne dersin?", e: "⚽", o: [["Ben de oynayabilir miyim?", "🙂"], ["Topu alıp kaçarım", "🏃"], ["Oyunu bozarım", "💥"]]},
        {q: "Sınıfa yeni bir arkadaş geldi. Ne yaparsın?", e: "🚪", o: [["Hoş geldin derim", "🤗"], ["Onunla alay ederim", "😝"], ["Görmezden gelirim", "🙄"]]}
      ],
      pairs: [
        [["Sabah olunca", "☀️"], ["Günaydın", "🌞"]],
        [["Okuldan ayrılırken", "🚪"], ["Hoşça kal", "👋"]],
        [["Biri yardım edince", "🤝"], ["Teşekkür ederim", "💐"]],
        [["Bir şey isterken", "🙏"], ["Lütfen", "🙂"]],
        [["Hata yapınca", "😔"], ["Özür dilerim", "💬"]],
        [["Yeni arkadaş görünce", "🧒"], ["Merhaba, adın ne?", "❓"]],
        [["Yemek yerken", "🍽️"], ["Afiyet olsun", "😋"]],
        [["Gece yatarken", "🌙"], ["İyi geceler", "😴"]]
      ],
      groups: [
        {t: "Tanışırken nasıl davranırız?", c: [["Doğru davranış", "👍"], ["Yanlış davranış", "👎"]], i: [
          ["Gülümsemek", "😊", 0], ["Adını söylemek", "🏷️", 0], ["Dinlemek", "👂", 0], ["Selam vermek", "👋", 0], ["Konuşana bakmak", "👀", 0],
          ["Söz kesmek", "✋", 1], ["Alay etmek", "😝", 1], ["Bağırmak", "📢", 1], ["İtmek", "💥", 1], ["Lakap takmak", "😜", 1]
        ]}
      ]
    },
    {
      code: "HB.1.1.2",
      text: "Sınıf ve okul ortamını tanıyabilme",
      fit: "uygun",
      fitNote: "Okulun bölümleri, çalışanlar ve sınıf eşyaları eşleştirme ve sınıflama oyunlarına doğrudan uyar.",
      quiz: [
        {q: "Kitap okumak için okulda nereye gideriz?", e: "📖", o: [["Kütüphane", "📚"], ["Kantin", "🥪"], ["Spor salonu", "🏀"]]},
        {q: "Beden eğitimi dersini nerede yaparız?", e: "🤸", o: [["Spor salonu", "🏀"], ["Kütüphane", "📚"], ["Kantin", "🥪"]]},
        {q: "Teneffüste nerede oyun oynarız?", e: "🔔", o: [["Okul bahçesi", "🌳"], ["Müdür odası", "🚪"], ["Kütüphane", "📚"]]},
        {q: "Sınıfta bize kim ders anlatır?", e: "🏫", o: [["Öğretmen", "👩‍🏫"], ["Aşçı", "👨‍🍳"], ["Şoför", "🚌"]]},
        {q: "Okulu kim yönetir?", e: "🏫", o: [["Okul müdürü", "🧑‍💼"], ["Servis şoförü", "🚌"], ["Kantin görevlisi", "🥪"]]},
        {q: "Öğretmen yazıyı nereye yazar?", e: "✍️", o: [["Tahta", "🟩"], ["Pencere", "🪟"], ["Kapı", "🚪"]]},
        {q: "Kitaplarımızı okula neyle taşırız?", e: "📕", o: [["Çanta", "🎒"], ["Tabak", "🍽️"], ["Yastık", "🛏️"]]},
        {q: "Çöpümüzü nereye atarız?", e: "🧃", o: [["Çöp kutusu", "🗑️"], ["Sıranın altı", "🪑"], ["Bahçe", "🌳"]]},
        {q: "Okulda ellerimizi nerede yıkarız?", e: "🧼", o: [["Lavabo", "🚰"], ["Sınıf", "🏫"], ["Kütüphane", "📚"]]},
        {q: "Öğrencileri okula servisle kim getirir?", e: "🚌", o: [["Servis şoförü", "🧑‍✈️"], ["Aşçı", "👨‍🍳"], ["Doktor", "🩺"]]},
        {q: "Okulda temizlik işlerini kim yapar?", e: "🧹", o: [["Temizlik görevlisi", "🧽"], ["Okul müdürü", "🧑‍💼"], ["Servis şoförü", "🚌"]]},
        {q: "Okulda bir sorunun olursa önce kime söylersin?", e: "🙋", o: [["Öğretmenime", "👩‍🏫"], ["Tanımadığım birine", "❓"], ["Kimseye", "🤐"]]}
      ],
      pairs: [
        [["Kütüphane", "📚"], ["Kitap okuruz", "📖"]],
        [["Kantin", "🥪"], ["Yiyecek alırız", "🧃"]],
        [["Okul bahçesi", "🌳"], ["Oyun oynarız", "⚽"]],
        [["Sınıf", "🏫"], ["Ders işleriz", "✏️"]],
        [["Lavabo", "🚰"], ["Elimizi yıkarız", "🧼"]],
        [["Spor salonu", "🏀"], ["Spor yaparız", "🤸"]],
        [["Öğretmen", "👩‍🏫"], ["Ders anlatır", "📝"]],
        [["Servis şoförü", "🧑‍✈️"], ["Servisi kullanır", "🚌"]],
        [["Temizlik görevlisi", "🧽"], ["Okulu temizler", "🧹"]]
      ],
      groups: [
        {t: "Nerede bulunur?", c: [["Sınıfta", "🏫"], ["Okul bahçesinde", "🌳"]], i: [
          ["Tahta", "🟩", 0], ["Sıra", "🪑", 0], ["Kitaplık", "📚", 0], ["Askılık", "🧥", 0], ["Sınıf saati", "🕐", 0],
          ["Kaydırak", "🛝", 1], ["Ağaç", "🌲", 1], ["Bayrak direği", "🇹🇷", 1], ["Basket potası", "🏀", 1], ["Çiçekler", "🌷", 1]
        ]},
        {t: "Okul çantama ne koyarım?", c: [["Çantama koyarım", "🎒"], ["Evde kalır", "🏠"]], i: [
          ["Kalem", "✏️", 0], ["Defter", "📓", 0], ["Silgi", "🧽", 0], ["Kitap", "📕", 0], ["Boya kalemi", "🖍️", 0], ["Su matarası", "🥤", 0],
          ["Yastık", "🛏️", 1], ["Televizyon", "📺", 1], ["Tencere", "🍲", 1], ["Koltuk", "🛋️", 1], ["Terlik", "🩴", 1]
        ]}
      ]
    },
    {
      code: "HB.1.1.3",
      text: "Sınıf ve okul ortamında kurallara uygun davranabilme",
      fit: "uygun",
      fitNote: "Kuralı fark etme oyunla ölçülür. Kurala uygun davranma ise sınıfta gözlem formuyla izlenmelidir.",
      quiz: [
        {q: "Sınıfta söz almak için ne yaparız?", e: "🏫", o: [["Parmak kaldırırız", "✋"], ["Bağırırız", "📢"], ["Ayağa fırlarız", "🏃"]]},
        {q: "Koridorda nasıl yürürüz?", e: "🚶", o: [["Yavaş ve dikkatli", "🙂"], ["Koşarak", "🏃"], ["İterek", "💥"]]},
        {q: "Çöpümüzü ne yaparız?", e: "🧃", o: [["Çöp kutusuna atarız", "🗑️"], ["Yere atarız", "⬇️"], ["Sıraya saklarız", "🪑"]]},
        {q: "Arkadaşın konuşurken ne yaparsın?", e: "🗣️", o: [["Dinlerim", "👂"], ["Sözünü keserim", "✋"], ["Gürültü yaparım", "🥁"]]},
        {q: "Merdivenden nasıl ineriz?", e: "🪜", o: [["Tek tek, tutunarak", "🙂"], ["Koşarak", "🏃"], ["Atlayarak", "🤸"]]},
        {q: "Kantinde sıra var. Ne yaparsın?", e: "🥪", o: [["Sıraya girerim", "🧍"], ["Öne geçerim", "⏩"], ["Arkadaşımı iterim", "💥"]]},
        {q: "Zil çaldı, ders başlıyor. Ne yaparsın?", e: "🔔", o: [["Sınıfa girerim", "🏫"], ["Oynamaya devam ederim", "⚽"], ["Saklanırım", "🙈"]]},
        {q: "Arkadaşının kalemini kullanmak istiyorsun. Ne yaparsın?", e: "✏️", o: [["İzin isterim", "🙏"], ["İzinsiz alırım", "🫳"], ["Kalemi saklarım", "🙈"]]},
        {q: "Sınıf eşyalarını nasıl kullanırız?", e: "🪑", o: [["Özenle", "💛"], ["Kırarak", "💥"], ["Karalayarak", "🖍️"]]},
        {q: "Ellerini yıkadın. Musluğu ne yaparsın?", e: "🚰", o: [["Kapatırım", "✅"], ["Açık bırakırım", "💧"], ["Suyla oynarım", "💦"]]},
        {q: "Okula ne zaman geliriz?", e: "⏰", o: [["Zamanında", "✅"], ["Geç", "🐢"], ["İstediğimiz zaman", "🤷"]]},
        {q: "Kaydırakta sıra bekleniyor. Ne yaparsın?", e: "🛝", o: [["Sıramı beklerim", "🧍"], ["Arkadaşımı iterim", "💥"], ["Öne geçerim", "⏩"]]}
      ],
      pairs: [
        [["Söz almak için", "🗣️"], ["Parmak kaldır", "✋"]],
        [["Koridorda", "🚶"], ["Yavaş yürü", "🙂"]],
        [["Çöpünü", "🧃"], ["Çöp kutusuna at", "🗑️"]],
        [["Kantinde", "🥪"], ["Sıraya gir", "🧍"]],
        [["Zil çalınca", "🔔"], ["Sınıfa gir", "🏫"]],
        [["Kütüphanede", "📚"], ["Sessiz ol", "🤫"]],
        [["Merdivende", "🪜"], ["Tek tek in", "⬇️"]],
        [["Musluğu", "🚰"], ["Kapat", "✅"]]
      ],
      groups: [
        {t: "Kurala uygun mu?", c: [["Kurala uygun", "👍"], ["Kurala uygun değil", "👎"]], i: [
          ["Parmak kaldırmak", "✋", 0], ["Sıraya girmek", "🧍", 0], ["Çöpü kutuya atmak", "🗑️", 0], ["Sessizce dinlemek", "👂", 0], ["İzin istemek", "🙏", 0], ["Eşyaları korumak", "💛", 0],
          ["Koridorda koşmak", "🏃", 1], ["Söz kesmek", "🗣️", 1], ["Sırayı karalamak", "🖍️", 1], ["Arkadaşını itmek", "💥", 1], ["Yere çöp atmak", "🧃", 1], ["Derste bağırmak", "📢", 1]
        ]}
      ]
    },
    {
      code: "HB.1.1.4",
      text: "Bireysel özelliklerini açıklayabilme",
      fit: "kismen",
      fitNote: "Duyguları ve fiziksel özellikleri tanıma oyunla çalışılır. Çocuğun kendi özelliklerini anlatması sınıfta sözlü etkinlik gerektirir.",
      quiz: [
        {q: "Doğum gününde hediye aldın. Nasıl hissedersin?", e: "🎁", o: [["Mutlu", "😀"], ["Üzgün", "😢"], ["Kızgın", "😠"]]},
        {q: "Oyuncağın kırıldı. Nasıl hissedersin?", e: "🧸", o: [["Üzgün", "😢"], ["Mutlu", "😀"], ["Uykulu", "😴"]]},
        {q: "Bu yüz hangi duyguyu gösteriyor?", e: "😀", o: ["Mutlu", "Üzgün", "Kızgın"]},
        {q: "Bu yüz hangi duyguyu gösteriyor?", e: "😢", o: ["Üzgün", "Mutlu", "Şaşkın"]},
        {q: "Bu yüz hangi duyguyu gösteriyor?", e: "😠", o: ["Kızgın", "Mutlu", "Korkmuş"]},
        {q: "Bu yüz hangi duyguyu gösteriyor?", e: "😲", o: ["Şaşkın", "Üzgün", "Kızgın"]},
        {q: "Bu yüz hangi duyguyu gösteriyor?", e: "😨", o: ["Korkmuş", "Mutlu", "Kızgın"]},
        {q: "Hangisi fiziksel bir özelliktir?", e: "🧍", o: [["Saç rengi", "💇"], ["Mutlu olmak", "😀"], ["Resim yapmayı sevmek", "🎨"]]},
        {q: "Hangisi bir duygudur?", e: "💛", o: [["Mutluluk", "😀"], ["Saç rengi", "💇"], ["Boy uzunluğu", "📏"]]},
        {q: "Boyumuzu neyle ölçeriz?", e: "🧍", o: [["Metre", "📏"], ["Saat", "⏰"], ["Kaşık", "🥄"]]},
        {q: "Ağırlığımızı neyle ölçeriz?", e: "🧍", o: [["Tartı", "⚖️"], ["Metre", "📏"], ["Saat", "⏰"]]},
        {q: "Herkesin saç rengi aynı mıdır?", e: "💇", o: [["Hayır, farklı olabilir", "🌈"], ["Evet, hep aynıdır", "🟰"]]},
        {q: "Arkadaşın senden uzun. Bu nasıl bir durum?", e: "📏", o: [["Normal, herkes farklıdır", "🌈"], ["Kötü bir şey", "👎"], ["Onunla oynamam", "🚫"]]}
      ],
      pairs: [
        [["Mutlu", "💬"], ["Gülen yüz", "😀"]],
        [["Üzgün", "💬"], ["Ağlayan yüz", "😢"]],
        [["Kızgın", "💬"], ["Kaşları çatık yüz", "😠"]],
        [["Korkmuş", "💬"], ["Korkan yüz", "😨"]],
        [["Şaşkın", "💬"], ["Şaşıran yüz", "😲"]],
        [["Heyecanlı", "💬"], ["Gözleri parlayan yüz", "🤩"]],
        [["Uykulu", "💬"], ["Uyuyan yüz", "😴"]]
      ],
      groups: [
        {t: "Duygu mu, fiziksel özellik mi?", c: [["Duygu", "💛"], ["Fiziksel özellik", "🧍"]], i: [
          ["Mutlu", "😀", 0], ["Üzgün", "😢", 0], ["Kızgın", "😠", 0], ["Korkmuş", "😨", 0], ["Şaşkın", "😲", 0],
          ["Saç rengi", "💇", 1], ["Göz rengi", "👁️", 1], ["Boy", "📏", 1], ["Ağırlık", "⚖️", 1], ["Kıvırcık saç", "🧑‍🦱", 1]
        ]},
        {t: "Nasıl hissettirir?", c: [["Mutlu eder", "😀"], ["Üzer", "😢"]], i: [
          ["Arkadaşla oynamak", "🤝", 0], ["Hediye almak", "🎁", 0], ["Sarılmak", "🤗", 0], ["Aferin duymak", "⭐", 0], ["Parkta eğlenmek", "🛝", 0],
          ["Oyuncağın kırılması", "🧸", 1], ["Düşmek", "🩹", 1], ["Alay edilmesi", "😝", 1], ["Oyuna alınmamak", "🚫", 1], ["Dondurmanın düşmesi", "🍦", 1]
        ]}
      ]
    }
  ]
};
if (typeof module !== "undefined") module.exports = POOL;
