const $ = (id) => document.getElementById(id);
const TEST = /[?&]test=1/.test(location.search);
const IS_MOBILE = window.innerWidth <= 560;

const MSG = [
  "Pricesa, tu sonrisa ilumina más que mil girasoles",
  "Amor, cada día a tu lado es mi día favorito",
  "Mi niña, eres lo más lindo que me ha pasado en la vida",
  "Pricesa, contigo el tiempo vuela y el corazón me late fuerte",
  "Amor, tu voz es mi canción favorita",
  "Mi niña, gracias por existir y por ser mía",
  "Pricesa, te elijo hoy, mañana y siempre",
  "Amor, eres mi hogar, mi paz, mi todo",
  "Mi niña, cuando sonríes, el mundo entero se detiene",
  "Pricesa, te regalo estas flores amarillas porque mi corazón nunca se olvida de ti",
  "Amor, te amo más de lo que las palabras alcanzan a decir",
  "Mi niña, eres lo mejor que me ha pasado",
  "Pricesa, hoy y siempre, mi amor es para ti",
  "Amor, me haces la persona más feliz del mundo",
  "Mi niña, así como el girasol busca la luz, mi corazón siempre te busca a ti"
];

const MELODY = [
  [523.25, 130.81], [0, 0], [659.25, 0], [0, 0],
  [783.99, 110.00], [0, 0], [880.00, 0], [0, 0],
  [1046.50, 87.31], [0, 0], [880.00, 0], [0, 0],
  [783.99, 98.00], [0, 0], [659.25, 0], [523.25, 0]
];
const MELODY_STEP = 0.62;

const AudioFX = (() => {
  let ctx = null;
  let muted = false;
  let musicOngoing = false;
  let musicTimer = null;
  let musicNext = 0;
  let musicStep = 0;

  function ensure() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  function note(freq, delay, dur, type = "sine", vol = 0.2) {
    if (muted || !freq) return;
    const c = ensure();
    const t = c.currentTime + delay;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.1);
  }

  function noise(dur = 0.08, vol = 0.12) {
    if (muted) return;
    const c = ensure();
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = "lowpass";
    f.frequency.value = 1100;
    const g = c.createGain();
    g.gain.value = vol;
    src.connect(f);
    f.connect(g);
    g.connect(c.destination);
    src.start();
  }

  const SCALE = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33];

  function scheduleMusic() {
    const c = ensure();
    while (musicNext < c.currentTime + 0.5) {
      const [m, b] = MELODY[musicStep % MELODY.length];
      if (m) note(m, musicNext - c.currentTime, 1.2, "sine", 0.06);
      if (b) note(b, musicNext - c.currentTime, 2.4, "sine", 0.045);
      musicNext += MELODY_STEP;
      musicStep++;
    }
  }

  return {
    toggle() {
      muted = !muted;
      if (!muted && musicOngoing) {
        ensure();
        musicNext = ensure().currentTime + 0.15;
      }
      return muted;
    },
    startMusic() {
      if (musicOngoing || muted) return;
      musicOngoing = true;
      ensure();
      musicNext = ensure().currentTime + 0.1;
      musicTimer = setInterval(() => {
        if (musicOngoing && !muted) scheduleMusic();
      }, 140);
    },
    stopMusic() {
      musicOngoing = false;
      if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    },
    pop() { noise(0.06, 0.13); },
    click() { note(1500, 0, 0.06, "triangle", 0.05); noise(0.02, 0.03); },
    bloom(i) {
      const f = SCALE[i % SCALE.length];
      note(f, 0, 0.6, "sine", 0.16);
      note(f * 2, 0.04, 0.45, "triangle", 0.07);
      noise(0.05, 0.1);
      if (i % 2 === 0) note(f * 4, 0.08, 0.3, "sine", 0.05);
    },
    chime() {
      note(1046.5, 0, 0.9, "triangle", 0.09);
      note(1318.5, 0.09, 1.0, "triangle", 0.07);
      note(1567.98, 0.18, 1.2, "sine", 0.05);
      noise(0.03, 0.05);
    },
    shine() {
      note(2093 + Math.random() * 500, 0, 0.4, "sine", 0.05);
    },
    fanfare() {
      note(523.25, 0, 1.5, "triangle", 0.12);
      note(659.25, 0, 1.5, "triangle", 0.1);
      note(783.99, 0, 1.5, "triangle", 0.1);
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
        note(f, 0.3 + i * 0.13, 0.9, "sine", 0.12)
      );
      [2093.0, 2637.0, 3136.0].forEach((f, i) =>
        note(f, 0.7 + i * 0.2, 1.2, "sine", 0.05)
      );
      noise(0.4, 0.06);
    }
  };
})();

