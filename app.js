(function () {
  "use strict";
  const app = document.getElementById("app");

  /* ---------- yardımcılar ---------- */
  function h(sel, attrs, ...kids) {
    const [tag, ...cls] = sel.split(".");
    const n = document.createElement(tag || "div");
    if (cls.length) n.className = cls.join(" ");
    if (attrs && (typeof attrs !== "object" || attrs.nodeType || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    if (attrs) for (const k in attrs) {
      if (k.startsWith("on")) n.addEventListener(k.slice(2), attrs[k]);
      else if (k === "style") n.style.cssText = attrs[k];
      else if (attrs[k] !== false && attrs[k] != null) n.setAttribute(k, attrs[k]);
    }
    kids.flat().forEach(c => { if (c != null && c !== false) n.append(c.nodeType ? c : document.createTextNode(c)); });
    return n;
  }
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a, n) => shuffle(a).slice(0, n);
  const norm = x => Array.isArray(x) ? { t: x[0], e: x[1] } : { t: x };

  /* ---------- ses ---------- */
  let soundOn = true, actx = null;
  function beep(ok) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime;
      o.connect(g); g.connect(actx.destination);
      o.type = ok ? "triangle" : "sine";
      if (ok) { o.frequency.setValueAtTime(660, t); o.frequency.setValueAtTime(880, t + 0.12); }
      else o.frequency.setValueAtTime(200, t);
      g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.start(t); o.stop(t + 0.36);
    } catch (e) { /* ses yoksa sessiz devam */ }
  }
  function say(text) {
    if (!soundOn) return;
    try {
      const s = window.speechSynthesis; if (!s) return;
      text = String(text).replace(/−/g, " eksi ").replace(/\+/g, " artı ").replace(/=/g, " eşittir ").replace(/·/g, ", ").replace(/(^|\s)\?(\s|$)/g, " kaç ").replace(/\n/g, " ");
      if (!/[\p{L}\p{N}]/u.test(text)) return;
      s.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "tr-TR"; u.rate = 0.9;
      const v = s.getVoices().find(v => /^tr/i.test(v.lang)); if (v) u.voice = v;
      s.speak(u);
    } catch (e) { /* seslendirme yoksa sessiz devam */ }
  }
  const T = [];
  function later(fn, ms) { const id = setTimeout(fn, ms); T.push(id); return id; }
  let onKey = null;
  function clearAll() { while (T.length) { const id = T.pop(); clearTimeout(id); clearInterval(id); } if (onKey) { document.removeEventListener("keydown", onKey); onKey = null; } }
  function qeEl(e) {
    if (!e) return null;
    const many = e.length > 8 || /\s/.test(e);
    if (/\d/.test(e)) return h("div.qe.expr", e);
    return many ? h("div.qe.many", e) : h("div.qe", { "aria-hidden": "true" }, e);
  }
  function hush() { clearAll(); try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch (e) {} }

  /* ---------- kayıt ---------- */
  let best = {};
  try { best = JSON.parse(localStorage.getItem("ko-best") || "{}") || {}; } catch (e) { best = {}; }
  function saveBest(key, stars) {
    if ((best[key] || 0) >= stars) return;
    best[key] = stars;
    try { localStorage.setItem("ko-best", JSON.stringify(best)); } catch (e) {}
  }
  const starStr = n => "★".repeat(n) + "☆".repeat(3 - n);

  /* ---------- oyun listesi ---------- */
  const GAMES = [
    { id: "test", name: "Bil Bakalım", desc: "Soruyu dinle, doğru cevabı seç.", icon: "❓", needs: "quiz", play: playTest },
    { id: "kutu", name: "Kutuyu Aç", desc: "Bir kutu seç, içinden çıkan soruyu cevapla.", icon: "🎁", needs: "quiz", play: playBox },
    { id: "balon", name: "Balon Patlat", desc: "Doğru cevabı taşıyan balonu patlat.", icon: "🎈", needs: "quiz", play: playBalloon },
    { id: "esle", name: "Eşleştir", desc: "Birbirine uyan iki kartı bul.", icon: "🔗", needs: "pairs", play: playMatch },
    { id: "hafiza", name: "Hafıza Kartları", desc: "Kartları çevir, eşini hatırla.", icon: "🃏", needs: "pairs", play: playMemory },
    { id: "grup", name: "Grupla", desc: "Her kartı doğru sepete koy.", icon: "🧺", needs: "groups", play: playGroup },
    { id: "cark", name: "Çarkıfelek", desc: "Çarkı çevir, gelen soruyu cevapla.", icon: "🎡", needs: "quiz", play: playWheel },
    { id: "dy", name: "Doğru mu Yanlış mı", desc: "Verilen cevap doğru mu? Karar ver.", icon: "✅", needs: "quiz", play: playTrueFalse },
    { id: "yarisma", name: "Yarışma", desc: "Süre dolmadan cevapla, canlarını koru.", icon: "🏆", needs: "quiz", play: playShow },
    { id: "bul", name: "Eşini Bul", desc: "Üstteki kartın eşine dokun.", icon: "🔎", needs: "pairs", play: playFind },
    { id: "kart", name: "Bilgi Kartları", desc: "Kartı çevir, cevabı gör, kendini dene.", icon: "📇", needs: "pairs", play: playCards },
    { id: "kostebek", name: "Köstebek Vur", desc: "Yalnızca doğru köstebeklere dokun.", icon: "🕳️", needs: "groups", play: playMole },
    { id: "sirala", name: "Sırala", desc: "Kartlara doğru sırayla dokun.", icon: "🔢", needs: "orders", play: playOrder },
    { id: "labirent", name: "Labirent", desc: "Doğru cevaba yürü, hayaletten kaç.", icon: "🌀", needs: "quiz", play: playMaze },
    { id: "meyve", name: "Uçan Meyve", desc: "Doğru cevabı taşıyan meyveyi yakala.", icon: "🍎", needs: "quiz", play: playFruit }
  ];
  const FIT = { uygun: "Oyuna uygun", kismen: "Kısmen uygun", degil: "Oyuna uygun değil" };

  /* ---------- çizimler ---------- */
  const INK = "#1C1B4B";
  const MASCOT = '<img alt="" src="' + ART.m_wave + '">';
  document.documentElement.style.setProperty("--art-logo", 'url("' + ART.m_wave + '")');
  ["hero", "sinif", "gok", "bahce", "masa"].forEach(k => document.documentElement.style.setProperty("--art-" + k, 'url("' + ART[k] + '")'));
  const tile = (x, y, w, hh, f) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + hh + '" rx="8" fill="' + f + '" stroke="' + INK + '" stroke-width="4"/>';
  const THUMB = {
    test: tile(22, 10, 116, 30, "#fff") + '<text x="80" y="33" text-anchor="middle" font-size="22" font-weight="800" fill="' + INK + '">?</text>' + tile(14, 54, 38, 34, "#fff") + tile(61, 54, 38, 34, "#9BE14B") + '<path d="M71 71l7 7 12-14" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>' + tile(108, 54, 38, 34, "#fff"),
    kutu: ["#FF9A2E", "#FFC933", "#9BE14B", "#5CC8FF", "#F45DA5", "#FF9A2E"].map((c, i) => tile(18 + (i % 3) * 44, 10 + Math.floor(i / 3) * 44, 36, 36, c) + '<rect x="' + (24 + (i % 3) * 44) + '" y="' + (16 + Math.floor(i / 3) * 44) + '" width="24" height="24" rx="4" fill="#fff"/><text x="' + (36 + (i % 3) * 44) + '" y="' + (34 + Math.floor(i / 3) * 44) + '" text-anchor="middle" font-size="16" font-weight="800" fill="' + INK + '">' + (i + 1) + '</text>').join(""),
    balon: [["#FF5E5B", 38, 40], ["#3B4BE8", 82, 30], ["#12B5A6", 124, 46]].map(([c, x, y]) => '<path d="M' + x + ' ' + (y + 24) + 'v30" stroke="' + INK + '" stroke-width="3"/><ellipse cx="' + x + '" cy="' + y + '" rx="20" ry="24" fill="' + c + '" stroke="' + INK + '" stroke-width="4"/><ellipse cx="' + (x - 7) + '" cy="' + (y - 9) + '" rx="4" ry="7" fill="rgba(255,255,255,.55)"/>').join(""),
    esle: [0, 1, 2].map(i => tile(12, 10 + i * 30, 46, 22, "#fff") + tile(102, 10 + i * 30, 46, 22, "#FFE7A3")).join("") + '<path d="M58 21L102 81M58 51L102 21M58 81L102 51" stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 9"/>',
    hafiza: [0, 1, 2, 3].map(i => tile(12 + i * 36, 14, 28, 34, i === 1 ? "#fff" : "#F45DA5") + tile(12 + i * 36, 54, 28, 34, i === 2 ? "#fff" : "#F45DA5")).join("") + '<circle cx="62" cy="31" r="8" fill="#FFC933" stroke="' + INK + '" stroke-width="3"/><circle cx="98" cy="71" r="8" fill="#FFC933" stroke="' + INK + '" stroke-width="3"/>',
    grup: tile(60, 6, 40, 30, "#fff") + '<circle cx="80" cy="21" r="8" fill="#FF5E5B" stroke="' + INK + '" stroke-width="3"/><path d="M10 52h60l-8 40H18z" fill="#12B5A6" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><path d="M90 52h60l-8 40H98z" fill="#FF9A2E" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>'
  };
  THUMB.cark = '<circle cx="80" cy="52" r="42" fill="#fff" stroke="' + INK + '" stroke-width="4"/>' + ["#FF5E5B", "#FFC933", "#9BE14B", "#5CC8FF", "#F45DA5", "#FF9A2E"].map((c, i) => { const a0 = i * Math.PI / 3, a1 = (i + 1) * Math.PI / 3; return '<path d="M80 52L' + (80 + 40 * Math.cos(a0)).toFixed(1) + ' ' + (52 + 40 * Math.sin(a0)).toFixed(1) + 'A40 40 0 0 1 ' + (80 + 40 * Math.cos(a1)).toFixed(1) + ' ' + (52 + 40 * Math.sin(a1)).toFixed(1) + 'Z" fill="' + c + '" stroke="' + INK + '" stroke-width="2"/>'; }).join("") + '<circle cx="80" cy="52" r="8" fill="#fff" stroke="' + INK + '" stroke-width="3"/><path d="M72 2h16l-8 16z" fill="' + INK + '"/>';
  THUMB.dy = tile(30, 8, 100, 30, "#fff") + '<circle cx="48" cy="70" r="24" fill="#9BE14B" stroke="' + INK + '" stroke-width="4"/><path d="M37 70l8 8 14-16" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="112" cy="70" r="24" fill="#FF5E5B" stroke="' + INK + '" stroke-width="4"/><path d="M102 60l20 20M122 60l-20 20" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
  THUMB.yarisma = '<path d="M56 14h48v26a24 24 0 0 1-48 0z" fill="#FFC933" stroke="' + INK + '" stroke-width="4"/><path d="M56 22H40c0 16 8 22 18 24M104 22h16c0 16-8 22-18 24" fill="none" stroke="' + INK + '" stroke-width="4"/><path d="M80 64v14M62 88h36v-10H62z" fill="#FF9A2E" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>' + [20, 132, 146].map((x, i) => '<path d="M' + x + ' 14c-6-8-16 0-8 8l8 8 8-8c8-8-2-16-8-8z" fill="' + (i === 2 ? "#fff" : "#FF5E5B") + '" stroke="' + INK + '" stroke-width="3" transform="scale(.8) translate(' + (x * 0.25) + ' 4)"/>').join("");
  THUMB.bul = tile(50, 6, 60, 28, "#FFC933") + [0, 1, 2].map(i => tile(14 + i * 46, 50, 38, 38, i === 1 ? "#9BE14B" : "#fff")).join("") + '<circle cx="124" cy="24" r="12" fill="none" stroke="' + INK + '" stroke-width="4"/><path d="M133 33l10 10" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>';
  THUMB.kart = '<g transform="rotate(-8 80 50)">' + tile(40, 18, 80, 60, "#F45DA5") + '</g><g transform="rotate(5 80 50)">' + tile(40, 18, 80, 60, "#fff") + '<path d="M56 40h48M56 54h32" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/></g>';
  THUMB.kostebek = [0, 1, 2].map(i => '<ellipse cx="' + (32 + i * 48) + '" cy="78" rx="22" ry="10" fill="#6B4A2B" stroke="' + INK + '" stroke-width="4"/>').join("") + '<path d="M62 78V50a18 18 0 0 1 36 0v28z" fill="#B98556" stroke="' + INK + '" stroke-width="4"/><circle cx="73" cy="50" r="3.5" fill="' + INK + '"/><circle cx="87" cy="50" r="3.5" fill="' + INK + '"/><ellipse cx="80" cy="60" rx="6" ry="4" fill="#FF8FA3" stroke="' + INK + '" stroke-width="3"/><ellipse cx="80" cy="78" rx="22" ry="6" fill="#6B4A2B"/>';
  THUMB.sirala = [0, 1, 2, 3].map(i => tile(12 + i * 36, 62 - i * 14, 28, 26 + i * 14, ["#5CC8FF", "#9BE14B", "#FFC933", "#FF9A2E"][i]) + '<text x="' + (26 + i * 36) + '" y="82" text-anchor="middle" font-size="16" font-weight="800" fill="' + INK + '">' + (i + 1) + '</text>').join("");
  THUMB.labirent = tile(10, 8, 140, 84, "#F3E7B8") + '<path d="M40 8v30h30M70 62v30M100 38h20v24M10 62h30M100 8v10" fill="none" stroke="#3E9B4F" stroke-width="10" stroke-linecap="round"/><circle cx="26" cy="26" r="9" fill="#FFC933" stroke="' + INK + '" stroke-width="3"/><path d="M118 74h18v10h-18z" fill="#9BE14B" stroke="' + INK + '" stroke-width="3"/>';
  THUMB.meyve = [["#FF5E5B", 40, 34], ["#FF9A2E", 86, 62], ["#9BE14B", 128, 30]].map(([c, x, y]) => '<path d="M' + (x - 34) + ' ' + y + 'h12M' + (x - 38) + ' ' + (y + 8) + 'h10" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/><circle cx="' + x + '" cy="' + y + '" r="18" fill="' + c + '" stroke="' + INK + '" stroke-width="4"/><path d="M' + x + ' ' + (y - 18) + 'q6-10 12-6" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>').join("");
  function mascot(cls, pose) { const d = h("div.mascot" + (cls ? "." + cls : ""), { "aria-hidden": "true" }); d.innerHTML = '<img alt="" src="' + ART["m_" + (pose || (cls === "jump" ? "jump" : "wave"))] + '">'; return d; }
  function thumb(id) { const d = h("span.gthumb", { "aria-hidden": "true" }); d.innerHTML = '<svg viewBox="0 0 160 100">' + THUMB[id] + "</svg>"; return d; }
  function confetti() {
    try {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const c = h("canvas.confetti"); document.body.append(c);
      const x = c.getContext("2d"); c.width = window.innerWidth; c.height = window.innerHeight;
      const cols = ["#FF5E5B", "#FFC933", "#9BE14B", "#3B4BE8", "#F45DA5", "#12B5A6"];
      const ps = Array.from({ length: 130 }, () => ({ x: Math.random() * c.width, y: -20 - Math.random() * c.height * 0.5, vx: (Math.random() - 0.5) * 4, vy: 2 + Math.random() * 4, s: 7 + Math.random() * 8, r: Math.random() * 6, c: cols[Math.floor(Math.random() * cols.length)] }));
      let t = 0;
      (function f() {
        x.clearRect(0, 0, c.width, c.height);
        ps.forEach(p => { p.x += p.vx; p.y += p.vy; p.r += 0.1; x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); x.restore(); });
        if (++t < 180) requestAnimationFrame(f); else c.remove();
      })();
    } catch (e) {}
  }

  /* ---------- üst çubuk ---------- */
  function topbar() {
    const snd = h("button.snd", { type: "button", "aria-pressed": String(soundOn), onclick: () => {
      soundOn = !soundOn; if (!soundOn) hush();
      snd.setAttribute("aria-pressed", String(soundOn)); snd.textContent = soundOn ? "🔊 Ses açık" : "🔇 Ses kapalı";
    } }, soundOn ? "🔊 Ses açık" : "🔇 Ses kapalı");
    return h("header.top", h("div.brand", h("span.logo", { "aria-hidden": "true" }), h("span.wm", h("b", "kazanım"), h("i", "oyunları"))),
      h("nav.topnav", h("span.tag", "1. sınıf pilot"), snd));
  }

  /* ---------- seçim ekranı ---------- */
  const COURSES = {
    "Hayat Bilgisi": { label: "Öğrenme alanı", areas: [{ name: "Ben ve Okulum", outcomes: POOL.outcomes }, { name: "Sağlığım ve Güvenliğim" }, { name: "Ailem ve Toplum" }, { name: "Yaşadığım Yer ve Ülkem" }, { name: "Doğa ve Çevre" }, { name: "Bilim, Teknoloji ve Sanat" }] },
    "Matematik": { label: "Tema", areas: MAT.areas }
  };
  const ALL = Object.values(COURSES).flatMap(c => c.areas.flatMap(a => a.outcomes || []));
  const CAT = {
    grades: [["Okul öncesi", 0], ["1. sınıf", 1], ["2. sınıf", 0], ["3. sınıf", 0]],
    courses: [["Hayat Bilgisi", 1], ["Matematik", 1], ["Türkçe", 0]]
  };
  const sel = { grade: null, course: null, area: "", code: "" };
  function showGames(o) { sel.code = o.code; showHome("games"); }
  function showHome(focus) {
    hush();
    const o = ALL.find(x => x.code === sel.code);
    const course = COURSES[sel.course] || { label: "Öğrenme alanı", areas: [] };
    const area = course.areas.find(x => x.name === sel.area);
    function buttons(items, key, open) {
      return h("div.chips." + key, items.map(([t, on], i) => h("button.chip.k" + i + (sel[key] === t ? ".on" : "") + (on ? "" : ".soon"),
        { type: "button", disabled: on && open ? null : "", "aria-pressed": String(sel[key] === t), onclick: () => {
          sel[key] = t; sel.code = ""; sel.area = "";
          if (key === "grade") sel.course = null;
          showHome(key);
        } }, h("span", t), on ? null : h("small", "yakında"))));
    }
    const areaSel = h("select", { id: "sel-area", disabled: sel.course ? null : "", onchange: e => { sel.area = e.target.value; sel.code = ""; showHome("area"); } },
      h("option", { value: "" }, course.label + " seç"),
      course.areas.map(x => h("option", { value: x.name, disabled: x.outcomes ? null : "", selected: sel.area === x.name ? "" : null }, x.outcomes ? x.name : x.name + " (yakında)")));
    const outSel = h("select", { id: "sel-out", disabled: sel.area ? null : "", onchange: e => { sel.code = e.target.value; showHome("games"); } },
      h("option", { value: "" }, "Öğrenme çıktısı seç"),
      ((area && area.outcomes) || []).map(x => h("option", { value: x.code, selected: sel.code === x.code ? "" : null }, x.code + "  " + x.text)));
    const step = (n, label, open, control) => h("div.step" + (open ? "" : ".locked"), h("div.steplabel", h("span.num", String(n)), label), control);
    const gamesBox = o
      ? h("section.gamesbox", { id: "games" },
          h("div.ribbon", "Bir şablon seç"),
          h("div.outhead", h("span.code", o.code), h("span.pill." + o.fit, FIT[o.fit]),
            h("span.meta", o.quiz.length + " soru · " + o.pairs.length + " çift · " + o.groups.reduce((s, g) => s + g.i.length, 0) + " grup kartı")),
          h("h2.outtitle", o.text),
          h("p.note", o.fitNote),
          h("div.games", GAMES.map(g => {
            const ok = o[g.needs] && o[g.needs].length;
            const b = best[o.code + "|" + g.id] || 0;
            return h("button.game." + g.id, { type: "button", disabled: ok ? null : "", onclick: () => launch(g, o) },
              thumb(g.id),
              h("span.ginfo", h("span.gname", g.name), h("span.gdesc", g.desc)),
              h("span.gstars", { "aria-label": "En iyi sonuç: " + b + " yıldız" }, starStr(b)));
          })))
      : h("section.gamesbox.empty", mascot("", "think"), h("p", "Dört adımı tamamla, şablonlar burada açılsın."));
    if (o) gamesBox.querySelectorAll(".game:disabled .gdesc").forEach(n => { n.textContent = "Bu öğrenme çıktısına uygun değil."; });
    app.replaceChildren(
      topbar(),
      h("section.hero",
        h("div.heroin",
          h("div.herotext",
            h("div.kicker", "Türkiye Yüzyılı Maarif Modeli · 1. sınıf"),
            h("h1", "Öğrenme çıktısını seç, ", h("em", "oyun hazır")),
            h("p", "Sesli ve görselli 15 oyun şablonu. Hayat Bilgisi ve Matematik ile başlıyoruz."),
            h("div.herostats", h("span", h("b", "15"), " şablon"), h("span", h("b", "15"), " öğrenme çıktısı"), h("span", h("b", "2"), " ders")),
            h("a.trynew", { href: "ornek/" }, "Yeni deneme: Sayılar Yolu", h("span", { "aria-hidden": "true" }, " →"))))),
      h("div.band", { "aria-hidden": "true" }, h("div.bandin", [0, 1].map(() => h("span", "Bil Bakalım ★ Balon Patlat ★ Eşleştir ★ Hafıza Kartları ★ Çarkıfelek ★ Köstebek Vur ★ Labirent ★ Sırala ★ Uçan Meyve ★ Grupla ★ Yarışma ★ ")))),
      h("main.home",
        h("h2.sect", h("span", "1"), "Ne çalışacağız?"),
        h("section.picker",
          step(1, "Sınıf", true, buttons(CAT.grades, "grade", true)),
          step(2, "Ders", !!sel.grade, buttons(CAT.courses, "course", !!sel.grade)),
          step(3, course.label, !!sel.course, areaSel),
          step(4, "Öğrenme çıktısı", !!sel.area, outSel)),
        gamesBox,
        h("p.status", "Pilot sürüm: 1. sınıf Hayat Bilgisi (Ben ve Okulum) ve Matematik (1. ve 4. tema). Sorular yayından önce uzman ekip onayından geçecek."))
    );
    if (focus === "games" && o) { const g = document.getElementById("games"); g && g.scrollIntoView({ block: "start" }); }
    else if (!focus) window.scrollTo(0, 0);
    const f = { grade: ".chips.course .chip:not(:disabled)", course: "#sel-area", area: "#sel-out" }[focus];
    if (f) { const n = document.querySelector(f); n && n.focus({ preventScroll: true }); }
  }

  /* ---------- sahne ---------- */
  function fullscreen() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else { const r = document.documentElement.requestFullscreen(); r && r.catch && r.catch(() => {}); }
    } catch (e) {}
  }
  function playbar(g, o, dots) {
    return h("header.playbar",
      h("button.back", { type: "button", onclick: () => showGames(o) }, "← Oyunlar"),
      h("div.ptitle", g.name), dots || null,
      h("button.back.fs", { type: "button", "aria-label": "Tam ekran", onclick: fullscreen }, "⛶"));
  }
  function switcher(g, o) {
    return h("aside.switch", h("h3", "Şablonu değiştir"),
      h("div.swlist", GAMES.map(x => { const ok = o[x.needs] && o[x.needs].length;
        return h("button.sw" + (x.id === g.id ? ".on" : ""), { type: "button", disabled: ok ? null : "", "aria-current": x.id === g.id ? "true" : null, onclick: () => launch(x, o) }, thumb(x.id), h("span", x.name)); })));
  }
  function shell(g, o, dots, body) {
    app.replaceChildren(h("div.play", playbar(g, o, dots),
      h("div.playwrap", h("div.frame.scene." + g.id, body), switcher(g, o))));
  }
  function launch(g, o) {
    hush();
    shell(g, o, null, h("div.stage", h("div.startcard",
        mascot(),
        h("span.code", o.code),
        h("h2", g.name),
        h("p", g.desc),
        h("button.go.big", { type: "button", onclick: () => g.play(g, o) }, "▶ Başla"))));
    window.scrollTo(0, 0);
    say(g.name + ". " + g.desc);
  }
  function stage(g, o, total) {
    const dots = h("div.dots", { "aria-hidden": "true" });
    for (let i = 0; i < total; i++) dots.append(h("i"));
    const body = h("div.stage." + g.id);
    shell(g, o, dots, body);
    window.scrollTo(0, 0);
    return { body, mark: (i, ok) => { const d = dots.children[i]; if (d) d.className = ok ? "ok" : "bad"; } };
  }
  function finish(g, o, body, score, total, stars, line) {
    stars = stars || (score / total >= 0.85 ? 3 : score / total >= 0.6 ? 2 : 1);
    saveBest(o.code + "|" + g.id, stars);
    clearAll(); beep(true); confetti();
    say(stars === 3 ? "Harika! Üç yıldız kazandın." : "Tebrikler! Oyunu bitirdin.");
    body.replaceChildren(h("div.end",
      mascot("jump"),
      h("div.bigstars", { "aria-label": stars + " yıldız" }, starStr(stars)),
      h("h2", stars === 3 ? "Harika!" : stars === 2 ? "Çok iyi!" : "Oyunu bitirdin!"),
      h("p", line || ("İlk denemede doğru: " + score + " / " + total)),
      h("div.endbtns",
        h("button.go", { type: "button", onclick: () => g.play(g, o) }, "Tekrar oyna"),
        h("button.go.alt", { type: "button", onclick: () => showGames(o) }, "Başka oyun seç"))));
  }

  /* ---------- soru bileşeni ---------- */
  function askQuestion(root, q, cb, once) {
    const opts = shuffle(q.o.map((x, i) => Object.assign(norm(x), { ok: i === 0 })));
    let tried = false, done = false;
    const grid = h("div.opts");
    opts.forEach(op => {
      const b = h("button.opt", { type: "button", onclick: () => {
        if (done) return;
        if (op.ok) { done = true; b.classList.add("ok"); beep(true); setTimeout(() => cb(!tried), 900); }
        else if (once) { done = true; b.classList.add("bad"); beep(false); [...grid.querySelectorAll(".opt")].forEach((x, k) => { if (opts[k].ok) x.classList.add("ok"); }); setTimeout(() => cb(false), 1300); }
        else { tried = true; b.classList.add("bad"); b.disabled = true; beep(false); }
      } }, op.e ? h("span.oe", { "aria-hidden": "true" }, op.e) : null, h("span.ot" + (!op.e && op.t.length <= 3 ? ".big" : ""), op.t));
      grid.append(h("div.optw", b,
        h("button.ospk", { type: "button", "aria-label": op.t + " seçeneğini dinle", onclick: () => say(op.t) }, "🔊")));
    });
    root.replaceChildren(
      h("div.q",
        qeEl(q.e),
        h("h2", q.q),
        h("button.listen", { type: "button", onclick: () => say(q.q + ". " + opts.map(o => o.t).join(". ")) }, "🔊 Dinle")),
      grid);
    say(q.q);
  }

  /* ---------- 1. Bil Bakalım ---------- */
  function playTest(g, o) {
    const qs = pick(o.quiz, Math.min(6, o.quiz.length));
    const st = stage(g, o, qs.length);
    let i = 0, score = 0;
    (function next() {
      if (i >= qs.length) return finish(g, o, st.body, score, qs.length);
      askQuestion(st.body, qs[i], ok => { if (ok) score++; st.mark(i, ok); i++; next(); });
    })();
  }

  /* ---------- 2. Kutuyu Aç ---------- */
  function playBox(g, o) {
    const qs = pick(o.quiz, Math.min(6, o.quiz.length));
    const st = stage(g, o, qs.length);
    let opened = 0, score = 0;
    const grid = h("div.boxes");
    const panel = h("div.boxpanel", { hidden: "" });
    qs.forEach((q, i) => {
      const b = h("button.box", { type: "button", "aria-label": (i + 1) + ". kutuyu aç", onclick: () => {
        if (b.disabled) return;
        b.disabled = true; grid.hidden = true; panel.hidden = false; lead.hidden = true;
        askQuestion(panel, q, ok => {
          if (ok) score++; st.mark(opened, ok); opened++;
          b.classList.add(ok ? "ok" : "bad"); b.textContent = ok ? "★" : "✓";
          panel.hidden = true; grid.hidden = false; lead.hidden = false;
          if (opened >= qs.length) finish(g, o, st.body, score, qs.length);
        });
      } }, String(i + 1));
      grid.append(b);
    });
    const lead = h("p.lead", "Bir kutu seç.");
    st.body.append(lead, grid, panel);
    say("Bir kutu seç.");
  }

  /* ---------- 3. Balon Patlat ---------- */
  function playBalloon(g, o) {
    const fits = o.quiz.filter(q => q.o.every(x => norm(x).t.length <= 24));
    const qs = pick(fits.length >= 4 ? fits : o.quiz, 6);
    const st = stage(g, o, qs.length);
    const colors = ["c1", "c2", "c3"];
    let i = 0, score = 0;
    (function next() {
      if (i >= qs.length) return finish(g, o, st.body, score, qs.length);
      const q = qs[i];
      const opts = shuffle(q.o.map((x, k) => Object.assign(norm(x), { ok: k === 0 })));
      let tried = false, done = false;
      const sky = h("div.sky");
      const lanes = shuffle([0, 1, 2]);
      opts.forEach((op, k) => {
        const lane = lanes[k];
        const b = h("button.balloon." + colors[k % 3], { type: "button",
          style: "left:" + (4 + lane * 33) + "%;animation-duration:" + (9 + k * 1.7).toFixed(1) + "s;animation-delay:-" + (k * 3.1 + Math.random() * 2).toFixed(1) + "s",
          onclick: () => {
            if (done) return;
            if (op.ok) { done = true; b.classList.add("pop"); beep(true); setTimeout(() => { if (!tried) score++; st.mark(i, !tried); i++; next(); }, 700); }
            else { tried = true; b.classList.add("gone"); b.disabled = true; beep(false); }
          } }, op.e ? h("span.be", { "aria-hidden": "true" }, op.e) : null, h("span.bt" + (!op.e && op.t.length <= 3 ? ".big" : ""), op.t));
        sky.append(b);
      });
      st.body.replaceChildren(
        h("div.q.slim", qeEl(q.e), h("h2", q.q),
          h("button.listen", { type: "button", onclick: () => say(q.q + ". " + opts.map(o => o.t).join(". ")) }, "🔊 Dinle")),
        sky);
      requestAnimationFrame(() => sky.style.setProperty("--travel", (sky.clientHeight + 220) + "px"));
      say(q.q);
    })();
  }

  /* ---------- 4. Eşleştir ---------- */
  function playMatch(g, o) {
    const ps = pick(o.pairs, Math.min(5, o.pairs.length));
    const st = stage(g, o, ps.length);
    let sel = null, done = 0, miss = 0;
    function card(item, id, side) {
      const it = norm(item);
      const b = h("button.mcard", { type: "button", onclick: () => {
        if (b.classList.contains("ok")) return;
        say(it.t);
        if (!sel || sel.side === side) { if (sel) sel.b.classList.remove("sel"); sel = { b, id, side }; b.classList.add("sel"); return; }
        const other = sel; sel = null; other.b.classList.remove("sel");
        if (other.id === id) {
          [b, other.b].forEach(x => { x.classList.add("ok"); x.disabled = true; });
          beep(true); st.mark(done, true); done++;
          if (done >= ps.length) setTimeout(() => finish(g, o, st.body, Math.max(0, ps.length - miss), ps.length, miss === 0 ? 3 : miss <= 2 ? 2 : 1, "Yanlış deneme: " + miss), 800);
        } else {
          miss++; beep(false);
          [b, other.b].forEach(x => { x.classList.add("shake"); setTimeout(() => x.classList.remove("shake"), 500); });
        }
      } }, it.e ? h("span.me", { "aria-hidden": "true" }, it.e) : null, h("span.mt", it.t));
      return b;
    }
    const left = h("div.mcol", shuffle(ps.map((p, i) => card(p[0], i, "a"))));
    const right = h("div.mcol", shuffle(ps.map((p, i) => card(p[1], i, "b"))));
    const hint = o.pairHint || "Soldan bir kart, sağdan eşini seç.";
    st.body.append(h("p.lead", hint), h("div.mgrid", left, right));
    say(hint);
  }

  /* ---------- 5. Hafıza Kartları ---------- */
  function playMemory(g, o) {
    const ps = pick(o.pairs, Math.min(6, o.pairs.length));
    const st = stage(g, o, ps.length);
    let first = null, busy = false, found = 0, moves = 0;
    const cards = shuffle(ps.flatMap((p, i) => [Object.assign(norm(p[0]), { id: i }), Object.assign(norm(p[1]), { id: i })]));
    const grid = h("div.mem");
    cards.forEach(c => {
      const b = h("button.flip", { type: "button", "aria-label": "Kapalı kart", onclick: () => {
        if (busy || b.classList.contains("open")) return;
        b.classList.add("open"); b.setAttribute("aria-label", c.t); say(c.t);
        if (!first) { first = { b, c }; return; }
        moves++;
        const a = first; first = null;
        if (a.c.id === c.id) {
          [a.b, b].forEach(x => x.classList.add("ok")); beep(true); st.mark(found, true); found++;
          if (found >= ps.length) setTimeout(() => finish(g, o, st.body, found, ps.length, moves <= ps.length + 3 ? 3 : moves <= ps.length + 8 ? 2 : 1, moves + " hamlede bitirdin."), 900);
        } else {
          busy = true; beep(false);
          setTimeout(() => { [a.b, b].forEach(x => { x.classList.remove("open"); x.setAttribute("aria-label", "Kapalı kart"); }); busy = false; }, 1200);
        }
      } },
        h("span.front", { "aria-hidden": "true" }, "?"),
        h("span.backface", c.e ? h("span.me", { "aria-hidden": "true" }, c.e) : null, h("span.mt", c.t)));
      grid.append(b);
    });
    const hint = o.pairHint || "İki kart çevir, eş olanları bul.";
    st.body.append(h("p.lead", hint), grid);
    say(hint);
  }

  /* ---------- 6. Grupla ---------- */
  function playGroup(g, o) {
    const set = pick(o.groups, 1)[0];
    const items = pick(set.i, Math.min(8, set.i.length));
    const st = stage(g, o, items.length);
    let i = 0, score = 0;
    const cardBox = h("div.gcardbox");
    const baskets = h("div.baskets");
    let tried = false, lock = false;
    set.c.forEach((c, k) => {
      const b = h("button.basket.b" + k, { type: "button", onclick: () => {
        if (lock) return;
        if (items[i][2] === k) {
          lock = true; beep(true); b.classList.add("hit");
          if (!tried) score++; st.mark(i, !tried);
          setTimeout(() => { b.classList.remove("hit"); i++; show(); }, 650);
        } else { tried = true; beep(false); b.classList.add("shake"); setTimeout(() => b.classList.remove("shake"), 500); }
      } }, h("span.be", { "aria-hidden": "true" }, c[1]), h("span.bt", c[0]));
      baskets.append(b);
    });
    function show() {
      if (i >= items.length) return finish(g, o, st.body, score, items.length);
      tried = false; lock = false;
      const it = items[i];
      cardBox.replaceChildren(h("button.gcard", { type: "button", "aria-label": it[0] + ". Dinlemek için dokun.", onclick: () => say(it[0]) },
        h("span.me", { "aria-hidden": "true" }, it[1]), h("span.mt", it[0])));
      say(it[0]);
    }
    st.body.append(h("p.lead", set.t), cardBox, baskets);
    say(set.t);
    setTimeout(show, 1400);
  }

  /* ---------- 7. Çarkıfelek ---------- */
  function playWheel(g, o) {
    const qs = pick(o.quiz, Math.min(6, o.quiz.length));
    const st = stage(g, o, qs.length);
    const left = qs.map((_, i) => i); let rot = 0, done = 0, score = 0, busy = false;
    const seg = 360 / qs.length;
    const cols = ["#FF5E5B", "#FFC933", "#9BE14B", "#5CC8FF", "#F45DA5", "#FF9A2E"];
    const wheel = h("div.wheel", { style: "background:conic-gradient(" + qs.map((_, i) => cols[i % 6] + " " + i * seg + "deg " + (i + 1) * seg + "deg").join(",") + ")" },
      qs.map((_, i) => h("span.wnum", { style: "transform:rotate(" + (i * seg + seg / 2) + "deg) translateY(-36%)" }, String(i + 1))));
    const btn = h("button.go.big", { type: "button", onclick: spin }, "Çevir");
    const table = h("div.wheelbox", h("div.wpointer", { "aria-hidden": "true" }), wheel, btn);
    const panel = h("div.boxpanel", { hidden: "" });
    st.body.append(table, panel);
    say("Çarkı çevir.");
    function spin() {
      if (busy || !left.length) return; busy = true; btn.disabled = true;
      const k = left.splice(Math.floor(Math.random() * left.length), 1)[0];
      const want = (360 - (k * seg + seg / 2)) % 360;
      rot = rot + 1080 + ((want - (rot % 360) + 360) % 360);
      wheel.style.transform = "rotate(" + rot + "deg)";
      later(() => {
        table.hidden = true; panel.hidden = false;
        askQuestion(panel, qs[k], ok => {
          if (ok) score++; st.mark(done, ok); done++;
          wheel.children[k].classList.add("used");
          panel.hidden = true; table.hidden = false; busy = false; btn.disabled = false;
          if (done >= qs.length) finish(g, o, st.body, score, qs.length);
        });
      }, 2700);
    }
  }

  /* ---------- 8. Doğru mu Yanlış mı ---------- */
  function playTrueFalse(g, o) {
    const qs = pick(o.quiz, Math.min(8, o.quiz.length));
    const st = stage(g, o, qs.length);
    let i = 0, score = 0;
    (function next() {
      if (i >= qs.length) return finish(g, o, st.body, score, qs.length);
      const q = qs[i]; const truth = Math.random() < 0.5;
      const shown = norm(truth ? q.o[0] : q.o[1 + Math.floor(Math.random() * (q.o.length - 1))]);
      let lock = false;
      const card = h("div.claim", shown.e ? h("span.oe", { "aria-hidden": "true" }, shown.e) : null, h("span.ot" + (!shown.e && shown.t.length <= 3 ? ".big" : ""), shown.t));
      const mk = (label, val, cls) => h("button.tf." + cls, { type: "button", onclick: e => {
        if (lock) return; lock = true;
        const ok = val === truth; beep(ok); if (ok) score++; st.mark(i, ok);
        e.currentTarget.classList.add(ok ? "hit" : "shake"); card.classList.add(truth ? "ok" : "bad");
        later(() => { i++; next(); }, 1100);
      } }, label);
      st.body.replaceChildren(
        h("div.q", qeEl(q.e), h("h2", q.q), h("button.listen", { type: "button", onclick: () => say(q.q + ". " + shown.t) }, "🔊 Dinle")),
        h("p.lead", "Bu cevap doğru mu?"), card,
        h("div.tfrow", mk("✔ Doğru", true, "yes"), mk("✘ Yanlış", false, "no")));
      say(q.q + ". " + shown.t);
    })();
  }

  /* ---------- 9. Yarışma ---------- */
  function playShow(g, o) {
    const qs = pick(o.quiz, Math.min(8, o.quiz.length));
    const st = stage(g, o, qs.length);
    const LIMIT = 20; let i = 0, lives = 3, points = 0, right = 0;
    const hud = h("div.hud"), area = h("div.boxpanel");
    st.body.append(hud, area);
    (function next() {
      clearAll();
      if (i >= qs.length || lives <= 0) return finish(g, o, st.body, right, qs.length, null, points + " puan · " + right + " / " + qs.length + " doğru");
      let left = LIMIT, over = false;
      const bar = h("i"); const draw = () => { hud.replaceChildren(h("span.lives", "❤".repeat(lives) + "♡".repeat(3 - lives)), h("div.timer", bar), h("span.points", points + " puan")); bar.style.width = (left / LIMIT * 100) + "%"; };
      draw();
      const id = setInterval(() => { left--; bar.style.width = (left / LIMIT * 100) + "%"; if (left <= 0 && !over) { over = true; clearInterval(id); lives--; beep(false); st.mark(i, false); i++; next(); } }, 1000); T.push(id);
      askQuestion(area, qs[i], ok => { if (over) return; over = true; clearInterval(id); if (ok) { right++; points += 10 + left; } else lives--; st.mark(i, ok); i++; next(); }, true);
    })();
  }

  /* ---------- 10. Eşini Bul ---------- */
  function playFind(g, o) {
    const ps = pick(o.pairs, Math.min(6, o.pairs.length));
    const st = stage(g, o, ps.length);
    const order = shuffle(ps.map((_, i) => i)); let n = 0, score = 0, tried = false, lock = false;
    const prompt = h("div.findprompt");
    const grid = h("div.findgrid", shuffle(ps.map((p, i) => { const it = norm(p[1]);
      const b = h("button.mcard.tile", { type: "button", onclick: () => {
        if (lock || b.classList.contains("ok")) return;
        if (i === order[n]) { lock = true; b.classList.add("ok"); b.disabled = true; beep(true); if (!tried) score++; st.mark(n, !tried); n++; later(show, 700); }
        else { tried = true; beep(false); b.classList.add("shake"); setTimeout(() => b.classList.remove("shake"), 500); }
      } }, it.e ? h("span.me", { "aria-hidden": "true" }, it.e) : null, h("span.mt", it.t));
      return b; })));
    function show() {
      if (n >= ps.length) return finish(g, o, st.body, score, ps.length);
      tried = false; lock = false; const it = norm(ps[order[n]][0]);
      prompt.replaceChildren(h("button.gcard", { type: "button", "aria-label": it.t + ". Dinlemek için dokun.", onclick: () => say(it.t) }, it.e ? h("span.me", { "aria-hidden": "true" }, it.e) : null, h("span.mt", it.t)));
      say(it.t);
    }
    st.body.append(h("p.lead", o.pairHint || "Üstteki kartın eşine dokun."), prompt, grid);
    show();
  }

  /* ---------- 11. Bilgi Kartları ---------- */
  function playCards(g, o) {
    const ps = pick(o.pairs, Math.min(6, o.pairs.length));
    const st = stage(g, o, ps.length);
    let i = 0, known = 0;
    (function next() {
      if (i >= ps.length) return finish(g, o, st.body, known, ps.length, known >= ps.length - 1 ? 3 : known >= ps.length / 2 ? 2 : 1, known + " / " + ps.length + " kartı bildin.");
      const a = norm(ps[i][0]), b = norm(ps[i][1]); let flipped = false;
      const face = h("div.cardface");
      const fill = it => face.replaceChildren(...[it.e ? h("span.me", { "aria-hidden": "true" }, it.e) : null, h("span.mt", it.t)].filter(Boolean));
      fill(a);
      const row = h("div.tfrow", { hidden: "" },
        h("button.tf.yes", { type: "button", onclick: () => { known++; st.mark(i, true); beep(true); i++; next(); } }, "Bildim"),
        h("button.tf.no", { type: "button", onclick: () => { st.mark(i, false); i++; next(); } }, "Bilemedim"));
      const card = h("button.bigcard", { type: "button", onclick: () => { flipped = !flipped; card.classList.toggle("back", flipped); fill(flipped ? b : a); say((flipped ? b : a).t); row.hidden = false; } }, face, h("span.fliphint", "Çevirmek için dokun"));
      st.body.replaceChildren(h("p.lead", o.pairHint || "Eşini düşün, sonra kartı çevir."), card, row);
      say(a.t);
    })();
  }

  /* ---------- 12. Köstebek Vur ---------- */
  function playMole(g, o) {
    const set = pick(o.groups, 1)[0];
    const target = Math.floor(Math.random() * 2);
    const st = stage(g, o, 8);
    const holes = []; const field = h("div.field");
    for (let k = 0; k < 6; k++) { const hole = h("div.hole", h("span.dirt")); holes.push(hole); field.append(hole); }
    const lead = "Yalnızca \"" + set.c[target][0] + "\" olanlara dokun.";
    st.body.append(h("p.lead", set.c[target][1] + " " + lead), field);
    say(lead);
    const TOTAL = 14; let shown = 0, targets = 0, hits = 0, wrong = 0, marks = 0;
    const good = shuffle(set.i.filter(x => x[2] === target)), bad = shuffle(set.i.filter(x => x[2] !== target));
    function pop() {
      if (shown >= TOTAL) return later(() => finish(g, o, st.body, Math.max(0, hits - wrong), Math.max(1, targets), null, "Doğru: " + hits + " · Yanlış: " + wrong), 2600);
      const free = holes.filter(x => !x.querySelector(".mole")); if (!free.length) return later(pop, 400);
      const hole = free[Math.floor(Math.random() * free.length)];
      const isGood = Math.random() < 0.6; const it = isGood ? good[shown % good.length] : bad[shown % bad.length];
      shown++; if (isGood) targets++;
      const m = h("button.mole", { type: "button", onclick: () => {
        if (m.disabled) return; m.disabled = true;
        if (isGood) { hits++; beep(true); m.classList.add("hit"); if (marks < 8) st.mark(marks++, true); }
        else { wrong++; beep(false); m.classList.add("miss"); if (marks < 8) st.mark(marks++, false); }
        later(() => m.remove(), 450);
      } }, it[1] ? h("span.me", { "aria-hidden": "true" }, it[1]) : null, h("span.mt", it[0]));
      hole.append(m);
      later(() => m.remove(), 3200);
      later(pop, 1500);
    }
    later(pop, 1800);
  }

  /* ---------- 13. Sırala ---------- */
  function playOrder(g, o) {
    const rounds = pick(o.orders, Math.min(3, o.orders.length));
    const st = stage(g, o, rounds.length);
    let r = 0, score = 0;
    (function next() {
      if (r >= rounds.length) return finish(g, o, st.body, score, rounds.length);
      const set = rounds[r]; let n = 0, miss = 0;
      const slots = h("div.slots", set.i.map((_, k) => h("div.slot", h("span.slotnum", String(k + 1)))));
      const pool = h("div.pool", shuffle(set.i.map((x, k) => { const it = norm(x);
        const b = h("button.mcard.tile", { type: "button", onclick: () => {
          if (b.disabled) return;
          if (k === n) { b.disabled = true; b.classList.add("ok"); beep(true); say(it.t);
            slots.children[n].append(h("div.placed", it.e ? h("span.me", { "aria-hidden": "true" }, it.e) : null, h("span.mt", it.t))); slots.children[n].classList.add("full"); n++;
            if (n >= set.i.length) { if (!miss) score++; st.mark(r, !miss); r++; later(next, 1300); } }
          else { miss++; beep(false); b.classList.add("shake"); setTimeout(() => b.classList.remove("shake"), 500); }
        } }, it.e ? h("span.me", { "aria-hidden": "true" }, it.e) : null, h("span.mt", it.t));
        return b; })));
      st.body.replaceChildren(h("p.lead", set.t), slots, pool);
      say(set.t);
    })();
  }

  /* ---------- 14. Labirent ---------- */
  function playMaze(g, o) {
    const MAP = ["A..#..B", ".#...#.", "...S...", ".#...#.", "G..C..."], W = 7, H = 5;
    const three = o.quiz.filter(q => q.o.every(x => norm(x).t.length <= 12));
    const qs = pick(three.length >= 4 ? three : o.quiz, Math.min(5, o.quiz.length));
    const st = stage(g, o, qs.length);
    const at = ch => { for (let y = 0; y < H; y++) { const x = MAP[y].indexOf(ch); if (x >= 0) return [x, y]; } };
    const wall = (x, y) => x < 0 || y < 0 || x >= W || y >= H || MAP[y][x] === "#";
    const START = at("S"), SPOTS = [at("A"), at("B"), at("C")];
    let i = 0, score = 0, tried = false, lock = false, px, py, gx, gy, walk = 0, answers = [];
    const qbar = h("div.q.slim"), maze = h("div.maze");
    const cells = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = h("button.mz" + (MAP[y][x] === "#" ? ".wall" : ""), { type: "button", "aria-label": "Buraya yürü", onclick: () => goTo(x, y) }); cells.push(c); maze.append(c); }
    const pl = h("div.mzp"); pl.innerHTML = MASCOT; const gh = h("div.mzg", { "aria-hidden": "true" }, "👻");
    maze.append(pl, gh);
    const place = () => { pl.style.left = px * 100 / W + "%"; pl.style.top = py * 100 / H + "%"; gh.style.left = gx * 100 / W + "%"; gh.style.top = gy * 100 / H + "%"; };
    function path(tx, ty) {
      const prev = {}, key = (x, y) => x + "," + y, queue = [[px, py]]; prev[key(px, py)] = null;
      while (queue.length) { const [x, y] = queue.shift(); if (x === tx && y === ty) break;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => { const nx = x + dx, ny = y + dy; if (!wall(nx, ny) && !(key(nx, ny) in prev)) { prev[key(nx, ny)] = [x, y]; queue.push([nx, ny]); } }); }
      if (!(key(tx, ty) in prev)) return [];
      const out = []; let cur = [tx, ty]; while (cur && !(cur[0] === px && cur[1] === py)) { out.unshift(cur); cur = prev[key(cur[0], cur[1])]; } return out;
    }
    function caught() { if (px === gx && py === gy && !lock) { walk++; beep(false); px = START[0]; py = START[1]; place(); return true; } return false; }
    function arrive() {
      if (caught()) return true;
      const a = answers.find(z => z.x === px && z.y === py && !z.gone); if (!a) return false;
      walk++;
      if (a.ok) { lock = true; beep(true); a.cell.classList.add("ok"); if (!tried) score++; st.mark(i, !tried); i++; later(ask, 900); }
      else { tried = true; beep(false); a.gone = true; a.cell.classList.add("gone"); px = START[0]; py = START[1]; later(place, 250); }
      return true;
    }
    function goTo(tx, ty) {
      if (lock || wall(tx, ty)) return;
      const steps = path(tx, ty), id = ++walk;
      (function step() { if (id !== walk || lock || !steps.length) return; const [x, y] = steps.shift(); px = x; py = y; place(); if (!arrive()) later(step, 210); })();
    }
    function ask() {
      if (i >= qs.length) return finish(g, o, st.body, score, qs.length);
      const q = qs[i]; tried = false; lock = false; walk++;
      px = START[0]; py = START[1]; [gx, gy] = at("G");
      cells.forEach(c => { c.classList.remove("ans", "ok", "gone"); c.replaceChildren(); });
      const opts = shuffle(q.o.map((x, k) => Object.assign(norm(x), { ok: k === 0 })));
      answers = opts.map((op, k) => { const [x, y] = SPOTS[k]; const cell = cells[y * W + x]; cell.classList.add("ans");
        cell.append(...[op.e ? h("span.me", { "aria-hidden": "true" }, op.e) : null, h("span.mt" + (!op.e && op.t.length <= 3 ? ".big" : ""), op.t)].filter(Boolean));
        return { x, y, ok: op.ok, cell, gone: false }; });
      qbar.replaceChildren(...[qeEl(q.e), h("h2", q.q), h("button.listen", { type: "button", onclick: () => say(q.q + ". " + opts.map(z => z.t).join(". ")) }, "🔊 Dinle")].filter(Boolean));
      place(); say(q.q);
    }
    st.body.append(qbar, maze, h("p.hint", "Gitmek istediğin kareye dokun."));
    const gid = setInterval(() => {
      if (lock) return;
      const moves = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [gx + dx, gy + dy]).filter(([x, y]) => !wall(x, y) && !answers.some(a => a.x === x && a.y === y));
      if (moves.length) { [gx, gy] = moves[Math.floor(Math.random() * moves.length)]; place(); caught(); }
    }, 950); T.push(gid);
    onKey = e => { const d = { ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[e.key]; if (d) { e.preventDefault(); goTo(px + d[0], py + d[1]); } };
    document.addEventListener("keydown", onKey);
    ask();
  }

  /* ---------- 15. Uçan Meyve ---------- */
  function playFruit(g, o) {
    const fits = o.quiz.filter(q => q.o.every(x => norm(x).t.length <= 20));
    const qs = pick(fits.length >= 4 ? fits : o.quiz, 6);
    const st = stage(g, o, qs.length);
    const FR = ["🍎", "🍊", "🍐"]; let i = 0, score = 0;
    (function next() {
      if (i >= qs.length) return finish(g, o, st.body, score, qs.length);
      const q = qs[i]; const opts = shuffle(q.o.map((x, k) => Object.assign(norm(x), { ok: k === 0 })));
      let tried = false, done = false; const air = h("div.air"); const lanes = shuffle([0, 1, 2]);
      opts.forEach((op, k) => {
        const b = h("button.fruit", { type: "button",
          style: "top:" + (4 + lanes[k] * 31) + "%;animation-duration:" + (10 + k * 2.2).toFixed(1) + "s;animation-delay:-" + (k * 3.4 + Math.random() * 2).toFixed(1) + "s",
          onclick: () => {
            if (done) return;
            if (op.ok) { done = true; b.classList.add("pop"); beep(true); setTimeout(() => { if (!tried) score++; st.mark(i, !tried); i++; next(); }, 700); }
            else { tried = true; b.classList.add("gone"); b.disabled = true; beep(false); }
          } }, h("span.fr", { "aria-hidden": "true" }, FR[k % 3]),
          h("span.plate", op.e ? h("span.be", { "aria-hidden": "true" }, op.e) : null, h("span.bt" + (!op.e && op.t.length <= 3 ? ".big" : ""), op.t)));
        air.append(b);
      });
      st.body.replaceChildren(
        h("div.q.slim", qeEl(q.e), h("h2", q.q), h("button.listen", { type: "button", onclick: () => say(q.q + ". " + opts.map(z => z.t).join(". ")) }, "🔊 Dinle")), air);
      requestAnimationFrame(() => air.style.setProperty("--travel", (air.clientWidth + 260) + "px"));
      say(q.q);
    })();
  }

  showHome();
})();
