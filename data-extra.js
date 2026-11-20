// Sıralama dizileri (doğru sırayla yazılır). Biçim: {t: "yönerge", i: [[metin, görsel], ...]}
(function () {
  const hb = (code, arr) => { const o = POOL.outcomes.find(x => x.code === code); if (o) o.orders = arr; };
  hb("HB.1.1.1", [
    { t: "Tanışırken sırayla ne yaparız?", i: [["Selam veririm", "👋"], ["Adımı söylerim", "🏷️"], ["Adını sorarım", "❓"], ["Onu dinlerim", "👂"]] },
    { t: "Oyuna katılmak için sırayla ne yaparız?", i: [["Yanlarına giderim", "🚶"], ["Merhaba derim", "👋"], ["Oynayabilir miyim derim", "🙂"], ["Birlikte oynarız", "⚽"]] }
  ]);
  hb("HB.1.1.2", [
    { t: "Okul günümü sırala.", i: [["Okula gelirim", "🎒"], ["Derse girerim", "✏️"], ["Teneffüse çıkarım", "⚽"], ["Eve dönerim", "🏠"]] },
    { t: "Kütüphanede sırayla ne yaparız?", i: [["Sessizce girerim", "🤫"], ["Kitap seçerim", "📚"], ["Kitabı okurum", "📖"], ["Yerine koyarım", "📥"]] }
  ]);
  hb("HB.1.1.3", [
    { t: "Zil çalınca sırayla ne yaparız?", i: [["Zil çalar", "🔔"], ["Sıraya girerim", "🧍"], ["Sınıfa girerim", "🏫"], ["Yerime otururum", "🪑"]] },
    { t: "Söz almak için sırayla ne yaparız?", i: [["Parmak kaldırırım", "✋"], ["Sıramı beklerim", "⏳"], ["Konuşurum", "🗣️"], ["Arkadaşımı dinlerim", "👂"]] }
  ]);
  hb("HB.1.1.4", [
    { t: "Büyüme sırasına diz.", i: [["Bebek", "👶"], ["Çocuk", "🧒"], ["Yetişkin", "🧑"], ["Yaşlı", "🧓"]] }
  ]);

  const R = n => Math.floor(Math.random() * n);
  const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const mat = code => MAT.areas.flatMap(a => a.outcomes || []).find(x => x.code === code);
  const N = a => a.map(x => [String(x), ""]);
  const distinct = (k, max) => shuf(Array.from({ length: max }, (_, i) => i + 1)).slice(0, k).sort((a, b) => a - b);
  const rep = (e, n) => { let s = ""; for (let i = 0; i < n; i++) s += e + ((i + 1) % 4 === 0 && i + 1 < n ? "\n" : ""); return s; };
  mat("MAT.1.1.1").orders = [
    { t: "Küçükten büyüğe sırala.", i: N(distinct(4, 10)) },
    { t: "Küçükten büyüğe sırala.", i: N(distinct(4, 20)) },
    { t: "Büyükten küçüğe sırala.", i: N(distinct(4, 20).reverse()) },
    { t: "Küçükten büyüğe sırala.", i: N(distinct(5, 20)) }
  ];
  mat("MAT.1.1.3").orders = [
    { t: "Sıra sayılarını sırala.", i: [["1.", ""], ["2.", ""], ["3.", ""], ["4.", ""], ["5.", ""]] },
    { t: "Sıra sayılarını sırala.", i: [["birinci", ""], ["ikinci", ""], ["üçüncü", ""], ["dördüncü", ""]] },
    { t: "Sıra sayılarını sırala.", i: [["3.", ""], ["4.", ""], ["5.", ""], ["6.", ""], ["7.", ""]] }
  ];
  mat("MAT.1.1.4").orders = ["🍎", "⭐", "🎈"].map(e => ({ t: "Azdan çoğa sırala.", i: distinct(4, 8).map(n => [rep(e, n), ""]) }));
  mat("MAT.1.1.5").orders = [
    { t: "Beşer sayarak sırala.", i: N([5, 10, 15, 20, 25]) },
    { t: "Onar sayarak sırala.", i: N([10, 20, 30, 40, 50]) },
    { t: "İkişer sayarak sırala.", i: N([2, 4, 6, 8, 10]) },
    { t: "20'den geriye birer sayarak sırala.", i: N([20, 19, 18, 17]) },
    { t: "20'den geriye ikişer sayarak sırala.", i: N([20, 18, 16, 14]) }
  ];
  mat("MAT.1.1.6").orders = [
    { t: "Artan örüntüyü sırala.", i: N([1, 3, 5, 7]) },
    { t: "Azalan örüntüyü sırala.", i: N([9, 7, 5, 3]) },
    { t: "Artan örüntüyü sırala.", i: N([4, 8, 12, 16]) },
    { t: "Azalan örüntüyü sırala.", i: N([20, 15, 10, 5]) }
  ];
  mat("MAT.1.2.2").orders = [
    { t: "Sonucu küçük olandan büyüğe sırala.", i: [["2 + 1", ""], ["3 + 3", ""], ["5 + 4", ""], ["10 + 2", ""]] },
    { t: "Sonucu küçük olandan büyüğe sırala.", i: [["6 − 4", ""], ["9 − 4", ""], ["4 + 4", ""], ["12 + 3", ""]] },
    { t: "Sonucu küçük olandan büyüğe sırala.", i: [["5 − 4", ""], ["2 + 2", ""], ["17 − 7", ""], ["11 + 6", ""]] }
  ];
})();