let uid = 0;
const PETALS = {
  gold: ["#ffd93d", "#ffcf3f", "#ffe066"],
  pink: ["#ff9bd8", "#ff7eb3", "#ffafdd"],
  purple: ["#b78bff", "#9b6ee8", "#cfa4f7"]
};
const CENTERS = {
  gold: { outer: "#fff3c9", mid: "#6b3a17", seed: "#8a4a1f", core: "#4a2409" },
  pink: { outer: "#ffd9f2", mid: "#d4679a", seed: "#7a3f9e", core: "#5b2a5e" },
  purple: { outer: "#ecd9ff", mid: "#7a5bd6", seed: "#4b2a7a", core: "#2f1b52" }
};
const GLOWS = { gold: "rgba(255,214,80,.55)", pink: "rgba(255,126,179,.5)", purple: "rgba(199,164,247,.5)" };
const SHINE_COLORS = { gold: "#fff7cc", pink: "#ffd9f2", purple: "#e9d4ff" };

function stemLeaves() {
  return `<path d="M0,10 C 6,45 -6,70 2,92" stroke="#3f7d33" stroke-width="7" stroke-linecap="round" fill="none"/>
    <ellipse cx="15" cy="42" rx="16" ry="8" fill="#55a13f" transform="rotate(-38 15 42)"/>
    <ellipse cx="-16" cy="58" rx="15" ry="8" fill="#55a13f" transform="rotate(35 -16 58)"/>`;
}

function sunflowerSVG(kind = "gold") {
  const id = "g" + uid++;
  const n = 14 + Math.floor(Math.random() * 5);
  const fills = PETALS[kind];
  let petals = "";
  for (let i = 0; i < n; i++) {
    const a = Math.round((i * 360) / n);
    petals += `<ellipse cx="0" cy="-46" rx="14" ry="34" fill="${fills[i % fills.length]}" stroke="#e2a01c" stroke-width="1.5" transform="rotate(${a} 0 -12)"/>`;
  }
  const c = CENTERS[kind];
  let seeds = "";
  for (let i = 0; i < 26; i++) {
    const ang = Math.random() * Math.PI * 2;
    const rad = 5 + Math.random() * 15;
    seeds += `<circle cx="${(Math.cos(ang) * rad).toFixed(1)}" cy="${(-12 + Math.sin(ang) * rad).toFixed(1)}" r="1.6" fill="${c.seed}"/>`;
  }
  return `<svg viewBox="-80 -90 160 200" aria-hidden="true">
    <defs><radialGradient id="${id}" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="${c.outer}"/>
      <stop offset="95%" stop-color="#e8ce9e"/>
    </radialGradient></defs>
    ${stemLeaves()}
    <g transform="translate(0,-12)">
      ${petals}
      <circle r="26" fill="url(#${id})"/>
      <circle r="22" fill="${c.mid}"/>
      ${seeds}
      <circle r="9" fill="${c.core}"/>
    </g>
  </svg>`;
}

