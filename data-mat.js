// 1. sınıf Matematik havuzu. Sorular kurala göre üretilir; sınırlar öğretim programından alınmıştır:
// sayılar 20'ye kadar, toplama eldesiz ve toplam en çok 20, çıkarma onluk bozmadan, ritmik sayma 100'e kadar.
const MAT = (function () {
  const R = n => Math.floor(Math.random() * n);
  const pick = a => a[R(a.length)];
  const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = R(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const rep = (e, n) => { let s = ""; for (let i = 0; i < n; i++) s += e + ((i + 1) % 5 === 0 && i + 1 < n ? "\n" : ""); return s; };
  const WORDS = ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on", "on bir", "on iki", "on üç", "on dört", "on beş", "on altı", "on yedi", "on sekiz", "on dokuz", "yirmi"];
  const THINGS = [["elma", "🍎"], ["balon", "🎈"], ["yıldız", "⭐"], ["top", "⚽"], ["çiçek", "🌷"], ["balık", "🐟"], ["kalem", "✏️"], ["kelebek", "🦋"]];
  // doğru cevap başta olacak şekilde üç farklı sayı
  function nums(c, lo, hi) {
    const out = [c];
    const cand = shuf([c - 1, c + 1, c - 2, c + 2, c + 3, c - 3]).filter(x => x >= lo && x <= hi);
    for (const x of cand) { if (out.length < 3 && !out.includes(x)) out.push(x); }
    return out.map(String);
  }
  function uniq(list, key) { const seen = new Set(); return list.filter(x => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; }); }
  function gen(n, fn, key) { const out = []; for (let i = 0; i < n * 6 && out.length < n * 2; i++) out.push(fn()); return uniq(out, key || (x => x.q + "|" + x.e)).slice(0, n); }

  /* MAT.1.1.1 */
  const o111 = {
    code: "MAT.1.1.1", text: "Rakamları ve 20'ye kadar olan sayıları (20 dâhil), niceliklerin büyüklüklerini temsil etmek için kullanabilme",
    fit: "uygun", fitNote: "Sayma, rakam okuma ve rakamı çoklukla eşleme oyunla doğrudan çalışılır. Rakam yazma ayrıca defterde yapılmalıdır.",
    quiz: gen(12, () => { const [name, e] = pick(THINGS); const n = 2 + R(19); return { q: "Kaç tane " + name + " var?", e: rep(e, n), o: nums(n, 1, 20) }; })
      .concat(gen(6, () => { const n = 3 + R(18); return { q: "Hangisi " + WORDS[n] + "?", e: "🔢", o: nums(n, 1, 20) }; }, x => x.q)),
    pairHint: "Rakamı, okunuşu ya da çokluğu ile eşleştir.",
    pairs: [11, 12, 13, 15, 17, 20].map(n => [[String(n), ""], [WORDS[n], ""]]).concat([[["3", ""], ["🍎🍎🍎", ""]], [["4", ""], ["⭐⭐⭐⭐", ""]], [["5", ""], ["🎈🎈🎈🎈🎈", ""]], [["6", ""], ["🐟🐟🐟\n🐟🐟🐟", ""]]]),
    groups: [{ t: "10'dan küçük mü, büyük mü?", c: [["10'dan küçük", "⬇️"], ["10'dan büyük", "⬆️"]], i: [3, 5, 7, 8, 9, 2].map(n => [String(n), "", 0]).concat([11, 13, 15, 17, 19, 20].map(n => [String(n), "", 1])) }]
  };

  /* MAT.1.1.2 */
  const BALLS = [["🔴", "🔵"], ["🟢", "🟡"], ["🟣", "🟠"]];
  const o112 = {
    code: "MAT.1.1.2", text: "Ögeleri dağınık veya düzenli bir şekilde bulunan bir nesne grubunu sayarken parçalar arasında ilişkileri çözümleyebilme",
    fit: "uygun", fitNote: "Parça ve bütün ilişkisi (5'i ve 10'u tamamlama, iki parçayı birleştirme) oyunla çalışılır.",
    quiz: gen(10, () => { const [a, b] = pick(BALLS); const x = 1 + R(6), y = 1 + R(5); return { q: "İki grupta toplam kaç top var?", e: rep(a, x).replace(/\n/g, "") + "   " + rep(b, y).replace(/\n/g, ""), o: nums(x + y, 1, 12) }; })
      .concat(gen(6, () => { const t = pick([5, 10]); const x = 1 + R(t - 1); return { q: x + " topum var. " + t + " olması için kaç top daha gerekir?", e: rep("🔵", x), o: nums(t - x, 0, 10) }; })),
    pairHint: "Birlikte 10 eden sayıları eşleştir.",
    pairs: [[1, 9], [2, 8], [3, 7], [4, 6], [6, 4]].map(([a, b]) => [[String(a), ""], [String(b), ""]]),
    groups: [{ t: "Kaç tane? Saymadan bul.", c: [["5 tane", "5️⃣"], ["6 tane", "6️⃣"]], i: [
      ["🔵🔵🔵 🔵🔵", "", 0], ["🔵🔵🔵🔵 🔵", "", 0], ["🔵 🔵🔵🔵🔵", "", 0], ["🔵🔵 🔵🔵🔵", "", 0], ["🔵🔵\n🔵\n🔵🔵", "", 0],
      ["🔵🔵🔵 🔵🔵🔵", "", 1], ["🔵🔵🔵🔵 🔵🔵", "", 1], ["🔵🔵 🔵🔵🔵🔵", "", 1], ["🔵🔵🔵🔵🔵 🔵", "", 1], ["🔵🔵\n🔵🔵\n🔵🔵", "", 1]] }]
  };

  /* MAT.1.1.3 */
  const ANIMALS = [["Köpek", "🐶"], ["Kedi", "🐱"], ["Tavşan", "🐰"], ["Kaplumbağa", "🐢"], ["Kuş", "🐦"], ["Balık", "🐟"], ["Arı", "🐝"]];
  const ORD = ["", "birinci", "ikinci", "üçüncü", "dördüncü", "beşinci", "altıncı", "yedinci", "sekizinci"];
  const o113 = {
    code: "MAT.1.1.3", text: "Nesnelerin sıra sayısını gösterebilme",
    fit: "uygun", fitNote: "Sıradaki yeri bulma ve sıra sayısını okuma oyunla çalışılır.",
    quiz: gen(9, () => { const row = shuf(ANIMALS).slice(0, 5); const k = R(5); const others = shuf(row.filter((_, i) => i !== k)).slice(0, 2); return { q: "Baştan " + (k + 1) + ". hayvan hangisi?", e: row.map(a => a[1]).join(" "), o: [row[k]].concat(others) }; })
      .concat(gen(7, () => { const row = shuf(ANIMALS).slice(0, 5); const k = R(5); return { q: row[k][0] + " baştan kaçıncı sırada?", e: row.map(a => a[1]).join(" "), o: nums(k + 1, 1, 5).map(x => x + ".") }; })),
    pairHint: "Sıra sayısını okunuşuyla eşleştir.",
    pairs: [1, 2, 3, 4, 5, 6, 7, 8].map(n => [[n + ".", ""], [ORD[n], ""]]),
    groups: []
  };

  /* MAT.1.1.4 */
  const o114 = {
    code: "MAT.1.1.4", text: "İki niceliğin büyüklüğünü \"çok\", \"daha çok\", \"az\", \"daha az\" veya \"eşit\" terimleriyle karşılaştırabilme",
    fit: "uygun", fitNote: "İki çokluğu karşılaştırma oyunla doğrudan çalışılır.",
    quiz: gen(14, () => {
      const [A, B] = shuf(THINGS).slice(0, 2); const x = 1 + R(9); const y = R(4) === 0 ? x : 1 + R(9); const more = R(2) === 0;
      const ans = x === y ? ["Eşit", "🟰"] : ((x > y) === more ? [A[0], A[1]] : [B[0], B[1]]);
      const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
      const all = [[cap(A[0]), A[1]], [cap(B[0]), B[1]], ["Eşit", "🟰"]]; const a2 = [cap(ans[0]), ans[1]];
      return { q: more ? "Hangisi daha çok?" : "Hangisi daha az?", e: rep(A[1], x) + "\n\n" + rep(B[1], y), o: [a2].concat(all.filter(z => z[0] !== a2[0])) };
    }),
    pairHint: "Sayısı eşit olan grupları eşleştir.",
    pairs: [1, 2, 3, 4, 5, 6].map(n => [[rep("🍎", n), ""], [rep("🐟", n), ""]]),
    groups: [{ t: "5'ten az mı, çok mu?", c: [["5'ten az", "⬇️"], ["5'ten çok", "⬆️"]], i: [
      ["1", "", 0], ["2", "", 0], ["3", "", 0], ["4", "", 0], ["⭐⭐⭐", "", 0], ["🎈🎈", "", 0],
      ["6", "", 1], ["7", "", 1], ["8", "", 1], ["9", "", 1], ["⭐⭐⭐⭐\n⭐⭐⭐", "", 1], ["🎈🎈🎈\n🎈🎈🎈", "", 1]] }]
  };

  /* MAT.1.1.5 */
  const STEPW = { 1: "Birer", 2: "İkişer", 5: "Beşer", 10: "Onar" };
  const o115 = {
    code: "MAT.1.1.5", text: "100'e kadar ileriye ve 20'den geriye doğru ritmik sayabilme",
    fit: "uygun", fitNote: "Sıradaki sayıyı bulma oyunla çalışılır. Sesli ritmik sayma sınıfta ayrıca yapılmalıdır.",
    quiz: gen(11, () => { const s = pick([1, 2, 5, 10]); const max = s === 2 ? 20 : 100; const steps = Math.floor(max / s) - 3; const a = s * (1 + R(Math.max(1, steps))); const ans = a + 3 * s;
      const wrong = shuf(Array.from(new Set([ans + 1, ans - 1, ans + s, ans + 2, ans - 2]))).filter(x => x !== ans && x <= 100 && x >= 0).slice(0, 2);
      return { q: STEPW[s] + " ileri sayıyoruz. Sıradaki sayı kaç?", e: [a, a + s, a + 2 * s, "?"].join(" · "), o: [ans].concat(wrong).map(String) }; })
      .concat(gen(6, () => { const s = pick([1, 2]); const a = s === 2 ? 20 - 2 * R(6) : 20 - R(12); const ans = a - 3 * s;
        return { q: STEPW[s] + " geri sayıyoruz. Sıradaki sayı kaç?", e: [a, a - s, a - 2 * s, "?"].join(" · "), o: nums(ans, 0, 20) }; })),
    pairHint: "Onar sayarken sonra gelen sayıyı bul.",
    pairs: [10, 30, 50, 70, 90].map(n => [[String(n), ""], [String(n + 10), ""]]),
    groups: [{ t: "Beşer sayarken söylenir mi?", c: [["Söylenir", "✅"], ["Söylenmez", "❌"]], i: [5, 10, 15, 20, 25, 30].map(n => [String(n), "", 0]).concat([4, 7, 12, 18, 23, 31].map(n => [String(n), "", 1])) }]
  };

  /* MAT.1.1.6 */
  const SH = [["Kırmızı", "🔴"], ["Mavi", "🔵"], ["Yeşil", "🟢"], ["Sarı", "🟡"], ["Yıldız", "⭐"], ["Kalp", "❤️"], ["Ay", "🌙"]];
  const o116 = {
    code: "MAT.1.1.6", text: "Artan veya azalan sayı ve şekil örüntülerini çözümleyebilme",
    fit: "uygun", fitNote: "Örüntünün sıradaki ögesini bulma oyunla çalışılır. Kuralı sözle açıklama sınıfta yapılmalıdır.",
    quiz: gen(9, () => { const [A, B, C] = shuf(SH).slice(0, 3); const kind = pick(["AB", "AAB", "ABB", "ABC"]); const unit = kind.split("").map(ch => ({ A, B, C })[ch]); const len = unit.length * 2 + 1 + R(unit.length - 1 || 1); const seq = []; for (let i = 0; i < len; i++) seq.push(unit[i % unit.length]); const ans = unit[len % unit.length];
      return { q: "Örüntüde sıradaki hangisi?", e: seq.map(s => s[1]).join("") + "❓", o: [ans].concat([A, B, C].filter(s => s !== ans)) }; })
      .concat(gen(8, () => { const d = pick([1, 2, -1, -2]); const a = d > 0 ? 1 + R(10) : 20 - R(8); const ans = a + 3 * d;
        return { q: d > 0 ? "Sayılar artıyor. Sıradaki sayı kaç?" : "Sayılar azalıyor. Sıradaki sayı kaç?", e: [a, a + d, a + 2 * d, "?"].join(" · "), o: nums(ans, 0, 20) }; })),
    pairHint: "Örüntüyü, sıradaki ögesiyle eşleştir.",
    pairs: [[["🔴🔵🔴🔵", ""], ["🔴", ""]], [["🟢🟡🟡🟢🟡", ""], ["🟡", ""]], [["⭐🌙⭐🌙", ""], ["⭐", ""]], [["2 · 4 · 6", ""], ["8", ""]], [["5 · 4 · 3", ""], ["2", ""]], [["1 · 2 · 3", ""], ["4", ""]], [["10 · 12 · 14", ""], ["16", ""]]],
    groups: [{ t: "Artıyor mu, azalıyor mu?", c: [["Artan örüntü", "⬆️"], ["Azalan örüntü", "⬇️"]], i: [
      ["1 · 2 · 3 · 4", "", 0], ["2 · 4 · 6 · 8", "", 0], ["5 · 10 · 15", "", 0], ["10 · 11 · 12", "", 0], ["3 · 5 · 7", "", 0],
      ["9 · 8 · 7 · 6", "", 1], ["10 · 8 · 6 · 4", "", 1], ["20 · 19 · 18", "", 1], ["6 · 5 · 4 · 3", "", 1], ["15 · 10 · 5", "", 1]] }]
  };

  /* MAT.1.1.7 */
  const o117 = {
    code: "MAT.1.1.7", text: "Verilen bir çokluktaki ilişkilerden yararlanarak 20'ye kadar (20 dâhil) olan nesnelerin sayısını tahmin edebilme",
    fit: "kismen", fitNote: "Oyun yalnızca hızlı tahmini çalıştırır. Tahmini sayma sonucuyla karşılaştırıp yargıda bulunma sınıfta yapılmalıdır.",
    quiz: gen(12, () => { const [, e] = pick(THINGS); const t = pick([5, 10, 20]); const n = t === 20 ? 18 + R(3) : t - 1 + R(3); const s = shuf(Array.from({ length: n }, () => e)).join(" ");
      return { q: "Saymadan tahmin et. Yaklaşık kaç tane var?", e: s, o: [t].concat([5, 10, 20].filter(x => x !== t)).map(String) }; }, x => x.e),
    pairs: [],
    groups: [{ t: "Saymadan tahmin et.", c: [["10'dan az", "⬇️"], ["10'dan çok", "⬆️"]], i: [
      [rep("⭐", 4), "", 0], [rep("🎈", 5), "", 0], [rep("🍎", 6), "", 0], [rep("🐟", 3), "", 0], [rep("🌷", 5), "", 0],
      [rep("⭐", 15), "", 1], [rep("🎈", 17), "", 1], [rep("🍎", 14), "", 1], [rep("🐟", 18), "", 1], [rep("🌷", 16), "", 1]] }]
  };

  /* MAT.1.2.1 */
  const ADD = [["{a} kuş vardı. {b} kuş daha geldi.", "🐦"], ["Sepette {a} elma vardı. {b} elma daha koyduk.", "🍎"], ["{a} balonum vardı. {b} balon daha aldım.", "🎈"], ["Rafta {a} kitap vardı. {b} kitap daha ekledik.", "📚"], ["Bahçede {a} çocuk vardı. {b} çocuk daha geldi.", "🧒"], ["{a} kalemim vardı. Arkadaşım {b} kalem verdi.", "✏️"]];
  const SUB = [["{a} kuş vardı. {b} kuş uçup gitti.", "🐦"], ["Sepette {a} elma vardı. {b} elmayı yedik.", "🍎"], ["{a} balonum vardı. {b} balon patladı.", "🎈"], ["Rafta {a} kitap vardı. {b} kitabı aldık.", "📚"], ["Bahçede {a} çocuk vardı. {b} çocuk eve gitti.", "🧒"], ["{a} kalemim vardı. {b} kalemi arkadaşıma verdim.", "✏️"]];
  const fill = (t, a, b) => t.replace("{a}", a).replace("{b}", b);
  const o121 = {
    code: "MAT.1.2.1", text: "Günlük yaşamın içerdiği toplama ve çıkarma işlemlerini çözümleyebilme",
    fit: "uygun", fitNote: "Durumun hangi işlemi gerektirdiğini fark etme oyunla çalışılır.",
    quiz: gen(8, () => { const add = R(2) === 0; const [t, e] = pick(add ? ADD : SUB); const a = 4 + R(6), b = 1 + R(3);
      return { q: fill(t, a, b) + " Hangi işlemi yaparız?", e, o: add ? [["Toplama", "➕"], ["Çıkarma", "➖"]] : [["Çıkarma", "➖"], ["Toplama", "➕"]] }; }, x => x.q)
      .concat(gen(8, () => { const add = R(2) === 0; const [t, e] = pick(add ? ADD : SUB); const a = 5 + R(5), b = 1 + R(3);
        return { q: fill(t, a, b) + " Hangi işlem?", e, o: add ? [a + " + " + b, a + " − " + b, (a + b) + " − " + a] : [a + " − " + b, a + " + " + b, b + " + " + b] }; }, x => x.q)),
    pairHint: "Durumu, işlemiyle eşleştir.",
    pairs: [[["3 elma, 2 elma daha", "🍎"], ["3 + 2", ""]], [["5 balon, 1'i patladı", "🎈"], ["5 − 1", ""]], [["4 kuş, 4 kuş daha", "🐦"], ["4 + 4", ""]], [["6 kalem, 2'sini verdim", "✏️"], ["6 − 2", ""]], [["2 kitap, 5 kitap daha", "📚"], ["2 + 5", ""]], [["7 çiçek, 3'ü soldu", "🌷"], ["7 − 3", ""]]],
    groups: [{ t: "Toplama mı, çıkarma mı?", c: [["Toplama", "➕"], ["Çıkarma", "➖"]], i: [
      ["Daha aldı", "🛍️", 0], ["Yanına geldi", "🚶", 0], ["Ekledi", "📥", 0], ["Birleştirdi", "🧩", 0], ["Çoğaldı", "📈", 0], ["Arttı", "⬆️", 0],
      ["Uçup gitti", "🐦", 1], ["Kırıldı", "💥", 1], ["Arkadaşına verdi", "🎁", 1], ["Azaldı", "📉", 1], ["Eksildi", "⬇️", 1], ["Patladı", "🎈", 1]] }]
  };

  /* MAT.1.2.2 */
  function addEx() { for (;;) { const a = 1 + R(18), b = 1 + R(18); if (a + b <= 20 && (a % 10) + (b % 10) < 10) return [a, b]; } }
  function subEx() { for (;;) { const a = 2 + R(19), b = 1 + R(a - 1); if (a <= 20 && (a % 10) >= (b % 10)) return [a, b]; } }
  function exprs(n) { const used = new Set(), out = []; for (let i = 0; i < 400 && out.length < n; i++) { const add = R(2) === 0; const [a, b] = add ? addEx() : subEx(); const r = add ? a + b : a - b; if (used.has(r)) continue; used.add(r); out.push([a + (add ? " + " : " − ") + b, r]); } return out; }
  const o122 = {
    code: "MAT.1.2.2", text: "Toplama ve çıkarma işlemlerinin sonuçlarını tahminde bulunarak ve zihinden işlem yaparak muhakeme edebilme",
    fit: "uygun", fitNote: "Zihinden toplama ve çıkarma oyunla doğrudan çalışılır. Toplama eldesiz, çıkarma onluk bozmadan, sayılar 20'ye kadardır.",
    quiz: gen(9, () => { const [a, b] = addEx(); return { q: "Toplamı kaç eder?", e: a + " + " + b, o: nums(a + b, 0, 20) }; })
      .concat(gen(9, () => { const [a, b] = subEx(); return { q: "Sonuç kaç eder?", e: a + " − " + b, o: nums(a - b, 0, 20) }; })),
    pairHint: "İşlemi, sonucuyla eşleştir.",
    pairs: exprs(8).map(([x, r]) => [[x, ""], [String(r), ""]]),
    groups: [{ t: "Sonuç 10'dan küçük mü, büyük mü?", c: [["10'dan küçük", "⬇️"], ["10'dan büyük", "⬆️"]], i: [
      ["3 + 4", "", 0], ["9 − 2", "", 0], ["5 + 3", "", 0], ["8 − 5", "", 0], ["2 + 2", "", 0], ["17 − 12", "", 0],
      ["10 + 5", "", 1], ["12 + 6", "", 1], ["19 − 4", "", 1], ["11 + 3", "", 1], ["18 − 5", "", 1], ["14 + 5", "", 1]] }]
  };

  /* MAT.1.2.3 */
  const o123 = {
    code: "MAT.1.2.3", text: "Eşit işaretinin anlamını toplama ve çıkarma işlemi bağlamında yorumlayabilme",
    fit: "uygun", fitNote: "Eşitliğin iki yanını dengeleme oyunla çalışılır. Dönüştürdüğü işlemi kendi cümlesiyle anlatma sınıfta yapılmalıdır.",
    quiz: gen(7, () => { const t = 4 + R(7); const a = 1 + R(t - 1), c = 1 + R(t - 1); if (a === c) return { q: "", e: "" }; return { q: "İki taraf eşit olmalı. Soru işaretinin yerine hangi sayı gelir?", e: a + " + " + (t - a) + " = " + c + " + ?", o: nums(t - c, 0, 10) }; }).filter(x => x.q)
      .concat(gen(5, () => { const t = 3 + R(8); const a = 1 + R(t - 1); return { q: "Soru işaretinin yerine hangi sayı gelir?", e: t + " = ? + " + a, o: nums(t - a, 0, 10) }; }))
      .concat(gen(5, () => { const a = 1 + R(5), b = 1 + R(4); return { q: "Hangi eşitlik doğru?", e: "🟰", o: [a + " + " + b + " = " + (a + b), a + " + " + b + " = " + (a + b + 1), a + " + " + b + " = " + (a + b - 1)] }; }, x => x.o[0])),
    pairHint: "Sonucu eşit olan işlemleri eşleştir.",
    pairs: [["2 + 3", "4 + 1"], ["3 + 3", "5 + 1"], ["6 + 1", "3 + 4"], ["4 + 4", "6 + 2"], ["5 + 4", "7 + 2"], ["5 + 5", "8 + 2"]].map(([a, b]) => [[a, ""], [b, ""]]),
    groups: [{ t: "Eşitlik doğru mu?", c: [["Doğru", "✅"], ["Yanlış", "❌"]], i: [
      ["2 + 2 = 4", "", 0], ["5 = 3 + 2", "", 0], ["4 + 1 = 5", "", 0], ["6 = 6", "", 0], ["3 + 4 = 7", "", 0], ["10 = 5 + 5", "", 0],
      ["3 + 3 = 5", "", 1], ["7 = 4 + 2", "", 1], ["2 + 6 = 9", "", 1], ["8 = 7", "", 1], ["5 + 4 = 8", "", 1], ["1 + 1 = 3", "", 1]] }]
  };

  /* MAT.1.2.4 */
  function fam() { for (;;) { const a = 2 + R(8), b = 1 + R(8); if (a !== b && a + b <= 15) return [a, b]; } }
  const fams = (function () { const used = new Set(), out = []; for (let i = 0; i < 300 && out.length < 6; i++) { const [a, b] = fam(); if (used.has(a + b)) continue; used.add(a + b); out.push([a, b]); } return out; })();
  const o124 = {
    code: "MAT.1.2.4", text: "Toplama ve çıkarma işlemlerinin ilişkisini yorumlayabilme",
    fit: "uygun", fitNote: "Toplamayı çıkarmaya, çıkarmayı toplamaya dönüştürme oyunla çalışılır.",
    quiz: gen(8, () => { const [a, b] = fam(); return { q: "Buna göre " + (a + b) + " − " + b + " kaç eder?", e: a + " + " + b + " = " + (a + b), o: nums(a, 0, 15) }; })
      .concat(gen(6, () => { const [a, b] = fam(); return { q: "Hangi çıkarma işlemi bununla ilgilidir?", e: a + " + " + b + " = " + (a + b), o: [(a + b) + " − " + b + " = " + a, (a + b) + " − " + b + " = " + (a + 1), (a + b + 1) + " − " + b + " = " + (a + 1)] }; })),
    pairHint: "Toplamayı, tersi olan çıkarmayla eşleştir.",
    pairs: fams.map(([a, b]) => [[a + " + " + b + " = " + (a + b), ""], [(a + b) + " − " + b + " = " + a, ""]]),
    groups: []
  };

  return { areas: [
    { name: "1. Tema: Sayılar ve Nicelikler (1)", outcomes: [o111, o112, o113, o114, o115, o116, o117] },
    { name: "2. Tema: Sayılar ve Nicelikler (2)" },
    { name: "3. Tema: Sayılar ve Nicelikler (3)" },
    { name: "4. Tema: İşlemlerden Cebirsel Düşünmeye", outcomes: [o121, o122, o123, o124] },
    { name: "5. Tema: Nesnelerin Geometrisi (1)" },
    { name: "6. Tema: Nesnelerin Geometrisi (2)" },
    { name: "7. Tema: Veriye Dayalı Araştırma" }
  ] };
})();
if (typeof module !== "undefined") module.exports = MAT;
