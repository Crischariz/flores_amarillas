const $ = (id) => document.getElementById(id);

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
    if (ctx.state === "suspended") ctx.resume();
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
      if (musicTimer) {
        clearInterval(musicTimer);
        musicTimer = null;
      }
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
function sunflowerSVG() {
  const id = "g" + uid++;
  const n = 14 + Math.floor(Math.random() * 5);
  const petalFill = ["#ffd93d", "#ffcf3f", "#ffe066"][Math.floor(Math.random() * 3)];
  let petals = "";
  for (let i = 0; i < n; i++) {
    const a = Math.round((i * 360) / n);
    petals += `<ellipse cx="0" cy="-46" rx="14" ry="34" fill="${petalFill}" stroke="#e2a01c" stroke-width="1.5" transform="rotate(${a} 0 -12)"/>`;
  }
  let seeds = "";
  for (let i = 0; i < 26; i++) {
    const ang = Math.random() * Math.PI * 2;
    const rad = 5 + Math.random() * 15;
    seeds += `<circle cx="${(Math.cos(ang) * rad).toFixed(1)}" cy="${(-12 + Math.sin(ang) * rad).toFixed(1)}" r="1.6" fill="#8a4a1f"/>`;
  }
  return `<svg viewBox="-80 -90 160 200" aria-hidden="true">
    <defs><radialGradient id="${id}" cx="50%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#fff3c9"/>
      <stop offset="95%" stop-color="#e8ce9e"/>
    </radialGradient></defs>
    <path d="M0,10 C 6,45 -6,70 2,92" stroke="#3f7d33" stroke-width="7" stroke-linecap="round" fill="none"/>
    <ellipse cx="15" cy="42" rx="16" ry="8" fill="#55a13f" transform="rotate(-38 15 42)"/>
    <ellipse cx="-16" cy="58" rx="15" ry="8" fill="#55a13f" transform="rotate(35 -16 58)"/>
    <g transform="translate(0,-12)">
      ${petals}
      <circle r="26" fill="url(#${id})"/>
      <circle r="22" fill="#6b3a17"/>
      ${seeds}
      <circle r="9" fill="#4a2409"/>
    </g>
  </svg>`;
}

const SHINE = `<svg viewBox="-20 -20 40 40" aria-hidden="true"><path d="M0,-15 C2,-6 6,-2 15,0 C6,2 2,6 0,15 C-2,6 -6,2 -15,0 C-6,-2 -2,-6 0,-15 Z" fill="#fff7cc"/></svg>`;

const $sound = $("sound");
$sound.addEventListener("click", () => {
  const off = AudioFX.toggle();
  $sound.classList.toggle("off", off);
  $sound.textContent = off ? "🔇" : "🔊";
});

$("loaderSun").innerHTML = sunflowerSVG();

let loaded = 0;
const progressTimer = setInterval(() => {
  loaded += Math.random() * 9 + 4;
  if (loaded >= 100) {
    loaded = 100;
    clearInterval(progressTimer);
    $("progressBar").style.width = loaded + "%";
    $("progressText").textContent = "100%";
    setTimeout(startField, 400);
  } else {
    $("progressBar").style.width = loaded + "%";
    $("progressText").textContent = Math.floor(loaded) + "%";
  }
}, 160);

function startField() {
  $("loader").classList.add("fade");
  setTimeout(() => $("loader").remove(), 900);
  $("field").classList.add("show");
  buildAmbient();
  plant();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildAmbient() {
  const box = $("sparkles");
  for (let i = 0; i < 16; i++) {
    const s = document.createElement("span");
    s.className = "sparkle";
    s.style.left = Math.random() * 100 + "%";
    s.style.animationDuration = (6 + Math.random() * 7).toFixed(1) + "s";
    s.style.animationDelay = (-(Math.random() * 10)).toFixed(1) + "s";
    s.style.width = (6 + Math.random() * 9).toFixed(0) + "px";
    s.style.height = s.style.width;
    box.appendChild(s);
  }
}

const placed = [];
function makeFlower(msg, idx) {
  const wrap = document.createElement("div");
  wrap.className = "flower";
  wrap.style.setProperty("--s", (0.55 + Math.random() * 0.6).toFixed(2));
  wrap.style.setProperty("--sway-dur", (3.6 + Math.random() * 3).toFixed(2) + "s");
  wrap.style.setProperty("--sway-del", (-(Math.random() * 3)).toFixed(2) + "s");
  wrap.style.setProperty("--d", (idx * 0.05).toFixed(2) + "s");

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

  wrap.innerHTML = `<div class="sway"><div class="inner"><span class="shine">${SHINE}</span>${sunflowerSVG()}</div></div>`;
  wrap.addEventListener("click", (e) => bloom(wrap, msg, e));
  return wrap;
}

function plant() {
  const total = MSG.length;
  $("total").textContent = total;
  const shuffled = shuffle(MSG);
  shuffled.forEach((msg, i) => $("flowers").appendChild(makeFlower(msg, i)));
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
  burst(e, 14);
  currentMsg = msg;
  collected++;
  $("counter").textContent = collected;
  setTimeout(() => showCard(), 380);
}

function burst(e, n = 14) {
  for (let i = 0; i < n; i++) {
    const s = document.createElement("span");
    s.className = "burst";
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
    h.textContent = "💛";
    h.style.left = e.clientX + ((Math.random() - 0.5) * 30) + "px";
    h.style.top = e.clientY + ((Math.random() - 0.5) * 20) + "px";
    h.style.animationDelay = (i * 0.08).toFixed(2) + "s";
    document.body.appendChild(h);
    h.addEventListener("animationend", () => h.remove());
  }
}

function puff(e) {
  const s = document.createElement("span");
  s.className = "puff";
  const dx = (Math.random() - 0.5) * 36;
  const dy = (Math.random() - 0.5) * 36 - 14;
  s.style.setProperty("--dx", dx + "px");
  s.style.setProperty("--dy", dy + "px");
  s.style.left = e.clientX + "px";
  s.style.top = e.clientY + "px";
  document.body.appendChild(s);
  s.addEventListener("animationend", () => s.remove());
}

let lastPuff = 0;
$("field").addEventListener("pointermove", (e) => {
  const now = performance.now();
  if (now - lastPuff < 45) return;
  lastPuff = now;
  puff(e);
});

function buildCardFlower() {
  const box = $("cardFlower");
  if (!box.innerHTML) box.innerHTML = sunflowerSVG();
}

function showIntro() {
  buildCardFlower();
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
  const emojis = ["🌻", "💛", "🌼", "🌻", "💚", "✨", "🌻", "💜"];
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

window.addEventListener("load", () => setTimeout(showIntro, 2600));