function tulipSVG() {
  return `<svg viewBox="-80 -90 160 200" aria-hidden="true">
    ${stemLeaves()}
    <g transform="translate(0,-18)">
      <ellipse cx="0" cy="4" rx="13" ry="32" fill="#ffe066" stroke="#e3a11f" stroke-width="1.5"/>
      <ellipse cx="-14" cy="2" rx="14" ry="30" fill="#ffd34d" stroke="#e3a11f" stroke-width="1.5" transform="rotate(-20 -14 2)"/>
      <ellipse cx="14" cy="2" rx="14" ry="30" fill="#ffcb3a" stroke="#e3a11f" stroke-width="1.5" transform="rotate(20 14 2)"/>
      <ellipse cx="-6" cy="20" rx="9" ry="12" fill="#ffc82e" stroke="#e3a11f" stroke-width="1.2" transform="rotate(-8 -6 20)"/>
      <ellipse cx="6" cy="20" rx="9" ry="12" fill="#ffc82e" stroke="#e3a11f" stroke-width="1.2" transform="rotate(8 6 20)"/>
      <path d="M-11,16 C-13,26 0,32 0,32 C0,32 13,26 11,16 C7,21 -7,21 -11,16 Z" fill="#5fad44" stroke="#4e8c3f" stroke-width="1.2"/>
    </g>
  </svg>`;
}

function roseSVG() {
  let out = "", mid = "", inn = "";
  for (let i = 0; i < 6; i++) out += `<ellipse cx="0" cy="-34" rx="17" ry="23" fill="#ffb71f" stroke="#d98e1c" stroke-width="1.2" transform="rotate(${(i * 60)} 0 0)"/>`;
  for (let i = 0; i < 5; i++) mid += `<ellipse cx="0" cy="-25" rx="13" ry="17" fill="#ffc82e" stroke="#d9a01e" stroke-width="1.1" transform="rotate(${(i * 72 + 34)} 0 0)"/>`;
  for (let i = 0; i < 3; i++) inn += `<ellipse cx="0" cy="-16" rx="8" ry="10" fill="#ffd93d" transform="rotate(${(i * 120 + 60)} 0 0)"/>`;
  return `<svg viewBox="-80 -90 160 200" aria-hidden="true">
    ${stemLeaves()}
    <g transform="translate(0,-12)">
      ${out}${mid}${inn}
      <ellipse cx="0" cy="-14" rx="5" ry="6" fill="#ffe066"/>
      <ellipse cx="-2" cy="-16" rx="2" ry="3" fill="#fff6c9" transform="rotate(-20 -2 -16)"/>
    </g>
  </svg>`;
}

function daisySVG() {
  let p = "";
  for (let i = 0; i < 12; i++) p += `<ellipse cx="0" cy="-40" rx="9" ry="24" fill="#fff3b0" stroke="#ffd93d" stroke-width="1.5" transform="rotate(${(i * 30)} 0 0)"/>`;
  for (let i = 0; i < 12; i++) p += `<ellipse cx="0" cy="-31" rx="8" ry="20" fill="#ffe9a8" stroke="#ffd93d" stroke-width="1" transform="rotate(${(i * 30 + 15)} 0 0)"/>`;
  return `<svg viewBox="-80 -90 160 200" aria-hidden="true">
    ${stemLeaves()}
    <g transform="translate(0,-12)">
      ${p}
      <circle r="17" fill="#f9a826" stroke="#d98e1c" stroke-width="1.5"/>
      <circle r="10" fill="#ffe066"/>
      <circle cx="-4" cy="-3" r="2" fill="#e8a520"/><circle cx="4" cy="2" r="2" fill="#e8a520"/><circle cx="0" cy="5" r="2" fill="#e8a520"/><circle cx="-2" cy="1" r="1.5" fill="#fff6c9"/>
    </g>
  </svg>`;
}

function flowerSVG(type) {
  switch (type) {
    case "tulip": return tulipSVG();
    case "rose": return roseSVG();
    case "daisy": return daisySVG();
    default: return sunflowerSVG();
  }
}

