/* Sözcükler Yolu: 3. sınıf Türkçe, eş anlamlı sözcükler.
   T.O.3.2 h) "Okuduğu metindeki zıt ve eş anlamlı sözcükleri bulur."
   T.Y.3.2 f) "Yazılarında eş anlamlı sözcükleri kullanır."
   Üç durak: Köprüyü Kur (çiftleri tanıma), Metinde Bul (metinde bulma), Cümleyi Yenile (cümlede kullanma).
   Sözcük çiftleri, metinler ve cümleler taslaktır; yayından önce uzman onayından geçmelidir. */
(function () {
  "use strict";
  const { h, pick, shuffle, img, ic, cap, sfx, speak, tell, later, idle, gameFrame, finish, starsFor, dbg } = Yol;

  /* [yaygın sözcük, eş anlamlısı, görsel] */
  const PAIRS = [
    ["okul", "mektep", "k_okul"], ["doktor", "hekim", "k_doktor"], ["kalp", "yürek", "k_kalp"], ["rüzgâr", "yel", "k_ruzgar"],
    ["ırmak", "nehir", "k_irmak"], ["sonbahar", "güz", "k_sonbahar"], ["kırmızı", "al", "k_kirmizi"], ["siyah", "kara", "k_siyah"],
    ["öğrenci", "talebe", "k_ogrenci"], ["şehir", "kent", "k_sehir"], ["öykü", "hikâye", "k_oyku"], ["yaşlı", "ihtiyar", "k_yasli"],
    ["hediye", "armağan", "s_hediye"],
    ["beyaz", "ak"], ["yıl", "sene"], ["cevap", "yanıt"], ["kelime", "sözcük"], ["ad", "isim"], ["misafir", "konuk"],
    ["zengin", "varlıklı"], ["fakir", "yoksul"], ["küçük", "ufak"], ["uzak", "ırak"], ["vatan", "yurt"]
  ];
  /* h: metinde aranacaklar. ask: sorulan sözcük, ans: metindeki doğru biçimler, root: yalın hâli, zit: zıt anlamlı tuzaklar */
  const TEXTS = [
    { t: "Sabah erkenden yola çıktım. Bizim mektep, kentin en eski binasıdır. Bahçesinde büyük bir çınar ağacı var.",
      h: [{ ask: "okul", ans: ["mektep"], root: "mektep" }, { ask: "şehir", ans: ["kentin"], root: "kent" }] },
    { t: "Dün akşam evimize konuk geldi. Teyzem bana küçük bir armağan getirdi. Paketi açınca çok sevindim.",
      h: [{ ask: "misafir", ans: ["konuk"], root: "konuk" }, { ask: "hediye", ans: ["armağan"], root: "armağan" }] },
    { t: "Güz gelince yapraklar sararır. Sert bir yel esti ve yaprakları uçurdu. Bahçemiz sarı yapraklarla doldu.",
      h: [{ ask: "sonbahar", ans: ["güz"], root: "güz" }, { ask: "rüzgâr", ans: ["yel"], root: "yel" }] },
    { t: "Kedim Pamuk'un tüyleri ak, kuyruğu ise karadır. Boynuna al bir kurdele taktım. Onu çok seviyorum.",
      h: [{ ask: "beyaz", ans: ["ak"], root: "ak", zit: { "karadır": "kara" } }, { ask: "siyah", ans: ["karadır"], root: "kara", zit: { ak: "ak" } }, { ask: "kırmızı", ans: ["al"], root: "al" }] },
    { t: "Dedem yetmiş yaşında, ihtiyar bir adamdır. Her yıl köyüne gider. Bu sene ben de onunla gideceğim.",
      h: [{ ask: "yaşlı", ans: ["ihtiyar"], root: "ihtiyar" }, { ask: "yıl", ans: ["sene"], root: "sene" }] },
    { t: "Öğretmen tahtaya zor bir soru yazdı. Elif parmak kaldırdı ve doğru yanıt verdi. Sonra yeni öğrendiği sözcüğü defterine yazdı.",
      h: [{ ask: "cevap", ans: ["yanıt"], root: "yanıt" }, { ask: "kelime", ans: ["sözcüğü"], root: "sözcük" }] },
    { t: "Hasta olunca annem beni hekime götürdü. Hekim önce yüreğimi dinledi. Sonra bana bir ilaç yazdı.",
      h: [{ ask: "doktor", ans: ["hekime", "hekim"], root: "hekim" }, { ask: "kalp", ans: ["yüreğimi"], root: "yürek" }] },
    { t: "Masalda zengin bir tüccar ile yoksul bir oduncu varmış. Oduncunun ufak bir kulübesi varmış. Tüccar ise çok uzak bir ülkede yaşarmış.",
      h: [{ ask: "fakir", ans: ["yoksul"], root: "yoksul", zit: { zengin: "zengin" } }, { ask: "küçük", ans: ["ufak"], root: "ufak" }] }
  ];
  /* s: cümle, {…} yenilenecek sözcük; a: eş anlamlısı; d: çeldiriciler */
  const SENT = [
    { s: "Teyzem bana güzel bir {hediye} getirdi.", a: "armağan", d: ["sene", "yel"] },
    { s: "Bu {yıl} üçüncü sınıfa başladım.", a: "sene", d: ["güz", "kent"] },
    { s: "{Doktor} beni muayene etti.", a: "hekim", d: ["talebe", "konuk"] },
    { s: "Öğretmenin sorusuna doğru {cevap} verdim.", a: "yanıt", d: ["sözcük", "isim"] },
    { s: "Dedem çok {yaşlı} bir adamdır.", a: "ihtiyar", d: ["yoksul", "ufak"] },
    { s: "Akşam bize {misafir} gelecek.", a: "konuk", d: ["hekim", "talebe"] },
    { s: "Bayrağımızın rengi {kırmızı} ve beyazdır.", a: "al", d: ["kara", "güz"] },
    { s: "{Rüzgâr} yaprakları uçurdu.", a: "yel", d: ["nehir", "güz"] },
    { s: "Köyün yanından bir {ırmak} akıyor.", a: "nehir", d: ["yel", "kent"] },
    { s: "Kedimin tüyleri {siyah}.", a: "kara", d: ["ak", "al"] },
    { s: "Bu {kelime} ne demek?", a: "sözcük", d: ["yanıt", "isim"] },
    { s: "Bebeğe güzel bir {ad} koydular.", a: "isim", d: ["sözcük", "yanıt"] },
    { s: "{Sonbahar} gelince yapraklar sararır.", a: "güz", d: ["yel", "sene"] },
    { s: "Ali çalışkan bir {öğrenci}.", a: "talebe", d: ["hekim", "konuk"] },
    { s: "İstanbul çok büyük bir {şehir}.", a: "kent", d: ["yurt", "mektep"] },
    { s: "Bu {öykü} çok hoşuma gitti.", a: "hikâye", d: ["sözcük", "sene"] },
    { s: "Koşunca {kalp} hızlı atar.", a: "yürek", d: ["yel", "kent"] }
  ];
  const GAMES = [
    { id: "k1", name: "Köprüyü Kur", prize: ["kitap", "kalem"], play: playBridge },
    { id: "k2", name: "Metinde Bul", prize: ["buyutec", "baykus"], play: playHunt },
    { id: "k3", name: "Cümleyi Yenile", prize: ["tuy", "ampul"], play: playSwap }
  ];
  const low = s => s.toLocaleLowerCase("tr");
  const norm = s => low(s).replace(/[.,!?;:"“”()]/g, "");
  const again = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };
  function flip(els, mutate) {
    const before = els.map(e => e.getBoundingClientRect());
    mutate();
    els.forEach((e, i) => {
      const a = e.getBoundingClientRect(), dx = before[i].left - a.left, dy = before[i].top - a.top;
      if ((dx || dy) && e.animate) e.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.3,1.2,.5,1)" });
    });
  }

  /* ---------- 1. durak: köprüyü kur ---------- */
  function playBridge() {
    const g = GAMES[0];
    const pic = shuffle(PAIRS.filter(p => p[2])), txt = shuffle(PAIRS.filter(p => !p[2]));
    const R = [pic.slice(0, 4), pic.slice(4, 6).concat(txt.slice(0, 2)), txt.slice(2, 6)];
    const G = gameFrame(g, R.length);
    G.scene.insertBefore(h("div.riverbg", { "aria-hidden": "true" }), G.play);
    let r = 0, miss = 0;
    (function round() {
      G.at(r);
      const set = shuffle(R[r]);
      let order = shuffle([0, 1, 2, 3]);
      while (order.filter((v, i) => v === i).length > 1) order = shuffle([0, 1, 2, 3]);
      const rowOf = []; order.forEach((pi, row) => { rowOf[pi] = row; });
      let selL = null, selR = null, done = 0, lock = false;
      const missBy = [0, 0, 0, 0], L = [], Rc = [], planks = [];
      const colL = h("div.col.left"), river = h("div.river", { "aria-hidden": "true" }), colR = h("div.col.right");
      set.forEach((p, i) => {
        const b = h("button.wcard.l", { type: "button", "data-k": dbg ? i : null, style: "animation-delay:" + i * 70 + "ms", onclick: () => pickL(i) }, p[2] ? img(p[2]) : null, h("span.w", p[0]));
        L.push(b); colL.append(b);
        const pl = h("div.plank"); planks.push(pl); river.append(pl);
      });
      set.forEach((p, pi) => {
        Rc[pi] = h("button.wcard.r", { type: "button", "data-k": dbg ? pi : null, style: "order:" + rowOf[pi] + ";animation-delay:" + (rowOf[pi] * 70 + 150) + "ms", onclick: () => pickR(pi) }, h("span.w", p[1]));
        colR.append(Rc[pi]);
      });
      const hint = () => tell("Soldan bir sözcüğe, sonra sağdan eş anlamlısına dokun.", "goster");
      function pickL(i) {
        if (lock || L[i].classList.contains("done")) return;
        selL = i; L.forEach((b, k) => b.classList.toggle("sel", k === i)); sfx.flip(); speak(set[i][0], 1); idle(hint);
        if (selR != null) check();
      }
      function pickR(pi) {
        if (lock || Rc[pi].classList.contains("done")) return;
        selR = pi; Rc.forEach((b, k) => b.classList.toggle("sel", k === pi)); sfx.flip(); speak(set[pi][1], 1); idle(hint);
        if (selL != null) check();
      }
      function check() {
        const i = selL, pi = selR; selL = selR = null;
        L[i].classList.remove("sel"); Rc[pi].classList.remove("sel");
        if (i === pi) {
          const other = rowOf.indexOf(i);
          flip(Rc, () => { if (other !== pi) { const rr = rowOf[pi]; rowOf[pi] = i; rowOf[other] = rr; Rc[pi].style.order = i; Rc[other].style.order = rr; } });
          L[i].classList.add("done"); Rc[pi].classList.add("done"); done++;
          later(() => { planks[i].classList.add("on"); sfx.ok(); }, 320);
          tell(cap(set[i][0]) + " ve " + set[i][1] + " eş anlamlıdır.", "yildiz", "cheer");
          if (done === 4) { lock = true; later(cross, 1700); }
        } else {
          miss++; missBy[i]++; sfx.no(); again(L[i], "shake"); again(Rc[pi], "shake");
          if (missBy[i] >= 2) { again(Rc[i], "hintp"); tell("İpucu: parlayan karta bak. " + cap(set[i][0]) + " sözcüğünün eş anlamlısı o.", "aferin"); }
          else tell(cap(set[i][0]) + " ile " + set[pi][1] + " aynı anlama gelmez. Bir daha dene.", "aferin");
        }
      }
      function cross() {
        planks[0].append(h("img.runner", { src: "img/i_goster.png", alt: "" }));
        tell("Köprüler kuruldu! Karşıya geçiyorum.", "yildiz", "cheer");
        later(() => { r++; if (r < R.length) round(); else finish(g, G.scene, starsFor(miss, 2, 5), miss ? "Köprüleri " + miss + " yanlış denemeyle kurdun." : "Bütün köprüleri ilk denemede kurdun."); }, 2400);
      }
      G.play.replaceChildren(h("div.asks", "Eş anlamlı sözcükleri eşleştir, köprüleri kur."), h("div.banks", colL, river, colR));
      if (r === 0) tell("Soldan bir sözcük seç, sağdan eş anlamlısını bul.", "goster", null, false, "Eş anlamlı sözcükler aynı anlama gelir. Soldan bir sözcük seç, sağdan eş anlamlısını bul. Aralarına köprü kuralım!");
      else tell("Yeni sözcükler geldi. Hadi köprüleri kur.", "goster");
      idle(hint);
    })();
  }

  /* ---------- 2. durak: metinde bul ---------- */
  function playHunt() {
    const g = GAMES[1], ORD = ["birinci", "ikinci", "üçüncü", "dördüncü"];
    const texts = shuffle(TEXTS).slice(0, 4).map(t => ({ t: t.t, h: shuffle(t.h).slice(0, 2) }));
    const total = texts.reduce((s, t) => s + t.h.length, 0);
    const G = gameFrame(g, total);
    let ti = 0, n = 0, miss = 0;
    (function openText() {
      const X = texts[ti], toks = X.t.split(" "), sentOf = [];
      let hi = 0, tries = 0, lock = false, sent = 0;
      const btns = toks.map((tk, i) => { sentOf[i] = sent; if (/[.!?]$/.test(tk)) sent++; return h("button.wd", { type: "button", onclick: () => tap(i) }, tk); });
      const ask = h("div.ask2");
      const page = h("div.page", h("button.pillb.dark.listen", { type: "button", onclick: () => speak(X.t, 0.88) }, ic("on"), "Metni dinle"),
        h("p.txt", btns.map((b, i) => (i ? [" ", b] : b))));
      function hunt() {
        G.at(n); tries = 0;
        const H = X.h[hi];
        ask.replaceChildren("Metinde ", h("b.chip", H.ask), " ile eş anlamlı sözcüğü bul.");
        if (dbg) page.dataset.ans = H.ans.join("|");
        tell((n === 0 ? "Önce metni oku. Sonra \"" : "Şimdi \"") + H.ask + "\" ile eş anlamlı sözcüğü metinde bul ve ona dokun.", "goster");
        idle(() => tell("Okumak zor gelirse \"Metni dinle\"ye bas. Aradığımız sözcük, \"" + H.ask + "\" ile aynı anlama geliyor.", "goster"));
      }
      function tap(i) {
        const H = X.h[hi], b = btns[i], w = norm(toks[i]);
        if (lock || b.classList.contains("ok")) return;
        if (H.ans.indexOf(w) >= 0) {
          lock = true; sfx.ok(); b.classList.remove("no", "hintp"); b.classList.add("ok"); b.dataset.eq = H.ask; n++;
          tell("Evet! " + cap(H.root) + " ve " + H.ask + " eş anlamlıdır.", "yildiz", "cheer");
          later(() => {
            lock = false; hi++;
            if (hi < X.h.length) hunt();
            else { ti++; if (ti < texts.length) openText(); else finish(g, G.scene, starsFor(miss, 2, 5), miss ? "Sözcükleri " + miss + " yanlış denemeyle buldun." : "Bütün sözcükleri ilk denemede buldun."); }
          }, 2300);
        } else {
          miss++; tries++; sfx.no(); again(b, "no");
          const ai = toks.findIndex(tk => H.ans.indexOf(norm(tk)) >= 0);
          if (w === norm(H.ask)) tell("Bu, aradığımız sözcüğün kendisi. Onunla aynı anlama gelen başka bir sözcük bul.", "aferin");
          else if (H.zit && H.zit[w]) tell(cap(H.zit[w]) + ", " + H.ask + " sözcüğünün zıt anlamlısıdır. Biz eş anlamlısını arıyoruz.", "aferin");
          else if (tries >= 3) { again(btns[ai], "hintp"); tell("Parlayan sözcüğe bak.", "aferin"); }
          else if (tries === 2) tell("İpucu: " + ORD[sentOf[ai]] + " cümleye bak.", "aferin");
          else tell("Bu olmadı. \"" + H.ask + "\" ile aynı anlama gelen sözcüğü ara.", "aferin");
        }
      }
      G.play.replaceChildren(ask, page);
      hunt();
    })();
  }

  /* ---------- 3. durak: cümleyi yenile ---------- */
  function playSwap() {
    const g = GAMES[2], set = shuffle(SENT).slice(0, 8);
    const G = gameFrame(g, set.length);
    let r = 0, miss = 0;
    (function round() {
      G.at(r);
      const q = set[r], toks = q.s.split(" ");
      let ti = -1, old = "", punct = "";
      const tiles = toks.map((tk, i) => {
        const m = /^\{(.+)\}(.*)$/.exec(tk);
        if (m) { ti = i; old = m[1]; punct = m[2]; }
        return h("span.wt" + (m ? ".target" : ""), { style: "animation-delay:" + i * 60 + "ms" }, m ? m[1] + m[2] : tk);
      });
      const tgt = tiles[ti], form = w => (ti === 0 ? cap(w) : w);
      const sentence = w => toks.map((tk, i) => (i === ti ? form(w) + punct : tk)).join(" ");
      let lock = false;
      const opts = shuffle([q.a].concat(q.d)).map(w => {
        const b = h("button.otile", { type: "button", "data-ok": dbg && w === q.a ? "1" : null, onclick: () => {
          if (lock || b.disabled) return;
          lock = true; tgt.textContent = form(w) + punct; tgt.classList.remove("target");
          if (w === q.a) {
            sfx.ok(); tgt.classList.add("ok"); b.classList.add("used");
            tell("Evet, anlam aynı kaldı!", "yildiz", "cheer", false, sentence(w) + " Evet, anlam aynı kaldı!");
            later(() => { r++; if (r < set.length) round(); else finish(g, G.scene, starsFor(miss, 1, 3), miss ? "Cümleleri " + miss + " yanlış denemeyle yeniledin." : "Bütün cümleleri ilk denemede yeniledin."); }, 4300);
          } else {
            miss++; sfx.no(); tgt.classList.add("bad"); b.disabled = true;
            tell("Olmadı, anlam değişti. Başka bir sözcük dene.", "aferin", null, false, sentence(w) + " Olmadı, anlam değişti.");
            later(() => { tgt.textContent = old + punct; tgt.classList.remove("bad"); tgt.classList.add("target"); lock = false; }, 3200);
          }
        } }, w);
        return b;
      });
      G.play.replaceChildren(h("div.asks", "Sarı sözcüğün yerine eş anlamlısını koy."), h("div.sentence", tiles), h("div.opts3", opts));
      tell("Sarı sözcüğün yerine eş anlamlısını seç.", "goster", null, false, (r === 0 ? "Cümleyi oku. Sarı sözcüğün yerine, anlamı değiştirmeyen sözcüğü seç. " : "") + sentence(old));
      idle(() => tell("\"" + low(old) + "\" ile aynı anlama gelen sözcüğe dokun.", "goster"));
    })();
  }

  Yol.start({
    key: "ko-sozcukler-yolu",
    title: "Sözcükler Yolu", acc: "Sözcükler Yolu'nu",
    sub: "T.O.3.2 · Eş anlamlı sözcükler",
    mapCls: "m2",
    hello: "Merhaba, ben İbibik! Sözcükler Yolu'nda eş anlamlı sözcükleri arayacağız. Bir numaralı durağa dokun.",
    land: [[9, 62], [25, 47], [43, 66], [60, 47], [75, 64], [85, 33]],
    port: [[18, 86], [32, 70], [68, 62], [34, 50], [66, 40], [50, 27]],
    stickers: [["kitap", "Kitaplar"], ["kalem", "Kalem"], ["buyutec", "Büyüteç"], ["baykus", "Baykuş"], ["tuy", "Tüy kalem"], ["ampul", "Ampul"], ["kure", "Küre"], ["madalya", "Madalya"]],
    chest: ["kure", "madalya"],
    games: GAMES
  });
})();
