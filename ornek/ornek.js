/* Sayılar Yolu: MAT.1.1.1 için tek öğrenme çıktılık bitmiş örnek.
   Harita, konuşan ibibik, çıkartma ödülleri ve üç farklı oyun. */
(function () {
  "use strict";
  const app = document.getElementById("app");
  const WORDS = ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz", "on", "on bir", "on iki", "on üç", "on dört", "on beş", "on altı", "on yedi", "on sekiz", "on dokuz", "yirmi"];
  const THINGS = [
    { id: "elma", ad: "elma", cog: "Elmalara" }, { id: "cilek", ad: "çilek", cog: "Çileklere" }, { id: "yildiz", ad: "yıldız", cog: "Yıldızlara" },
    { id: "cicek", ad: "çiçek", cog: "Çiçeklere" }, { id: "balik", ad: "balık", cog: "Balıklara" }, { id: "kelebek", ad: "kelebek", cog: "Kelebeklere" }, { id: "top", ad: "top", cog: "Toplara" }
  ];
  const STICK = [["roket", "Roket"], ["ucurtma", "Uçurtma"], ["balon", "Sıcak hava balonu"], ["gokkusagi", "Gökkuşağı"], ["yelkenli", "Yelkenli"], ["hediye", "Hediye kutusu"], ["tac", "Taç"], ["kupa", "Kupa"]];
  const GAMES = [
    { id: "g1", name: "Sepete Topla", icon: "sepet", prize: ["roket", "ucurtma"], play: () => playCollect() },
    { id: "g2", name: "Balonu Yakala", icon: "top", prize: ["balon", "gokkusagi"], play: () => playBalloon() },
    { id: "g3", name: "Eşini Bul", icon: "yildiz", prize: ["yelkenli", "hediye"], play: () => playMemory() }
  ];
  const PRAISE = ["Harika!", "Çok güzel saydın!", "Aferin sana!", "İşte bu!", "Süpersin!"];

  /* ---------- yardımcılar ---------- */
  function h(sel, attrs, ...kids) {
    const [tag, ...cls] = sel.split(".");
    const e = document.createElement(tag || "div");
    if (cls.length) e.className = cls.join(" ");
    if (attrs != null && (typeof attrs !== "object" || attrs.nodeType || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    for (const k in attrs || {}) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k.slice(0, 2) === "on") e.addEventListener(k.slice(2), v);
      else if (k === "style") e.style.cssText = v;
      else e.setAttribute(k, v);
    }
    for (const c of kids.flat(9)) { if (c == null || c === false) continue; e.append(c.nodeType ? c : String(c)); }
    return e;
  }
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const img = (id, alt) => h("img", { src: "img/" + id + ".png", alt: alt || "", draggable: "false" });
  const ICONS = {
    back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
    star: '<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="currentColor"/>',
    book: '<path d="M4 5.5C4 4.1 5.1 3 6.5 3H20v15H6.5a2.5 2.5 0 0 0 0 5H20" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 8h7M9 12h5" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
    on: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    off: '<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M16 9.5l5 5M21 9.5l-5 5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="3" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.4"/>',
    x: '<path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>'
  };
  function ic(name) { const s = h("span", { "aria-hidden": "true", style: "display:inline-flex" }); s.innerHTML = '<svg class="ic" viewBox="0 0 24 24">' + ICONS[name] + "</svg>"; return s; }

  /* ---------- kayıt ---------- */
  let S = { stars: {}, st: [], chest: false };
  try { const r = localStorage.getItem("ko-sayilar-yolu"); if (r) S = Object.assign(S, JSON.parse(r)); } catch (e) {}
  const save = () => { try { localStorage.setItem("ko-sayilar-yolu", JSON.stringify(S)); } catch (e) {} };
  const totalStars = () => GAMES.reduce((s, g) => s + (S.stars[g.id] || 0), 0);
  const award = id => { if (S.st.indexOf(id) >= 0) return false; S.st.push(id); return true; };

  /* ---------- ses ---------- */
  let soundOn = true, ac = null, voice = null;
  function tone(f, at, d, type, vol) {
    if (!soundOn) return;
    try {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime + at;
      o.type = type || "sine"; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.16, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d + 0.02);
    } catch (e) {}
  }
  const sfx = {
    pop: () => { tone(520, 0, 0.09, "triangle"); tone(780, 0.05, 0.1, "triangle"); },
    flip: () => tone(420, 0, 0.07, "triangle", 0.1),
    ok: () => { tone(523, 0, 0.14); tone(659, 0.1, 0.14); tone(784, 0.2, 0.22); },
    no: () => { tone(300, 0, 0.16, "sine", 0.12); tone(250, 0.13, 0.22, "sine", 0.12); },
    win: () => [523, 659, 784, 1047, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.2))
  };
  function findVoice() {
    try {
      const vs = speechSynthesis.getVoices().filter(v => /^tr/i.test(v.lang));
      voice = vs.find(v => /natural|online|google|emel|yelda/i.test(v.name)) || vs[0] || null;
    } catch (e) {}
  }
  if (window.speechSynthesis) { findVoice(); try { speechSynthesis.addEventListener("voiceschanged", findVoice); } catch (e) {} }
  function hush() { try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {} }
  function speak(text, rate) {
    if (!soundOn || !window.speechSynthesis) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "tr-TR"; u.rate = rate || 0.95; u.pitch = 1.25; if (voice) u.voice = voice;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  /* ---------- zamanlayıcılar ---------- */
  let T = [], idleT = 0, screen = "";
  const later = (fn, ms) => { const id = setTimeout(fn, ms); T.push(id); return id; };
  function clearAll() { T.forEach(clearTimeout); T = []; clearTimeout(idleT); hush(); }
  function idle(fn, ms) { clearTimeout(idleT); idleT = setTimeout(fn, ms || 12000); }

  /* ---------- ibibik ---------- */
  let guideEl = null, last = { text: "", pose: "goster" };
  function tell(text, pose, anim, quiet) {
    last = { text, pose: pose || "goster" };
    if (!guideEl) return;
    const who = guideEl.querySelector(".who");
    who.firstChild.src = "img/i_" + last.pose + ".png";
    who.classList.remove("talk", "cheer"); void who.offsetWidth; who.classList.add(anim || "talk");
    const b = h("div.bubble", { role: "status", "aria-live": "polite" }, text);
    guideEl.querySelector(".bubble").replaceWith(b);
    if (!quiet) speak(text);
  }
  function makeGuide(scene, onmap) {
    guideEl = h("div.guide" + (onmap ? ".onmap" : ""),
      h("button.who", { type: "button", "aria-label": "İbibik, tekrar söyle", onclick: () => tell(last.text, last.pose) }, h("img", { alt: "", src: "img/i_goster.png" })),
      h("div.bubble", ""));
    scene.append(guideEl);
  }

  /* ---------- çerçeve ---------- */
  function sndBtn() {
    const b = h("button.pillb", { type: "button", "aria-pressed": String(soundOn), "aria-label": "Ses", onclick: () => {
      soundOn = !soundOn; if (!soundOn) hush();
      b.setAttribute("aria-pressed", String(soundOn)); b.replaceChildren(ic(soundOn ? "on" : "off"));
    } }, ic(soundOn ? "on" : "off"));
    return b;
  }
  function frame(cls, o, onmap) {
    clearAll(); screen = cls;
    const back = o.back.href
      ? h("a.pillb", { href: o.back.href }, ic("back"), h("span.lbl", o.back.label))
      : h("button.pillb", { type: "button", onclick: o.back.onclick }, ic("back"), h("span.lbl", o.back.label));
    const scene = h("main.scene." + cls);
    app.replaceChildren(h("header.bar", back,
      h("div.ttl", h("b", o.title), h("span", o.sub || "")), o.rounds || null,
      h("div.pillb.stars", { "aria-label": "Toplam yıldız: " + totalStars() }, ic("star"), String(totalStars())),
      h("button.pillb", { type: "button", "aria-label": "Çıkartma albümü", onclick: showAlbum }, ic("book"), h("span.lbl", "Albüm")),
      sndBtn()), scene);
    makeGuide(scene, onmap);
    return scene;
  }
  function gameFrame(g, total) {
    const dots = h("div.rounds", { "aria-hidden": "true" });
    for (let i = 0; i < total; i++) dots.append(h("i"));
    const scene = frame(g.id, { back: { onclick: showMap, label: "Harita" }, title: g.name, sub: "Sayılar Yolu", rounds: dots });
    const play = h("div.play");
    scene.append(play);
    return { scene, play, at: i => { [].forEach.call(dots.children, (d, k) => { d.className = k < i ? "ok" : k === i ? "now" : ""; }); } };
  }
  function veil(scene, kids) { const v = h("div.veil", h("div.sheet", kids)); scene.append(v); return v; }
  function confetti() {
    try {
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const c = h("canvas.confetti"); document.body.append(c);
      const x = c.getContext("2d"), W = c.width = innerWidth, H = c.height = innerHeight;
      const cols = ["#F2675A", "#FFC83D", "#14B89A", "#3D8BE8", "#9B6BE8", "#fff"];
      const ps = Array.from({ length: 110 }, () => ({ x: W / 2 + (Math.random() - 0.5) * W * 0.5, y: H * 0.35, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4, s: 6 + Math.random() * 8, c: pick(cols), r: Math.random() * 6 }));
      let n = 0;
      (function step() {
        x.clearRect(0, 0, W, H);
        ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += 0.45; p.r += 0.2; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); x.restore(); });
        if (++n < 110) requestAnimationFrame(step); else c.remove();
      })();
    } catch (e) {}
  }
  function starRow(n) {
    const d = h("div.big3", { role: "img", "aria-label": n + " yıldız" });
    for (let i = 0; i < 3; i++) { const s = ic("star"); if (i < n) s.className = "on"; d.append(s); }
    return d;
  }
  const stName = id => (STICK.find(s => s[0] === id) || [0, ""])[1];
  function prizeBox(id) { return h("div.prize", img("s_" + id), h("div", h("b", "Yeni çıkartma: " + stName(id)), h("span", "Albümüne eklendi."))); }

  /* ---------- harita ---------- */
  let walkerAt = null;
  function showMap(arrive) {
    const scene = frame("map", { back: { href: "../", label: "Ana sayfa" }, title: "Sayılar Yolu", sub: "MAT.1.1.1 · 20'ye kadar sayılar" }, true);
    const land = innerWidth >= innerHeight;
    const P = land ? [[8, 86], [24, 60], [44, 71], [61, 50], [78, 64], [86, 37]] : [[16, 88], [30, 72], [68, 62], [32, 49], [68, 38], [52, 24]];
    let d = "M" + P[0][0] + " " + P[0][1];
    for (let i = 1; i < P.length - 1; i++) d += " Q" + P[i][0] + " " + P[i][1] + " " + (P[i][0] + P[i + 1][0]) / 2 + " " + (P[i][1] + P[i + 1][1]) / 2;
    d += " L" + P[5][0] + " " + P[5][1];
    const path = h("div.path"); path.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%">' +
      '<path d="' + d + '" fill="none" stroke="rgba(120,90,40,.25)" stroke-width="34" stroke-linecap="round" vector-effect="non-scaling-stroke" transform="translate(0 .8)"/>' +
      '<path d="' + d + '" fill="none" stroke="#F7E7BC" stroke-width="28" stroke-linecap="round" vector-effect="non-scaling-stroke"/>' +
      '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 16" vector-effect="non-scaling-stroke"/></svg>';
    scene.append(path);
    const doneAll = GAMES.every(g => S.stars[g.id]);
    let cur = GAMES.findIndex(g => !S.stars[g.id]); if (cur < 0) cur = 3;
    GAMES.forEach((g, i) => {
      const st = S.stars[g.id] || 0, open = i === 0 || S.stars[GAMES[i - 1].id];
      const stars = h("span.st", { "aria-hidden": "true" }); for (let k = 0; k < 3; k++) { const s = ic("star"); if (k < st) s.className = "on"; stars.append(s); }
      scene.append(h("button.stop" + (st ? ".done" : "") + (i === cur ? ".now" : "") + (open ? "" : ".locked"),
        { type: "button", style: "left:" + P[i + 1][0] + "%;top:" + P[i + 1][1] + "%", "aria-label": (i + 1) + ". durak: " + g.name + (open ? ", " + st + " yıldız" : ", kilitli"),
          onclick: () => { if (open) { sfx.pop(); g.play(); } else { sfx.no(); tell("Önce " + GAMES[i - 1].name + " durağını bitir.", "aferin"); } } },
        h("span.dot", open ? String(i + 1) : ic("lock")), h("span.nm", g.name), stars));
    });
    scene.append(h("button.stop" + (S.chest ? ".done" : "") + (cur === 3 && !S.chest ? ".now" : "") + (doneAll ? "" : ".locked"),
      { type: "button", style: "left:" + P[4][0] + "%;top:" + P[4][1] + "%", "aria-label": "Hazine" + (doneAll ? "" : ", kilitli"),
        onclick: () => { if (doneAll) openChest(scene); else { sfx.no(); tell("Hazine, üç durak bitince açılır.", "aferin"); } } },
      h("span.dot", img("s_hediye")), h("span.nm", "Hazine")));
    scene.append(h("div.stop.soon.locked", { style: "left:" + P[5][0] + "%;top:" + P[5][1] + "%" }, h("span.dot", ic("lock")), h("span.nm", "Sıradaki yol: yakında")));
    const target = P[Math.min(cur, 3) + 1], from = walkerAt || P[0];
    const w = h("div.walker", { style: "left:" + from[0] + "%;top:" + from[1] + "%" }, img("i_goster"));
    scene.append(w);
    later(() => { w.style.left = target[0] + "%"; w.style.top = target[1] + "%"; }, 60);
    walkerAt = target;
    const msg = S.chest ? "Sayılar Yolu'nu bitirdin! İstediğin durağı yeniden oynayabilirsin."
      : doneAll ? "Üç durak da tamam! Hazineye dokun."
      : cur === 0 ? "Merhaba, ben İbibik! Birlikte Sayılar Yolu'nda yürüyelim. Bir numaralı durağa dokun."
      : "Sıradaki durak: " + GAMES[cur].name + ". Hadi dokun!";
    later(() => tell(msg, "goster", "talk", arrive === "quiet"), 350);
  }
  let rz = 0;
  addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(() => { if (screen === "map" && !document.querySelector(".veil")) showMap("quiet"); }, 250); });

  function openChest(scene) {
    const fresh = [award("tac"), award("kupa")];
    S.chest = true; save(); sfx.win(); confetti();
    speak("Tebrikler! Sayılar Yolu'nu bitirdin.");
    veil(scene, [h("div.hero", img("i_yildiz")), h("h2", "Sayılar Yolu tamam!"),
      h("p", "Üç durağı da bitirdin. Toplam " + totalStars() + " yıldızın var."),
      fresh[0] ? prizeBox("tac") : null, fresh[1] ? prizeBox("kupa") : null,
      h("div.rowb", h("button.btn", { type: "button", onclick: () => showMap() }, "Haritaya dön"),
        h("button.btn.alt", { type: "button", onclick: () => { showMap("quiet"); showAlbum(); } }, "Albümü aç"))]);
  }
  function showAlbum() {
    const scene = document.querySelector(".scene"); if (!scene || scene.querySelector(".veil")) return;
    const v = veil(scene, [h("button.x", { type: "button", "aria-label": "Kapat", onclick: () => v.remove() }, ic("x")),
      h("h2", "Çıkartma albümüm"), h("p", S.st.length + " / " + STICK.length + " çıkartma toplandı."),
      h("div.album", STICK.map(s => { const on = S.st.indexOf(s[0]) >= 0; return h("div.slot." + (on ? "on" : "off"), { role: "img", "aria-label": on ? s[1] : "Henüz kazanılmadı" }, img("s_" + s[0])); })),
      h("p", "Durakları bitir, üç yıldız topla; yeni çıkartmalar açılsın.")]);
  }

  /* ---------- oyun sonu ---------- */
  function finish(g, scene, stars, line) {
    clearAll();
    const first = !S.stars[g.id];
    S.stars[g.id] = Math.max(S.stars[g.id] || 0, stars);
    const p1 = first && award(g.prize[0]), p2 = stars === 3 && award(g.prize[1]);
    save(); sfx.win(); confetti();
    speak(stars === 3 ? "Harika! Üç yıldız kazandın." : "Tebrikler! Durağı bitirdin.");
    veil(scene, [h("div.hero", img("i_yildiz")), starRow(stars),
      h("h2", stars === 3 ? "Harika!" : stars === 2 ? "Çok iyi!" : "Durağı bitirdin!"), h("p", line),
      p1 ? prizeBox(g.prize[0]) : null, p2 ? prizeBox(g.prize[1]) : null,
      !p1 && !p2 && stars < 3 ? h("p", "Üç yıldız toplarsan yeni bir çıkartma açılır.") : null,
      h("div.rowb", h("button.btn", { type: "button", onclick: () => showMap() }, "Haritaya dön"),
        h("button.btn.alt", { type: "button", onclick: g.play }, "Tekrar oyna"))]);
  }
  const starsFor = (m, a, b) => m <= a ? 3 : m <= b ? 2 : 1;

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
          tell(pick(PRAISE) + " Sepette tam " + WORDS[n] + " " + th.ad + " var.", "yildiz", "cheer");
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
            tell(pick(PRAISE) + " " + WORDS[n] + " tane " + th.ad + ".", "yildiz", "cheer");
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
        const front = c.k === "num" ? h("b", String(c.n)) : h("span.grp", { style: "grid-template-columns:repeat(" + (c.n <= 3 ? c.n : c.n <= 4 ? 2 : c.n <= 6 ? 3 : c.n <= 8 ? 4 : 5) + ",1fr);" + (c.n <= 2 ? "width:" + c.n * 42 + "%" : "") }, Array.from({ length: c.n }, () => img(th.id)));
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

  showMap();
})();