function shineSVG(kind) {
  const col = SHINE_COLORS[kind] || "#fff7cc";
  return `<svg viewBox="-20 -20 40 40" aria-hidden="true"><path d="M0,-15 C2,-6 6,-2 15,0 C6,2 2,6 0,15 C-2,6 -6,2 -15,0 C-6,-2 -2,-6 0,-15 Z" fill="${col}"/></svg>`;
}

const STAR = `<svg viewBox="-20 -20 40 40" aria-hidden="true"><path d="M0,-15 C2,-6 6,-2 15,0 C6,2 2,6 0,15 C-2,6 -6,2 -15,0 C-6,-2 -2,-6 0,-15 Z" fill="#ffffff"/></svg>`;

const $sound = $("sound");
$sound.addEventListener("click", () => {
  const off = AudioFX.toggle();
  $sound.classList.toggle("off", off);
  $sound.textContent = off ? "🔇" : "🔊";
});

$("loaderSun").innerHTML = sunflowerSVG("gold");

let loaded = 0;
const progressTimer = setInterval(() => {
  loaded += Math.random() * 9 + 4;
  if (loaded >= 100) {
    loaded = 100;
    clearInterval(progressTimer);
    $("progressBar").style.width = loaded + "%";
    $("progressText").textContent = "100%";
    finishLoad();
  } else {
    $("progressBar").style.width = loaded + "%";
    $("progressText").textContent = Math.floor(loaded) + "%";
  }
}, 150);

function finishLoad() {
  AudioFX.chime();
  setTimeout(() => {
    $("loader").classList.add("fade");
    setTimeout(() => $("loader").remove(), 1000);
    $("field").classList.add("show");
    buildAmbient();
    plant();
  }, 300);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function rnd(a, b) { return a + Math.random() * (b - a); }

function buildAmbient() {
  const box = $("sparkles");
  const n = IS_MOBILE ? 10 : 16;
  const cols = ["gold", "pink", "purple"];
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "sparkle";
    const k = cols[Math.floor(Math.random() * 3)];
    if (k !== "gold") s.classList.add(k);
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDuration = rnd(6, 13).toFixed(1) + "s";
    s.style.animationDelay = (-rnd(0, 10)).toFixed(1) + "s";
    const size = rnd(6, IS_MOBILE ? 12 : 15).toFixed(0);
    s.style.width = size + "px";
    s.style.height = size + "px";
    box.appendChild(s);
  }

  const magic = $("magic");
  const starN = IS_MOBILE ? 6 : 10;
  for (let i = 0; i < starN; i++) {
    const st = document.createElement("span");
    st.className = "star";
    st.style.top = rnd(4, 42) + "%";
    st.style.left = rnd(3, 97) + "%";
    st.style.animationDelay = rnd(0, 3).toFixed(2) + "s";
    st.innerHTML = STAR;
    magic.appendChild(st);
  }

  const butterfliesN = IS_MOBILE ? 3 : 5;
  const fairiesN = IS_MOBILE ? 2 : 3;
  for (let i = 0; i < butterfliesN; i++) addFlyer("butterfly", magic);
  for (let i = 0; i < fairiesN; i++) addFlyer("fairy", magic);
}

