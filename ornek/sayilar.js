/* Sayılar Yolu: MAT.1.1.1 "Rakamları ve 20'ye kadar olan sayıları, niceliklerin büyüklüklerini temsil etmek için kullanabilme"
   Üç durak: Sepete Topla (çokluk oluşturma), Balonu Yakala (çokluğu rakamla eşleme), Eşini Bul (rakam ve çokluk hafızası). */
(function () {
  "use strict";
  const { h, rnd, pick, shuffle, img, tone, sfx, speak, tell, later, idle, gameFrame, finish, starsFor, praise } = Yol;
  const WORDS = ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on", "on bir", "on iki", "on üç", "on dört", "on beş", "on altı", "on yedi", "on sekiz", "on dokuz", "yirmi"];
  const THINGS = [
    { id: "elma", ad: "elma", cog: "Elmalara" }, { id: "cilek", ad: "çilek", cog: "Çileklere" }, { id: "yildiz", ad: "yıldız", cog: "Yıldızlara" },
    { id: "cicek", ad: "çiçek", cog: "Çiçeklere" }, { id: "balik", ad: "balık", cog: "Balıklara" }, { id: "kelebek", ad: "kelebek", cog: "Kelebeklere" }, { id: "top", ad: "top", cog: "Toplara" }
  ];
  const GAMES = [
    { id: "g1", name: "Sepete Topla", prize: ["roket", "ucurtma"], play: playCollect },
    { id: "g2", name: "Balonu Yakala", prize: ["balon", "gokkusagi"], play: playBalloon },
    { id: "g3", name: "Eşini Bul", prize: ["yelkenli", "hediye"], play: playMemory }
  ];

  /* ---------- 1. durak: sepete topla ---------- */
  function playCollect() {
    const g = GAMES[0], R = [[2, 5], [4, 7], [6, 10], [8, 12], [11, 15], [14, 20]];
    const G = gameFrame(g, R.length);
    let r = 0, miss = 0;
    (function round() {
      G.at(r);
      const n = rnd(R[r][0], R[r][1]), th = pick(THINGS), total = Math.min(24, n + rnd(2, 4));
      let inb = 0, lock = false;
      const tray = h("div.tray", { "aria-label": "Sepettekiler" }, Array.from({ length: n > 10 ? 20 : 10 }, () => h("span.ts")));
      const cnt = h("div.count", { "aria-live": "polite" }, "0");
      const basket = h("div.basket", img("sepet"), cnt);
      const upd = () => { cnt.textContent = String(inb); };
      const field = h("div.field");
      for (let i = 0; i < total; i++) {
        const b = h("button.item", { type: "button", "aria-label": th.ad, style: "animation-delay:" + i * 30 + "ms;rotate:" + rnd(-14, 14) + "deg", onclick: () => {
          if (lock || inb >= 20) return;
          b.classList.add("gone"); inb++; upd(); sfx.pop(); speak(WORDS[inb], 1.05); idle(hint);
          const t = h("button", { type: "button", "aria-label": "Sepetten çıkar", onclick: () => { if (lock) return; t.remove(); b.classList.remove("gone"); inb--; upd(); sfx.flip(); } }, img(th.id));
          (Array.prototype.find.call(tray.children, x => !x.firstChild) || tray).append(t);
        } }, img(th.id));
        field.append(b);
      }
      const check = () => {
        if (lock) return;
        if (inb === n) {
          lock = true; sfx.ok(); basket.classList.add("win");
          tell(praise() + " Sepette tam " + WORDS[n] + " " + th.ad + " var.", "yildiz", "cheer");
          later(() => { r++; if (r < R.length) round(); else finish(g, G.scene, starsFor(miss, 1, 3), miss ? "Sepetleri " + miss + " düzeltmeyle doldurdun." : "Bütün sepetleri ilk seferde doğru doldurdun."); }, 2300);
        } else {
          miss++; sfx.no(); basket.classList.remove("shake"); void basket.offsetWidth; basket.classList.add("shake");
          tell(inb === 0 ? "Sepet boş. " + th.cog + " dokun, sepete gitsinler."
            : inb < n ? "Sepette " + WORDS[inb] + " tane var. " + WORDS[n - inb] + " tane daha koy."
            : "Sepette " + WORDS[inb] + " tane var. " + WORDS[inb - n] + " tanesini geri çıkar.", "aferin");
        }
      };
      const hint = () => tell(th.cog + " dokun, sepete gitsinler. Bitince Tamam'a bas.", "goster");
      const old = G.scene.querySelector(".basketrow"); if (old) old.remove();
      G.play.replaceChildren(
        h("div.task", h("span.num", String(n)), h("span.txt", WORDS[n] + " " + th.ad, h("small", "Sepete bu kadar koy.")), img(th.id)), field);
      G.scene.append(h("div.basketrow", tray, h("div.bcol", basket, h("button.btn", { type: "button", onclick: check }, "Tamam"))));
      tell("Sepete " + WORDS[n] + " tane " + th.ad + " koy.", "goster");
      idle(hint);
    })();
  }

  /* ---------- 2. durak: balonu yakala ---------- */
  function playBalloon() {
    const g = GAMES[1], R = [[1, 5], [3, 7], [5, 10], [7, 12], [10, 16], [13, 20]];
    const G = gameFrame(g, R.length);
    const COL = ["#F2675A", "#3D8BE8", "#14B89A", "#9B6BE8", "#FF9A2E"];
    let r = 0, miss = 0;
    (function round() {
      G.at(r);
      const n = rnd(R[r][0], R[r][1]), th = pick(THINGS), loose = r % 2 === 1;
      let lock = false;
      const opts = new Set([n]);
      while (opts.size < 3) { const v = n + rnd(-3, 3); if (v >= 1 && v <= 20) opts.add(v); }
      const cells = [];
      const fr = h("div.frame10" + (loose ? ".loose" : ""), { role: "img", "aria-label": n + " tane " + th.ad });
      if (loose) for (let i = 0; i < n; i++) { const c = h("div.cell", img(th.id)); cells.push(c); fr.append(c); }
      else for (let row = 0; row < Math.ceil(n / 5); row++) {
        const rw = h("div.row");
        for (let k = 0; k < 5; k++) { const i = row * 5 + k, c = h("div.cell", i < n ? img(th.id) : null); if (i < n) cells.push(c); rw.append(c); }
        fr.append(rw);
      }
      const zone = h("div.skyzone");
      const countAlong = () => {
        lock = true;
        tell("Birlikte sayalım: " + WORDS.slice(1, n + 1).join(", ") + ".", "aferin", "talk");
        cells.forEach((c, i) => later(() => { cells.forEach(x => x.classList.remove("hl")); c.classList.add("hl"); tone(440 + i * 18, 0, 0.08, "triangle", 0.08); }, 900 + i * 560));
        later(() => { cells.forEach(x => x.classList.remove("hl")); lock = false; tell("Şimdi " + WORDS[n] + " yazan balonu patlat.", "goster"); }, 1100 + n * 560);
      };
      shuffle([...opts]).forEach((v, i) => {
        const b = h("button.bal", { type: "button", "aria-label": WORDS[v], style: "--c:" + COL[(i + r) % COL.length] + ";left:" + (8 + i * 31 + rnd(-3, 3)) + "%;animation-duration:" + (11 + i * 1.6) + "s;animation-delay:-" + (2 + i * 3.4) + "s", onclick: () => {
          if (lock) return;
          if (v === n) {
            lock = true; sfx.pop(); sfx.ok();
            try { const m = new DOMMatrixReadOnly(getComputedStyle(b).transform); b.style.setProperty("--at", m.m42 + "px"); } catch (e) {}
            b.classList.add("popped"); zone.querySelectorAll(".bal:not(.popped)").forEach(x => x.classList.add("no"));
            tell(praise() + " " + WORDS[n] + " tane " + th.ad + ".", "yildiz", "cheer");
            later(() => { r++; if (r < R.length) round(); else finish(g, G.scene, starsFor(miss, 1, 3), miss ? miss + " kez birlikte saydık, sonra doğru balonu buldun." : "Bütün balonları ilk seferde buldun."); }, 2100);
          } else { miss++; sfx.no(); b.classList.add("no"); countAlong(); }
        } }, String(v));
        zone.append(b);
      });
      G.play.replaceChildren(fr, h("div.asks", "Kaç tane " + th.ad + " var?"), zone);
      zone.style.setProperty("--travel", Math.round(zone.clientHeight * 1.5 + 220) + "px");
      tell("Kaç tane " + th.ad + " var? Doğru balonu patlat.", "goster");
      idle(() => tell("Önce " + th.cog.toLocaleLowerCase("tr") + " bak ve say. Sonra o sayının balonuna dokun.", "goster"));
    })();
  }

  /* ---------- 3. durak: eşini bul ---------- */
  function playMemory() {
    const g = GAMES[2], B = [{ pairs: 4, lo: 1, hi: 6 }, { pairs: 6, lo: 5, hi: 15 }];
    const G = gameFrame(g, B.length);
    let bi = 0, miss = 0;
    (function board() {
      G.at(bi);
      const b = B[bi], th = pick(THINGS), ns = new Set();
      while (ns.size < b.pairs) ns.add(rnd(b.lo, b.hi));
      let open = [], lock = false, left = b.pairs, warned = false;
      const cards = [];
      [...ns].forEach(n => { cards.push({ n, k: "num" }); cards.push({ n, k: "grp" }); });
      const grid = h("div.board.c" + (b.pairs === 4 ? 4 : 6));
      shuffle(cards).forEach((c, i) => {
        const front = c.k === "num" ? h("b", String(c.n))
          : h("span.grp", { style: "grid-template-columns:repeat(" + (c.n <= 3 ? c.n : c.n <= 4 ? 2 : c.n <= 6 ? 3 : c.n <= 8 ? 4 : 5) + ",1fr);" + (c.n <= 2 ? "width:" + c.n * 42 + "%" : "") }, Array.from({ length: c.n }, () => img(th.id)));
        const el = h("button.card", { type: "button", "aria-label": "Kapalı kart", style: "animation-delay:" + i * 40 + "ms", onclick: () => {
          if (lock || el.classList.contains("up")) return;
          el.classList.add("up"); el.setAttribute("aria-label", c.k === "num" ? "Rakam " + WORDS[c.n] : c.n + " tane " + th.ad);
          sfx.flip(); if (c.k === "num") speak(WORDS[c.n], 1.05);
          open.push({ c, el }); idle(hint);
          if (open.length < 2) return;
          const [a, z] = open; open = [];
          if (a.c.n === z.c.n) {
            a.el.classList.add("match"); z.el.classList.add("match"); left--; sfx.ok();
            tell(WORDS[a.c.n][0].toLocaleUpperCase("tr") + WORDS[a.c.n].slice(1) + "! Eşini buldun.", "yildiz", "cheer");
            if (!left) later(() => { bi++; if (bi < B.length) board(); else finish(g, G.scene, starsFor(miss, 6, 12), "Bütün eşleri buldun."); }, 1900);
          } else {
            lock = true; miss++;
            if (!warned) { warned = true; tell("Bunlar eş değil. Yerlerini aklında tut.", "aferin"); }
            later(() => { [a, z].forEach(o => { o.el.classList.remove("up"); o.el.setAttribute("aria-label", "Kapalı kart"); }); lock = false; }, 1300);
          }
        } }, h("span.in", h("span.f.back", img("yildiz")), h("span.f.front", front)));
        grid.append(el);
      });
      const hint = () => tell("İki karta dokun. Rakam ile aynı sayıdaki " + th.ad + " kartını eşleştir.", "goster");
      G.play.replaceChildren(grid);
      tell(bi === 0 ? "Kartları çevir. Rakamı, o kadar " + th.ad + " olan kartla eşleştir." : "Şimdi daha büyük sayılar! Hadi eşlerini bul.", "goster");
      idle(hint);
    })();
  }

  Yol.start({
    key: "ko-sayilar-yolu",
    title: "Sayılar Yolu", acc: "Sayılar Yolu'nu",
    sub: "MAT.1.1.1 · 20'ye kadar sayılar",
    hello: "Merhaba, ben İbibik! Birlikte Sayılar Yolu'nda yürüyelim. Bir numaralı durağa dokun.",
    praise: ["Harika!", "Çok güzel saydın!", "Aferin sana!", "İşte bu!", "Süpersin!"],
    land: [[8, 86], [24, 60], [44, 71], [61, 50], [78, 64], [86, 37]],
    port: [[16, 88], [30, 72], [68, 62], [32, 49], [68, 38], [52, 24]],
    stickers: [["roket", "Roket"], ["ucurtma", "Uçurtma"], ["balon", "Sıcak hava balonu"], ["gokkusagi", "Gökkuşağı"], ["yelkenli", "Yelkenli"], ["hediye", "Hediye kutusu"], ["tac", "Taç"], ["kupa", "Kupa"]],
    chest: ["tac", "kupa"],
    games: GAMES
  });
})();