function addFlyer(kind, parent, minTop, maxTop) {
  const el = document.createElement("div");
  el.className = "flyer";
  const road = document.createElement("div");
  road.className = "flyer-x";
  const bob = document.createElement("div");
  bob.className = "flyer-bob";

  const fd = rnd(15, 30).toFixed(1);
  const delay = (-rnd(0, 20)).toFixed(2) + "s";
  road.style.animationDuration = fd + "s";
  road.style.animationDelay = delay;
  bob.style.animationDelay = delay;
  bob.style.setProperty("--amp", rnd(14, 34).toFixed(0) + "px");
  bob.style.setProperty("--tilt", rnd(-14, -6).toFixed(0) + "deg");
  bob.style.setProperty("--tilt2", rnd(6, 14).toFixed(0) + "deg");
  bob.style.setProperty("--fb", rnd(4, 7).toFixed(1) + "s");
  el.style.setProperty("--fy", rnd(minTop || 12, maxTop || 68).toFixed(0) + "%");

  if (kind === "butterfly") {
    const hue = Math.random() < 0.5 ? "pink" : "purple";
    bob.innerHTML = `<div class="butterfly ${hue}"><div class="w wl"></div><div class="w wr"></div><div class="ant a1"></div><div class="ant a2"></div><div class="body"></div></div>`;
  } else {
    const hue = Math.random() < 0.5 ? "pink" : "purple";
    bob.innerHTML = `<div class="fairy ${hue}"><div class="w l"></div><div class="w r"></div><div class="orb"></div></div>`;
  }

  el.appendChild(road);
  road.appendChild(bob);
  parent.appendChild(el);
  return el;
}

const FLOWER_BAG = ["sun", "sun", "sun", "sun", "sun", "sun", "tulip", "tulip", "tulip", "rose", "rose", "rose", "daisy", "daisy", "daisy"];

const placed = [];
function makeFlower(msg, idx, type) {
  const wrap = document.createElement("div");
  wrap.className = "flower";
  const kind = "gold";
  wrap.style.setProperty("--s", rnd(0.55, 1.15).toFixed(2));
  wrap.style.setProperty("--sway-dur", rnd(3.6, 6.6).toFixed(2) + "s");
  wrap.style.setProperty("--sway-del", (-rnd(0, 3)).toFixed(2) + "s");
  wrap.style.setProperty("--d", (idx * 0.06).toFixed(2) + "s");
  wrap.style.setProperty("--glow", GLOWS[kind]);
  wrap.style.setProperty("--shinec", SHINE_COLORS[kind]);

  let x = 6 + Math.random() * 88;
  let y = 16 + Math.random() * 66;
  for (let tries = 0; tries < 40; tries++) {
    const clash = placed.some((p) => Math.hypot(p.x - x, p.y - y) < 17);
    if (!clash) break;
    x = 6 + Math.random() * 88;
    y = 16 + Math.random() * 66;
  }
  placed.push({ x, y });
  wrap.style.left = x + "%";
  wrap.style.top = y + "%";
  wrap.setAttribute("data-type", type);

  wrap.innerHTML = `<div class="sway"><div class="inner"><span class="shine">${shineSVG(kind)}</span>${flowerSVG(type)}</div></div>`;
  wrap.addEventListener("click", (e) => bloom(wrap, msg, e));
  return wrap;
}

function plant() {
  const total = MSG.length;
  $("total").textContent = total;
  const shuffled = shuffle(MSG);
  const types = shuffle(FLOWER_BAG);
  shuffled.forEach((msg, i) => $("flowers").appendChild(makeFlower(msg, i, types[i % types.length])));
}

let collected = 0;
let currentMsg = "";

function bloom(wrap, msg, e) {
  if (wrap.classList.contains("done")) return;
  wrap.classList.add("done");
  const inner = wrap.querySelector(".inner");
  inner.classList.remove("pop");
  void inner.offsetWidth;
  inner.classList.add("pop");
  AudioFX.bloom(collected);
  burst(e, 14, wrap.getAttribute("data-kind") || "gold");
  currentMsg = msg;
  collected++;
  $("counter").textContent = collected;
  setTimeout(() => showCard(), 380);
}

function burst(e, n = 14, kind = "gold") {
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "burst";
    if (kind === "pink" || kind === "purple") s.classList.add(kind);
    const ang = (i / n) * Math.PI * 2;
    const dist = 40 + Math.random() * 70;
    s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
    s.style.setProperty("--dy", (Math.sin(ang) * dist - 40) + "px");
    s.style.left = e.clientX + "px";
    s.style.top = e.clientY + "px";
    document.body.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
  }
  for (let i = 0; i < 3; i++) {
    const h = document.createElement("span");
    h.className = "heart-up";
    h.textContent = i % 3 === 0 ? "💛" : i % 3 === 1 ? "💗" : "💜";
    h.style.left = e.clientX + rnd(-20, 20).toFixed(0) + "px";
    h.style.top = e.clientY + rnd(-12, 12).toFixed(0) + "px";
    h.style.animationDelay = (i * 0.08).toFixed(2) + "s";
    document.body.appendChild(h);
    h.addEventListener("animationend", () => h.remove());
  }
}

function puff(e) {
  const s = document.createElement("span");
  s.className = "puff";
  s.style.setProperty("--dx", rnd(-18, 18).toFixed(0) + "px");
  s.style.setProperty("--dy", (rnd(-18, 18).toFixed(0) - 14) + "px");
  s.style.left = e.clientX + "px";
  s.style.top = e.clientY + "px";
  document.body.appendChild(s);
  s.addEventListener("animationend", () => s.remove());
}

let lastPuff = 0;
$("field").addEventListener("pointermove", (e) => {
  const now = performance.now();
  if (now - lastPuff < 55) return;
  lastPuff = now;
  puff(e);
});

function setCardFlower(boxId) {
  const types = ["sun", "tulip", "rose", "daisy"];
  const box = $(boxId);
  if (box) box.innerHTML = flowerSVG(types[Math.floor(Math.random() * types.length)]);
}

function showIntro() {
  setCardFlower("introFlower");
  $("intro").classList.remove("hidden");
  AudioFX.pop();
  $("introBtn").onclick = () => {
    AudioFX.click();
    AudioFX.chime();
    AudioFX.startMusic();
    $("intro").classList.add("hidden");
  };
}

function showCard() {
  const total = MSG.length;
  $("cardText").textContent = currentMsg;
  $("cardBtn").textContent = collected === total ? "Para el final 🌻" : "Siguiente 🌻";
  setCardFlower("cardFlower");
  $("card").classList.remove("hidden");
  AudioFX.chime();
  $("cardBtn").onclick = () => {
    AudioFX.click();
    $("card").classList.add("hidden");
    if (collected === total) startFinale();
  };
}

function confetti() {
  const x = window.innerWidth / 2;
  const y = window.innerHeight / 2;
  for (let i = 0; i < 34; i++) {
    const s = document.createElement("span");
    s.className = "burst";
    s.classList.add(["pink", "purple"][i % 2]);
    const ang = (i / 34) * Math.PI * 2 + Math.random() * 0.4;
    const dist = 90 + Math.random() * 240;
    s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
    s.style.setProperty("--dy", (Math.sin(ang) * dist - 90) + "px");
    s.style.left = x + "px";
    s.style.top = y + "px";
    s.style.animationDelay = (Math.random() * 0.6).toFixed(2) + "s";
    document.body.appendChild(s);
    s.addEventListener("animationend", () => s.remove());
  }
}

function startFinale() {
  AudioFX.stopMusic();
  AudioFX.fanfare();
  const finale = $("finale");
  finale.classList.add("show");
  confetti();
  addFlyer("fairy", $("petals"), 8, 40);
  addFlyer("butterfly", $("petals"), 15, 60);
  addFlyer("butterfly", $("petals"), 20, 70);
  const emojis = ["🌻", "💛", "🌼", "🌻", "💚", "✨", "🌻", "💜", "💗"];
  const petals = $("petals");
  for (let i = 0; i < 42; i++) {
    const p = document.createElement("span");
    p.className = "petal";
    p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    p.style.left = Math.random() * 100 + "%";
    p.style.fontSize = (14 + Math.random() * 20) + "px";
    p.style.animationDuration = (5 + Math.random() * 7).toFixed(1) + "s";
    p.style.animationDelay = (Math.random() * 7).toFixed(1) + "s";
    petals.appendChild(p);
  }
  $("replay").onclick = () => location.reload();
}

window.addEventListener("load", () => {
  if (!TEST) setTimeout(showIntro, 2600);
});