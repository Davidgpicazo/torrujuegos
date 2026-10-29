/* =========================================================================
 * base.js — utilidades, constantes, sonido, voz y efectos compartidos
 * ========================================================================= */

/* ---------- Utilidades ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const azar = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const elegir = a => a[Math.floor(Math.random() * a.length)];
const barajar = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const limitar = (v, min, max) => Math.max(min, Math.min(max, v));
const fechaLocal = d => d.toLocaleDateString('sv-SE');
const hoy = () => fechaLocal(new Date());
const escaparHTML = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const idAleatorio = () => (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2));

/** Devuelve `n` valores distintos (incluido `correcto`) dentro de [min, max]. */
function opcionesNumericas(correcto, n, min, max, salto = 3) {
  const ops = new Set([correcto]);
  let intentos = 0;
  while (ops.size < n && intentos++ < 200) { const d = correcto + azar(-salto, salto); if (d >= min && d <= max) ops.add(d); }
  for (let v = min; ops.size < n; v++) ops.add(v);
  return [...ops];
}

/* ---------- Constantes de contenido ---------- */
const COLORES = [
  { id: 'rojo', nombre: 'rojo', en: 'red', hex: '#F04A3E' },
  { id: 'azul', nombre: 'azul', en: 'blue', hex: '#3B82F6' },
  { id: 'amarillo', nombre: 'amarillo', en: 'yellow', hex: '#FACC15' },
  { id: 'verde', nombre: 'verde', en: 'green', hex: '#22C55E' },
  { id: 'morado', nombre: 'morado', en: 'purple', hex: '#A855F7' },
  { id: 'naranja', nombre: 'naranja', en: 'orange', hex: '#FB923C' },
  { id: 'rosa', nombre: 'rosa', en: 'pink', hex: '#F472B6' }
];
const ANIMALES = [
  { e: '🐶', n: 'perro' }, { e: '🐱', n: 'gato' }, { e: '🐮', n: 'vaca' }, { e: '🐷', n: 'cerdo' },
  { e: '🐸', n: 'rana' }, { e: '🦁', n: 'león' }, { e: '🐵', n: 'mono' }, { e: '🐔', n: 'gallina' },
  { e: '🐴', n: 'caballo' }, { e: '🐑', n: 'oveja' }, { e: '🐭', n: 'ratón' }, { e: '🐻', n: 'oso' }
];
const SILABAS = ['MA', 'ME', 'MI', 'MO', 'MU', 'PA', 'PE', 'PI', 'PO', 'PU', 'SA', 'SE', 'SI', 'SO', 'LA', 'LE', 'LO', 'TA', 'TE', 'TO', 'CA', 'CO', 'NA', 'NO'];
const COLORES_NINO = ['#FF6F59', '#4CB5F5', '#7A5CFA', '#2FB765', '#FFC83D', '#F472B6', '#FB923C'];
const PEGATINAS = ['🦄','🐶','🦖','🚀','🌈','🐱','🦁','🐼','🚒','🍦','⚽','🎸','🦋','🐙','🏰','🚂','🐸','🌟','🍩','🐧'];
const PEGATINAS_MISION = ['🏅','👟','⚡','🤸','🦘','💪','🧗','🥇','🏆','🎖️','🛹','🏓'];
const ESTRELLAS_POR_PEGATINA = 10;
const VIDAS_INICIALES = 3;
const AVISO_ULTIMA_SEG = 180;      // con menos de 3 min, la siguiente partida es la última del día
const INTENTOS_MINIMOS = 8;        // intentos necesarios para valorar una habilidad
const VENTANA_HABILIDAD = 20;      // se valora con los últimos 20 intentos

const HABILIDADES = {
  colores: 'Colores', contar: 'Contar', numeros: 'Números', formas: 'Formas', observacion: 'Observación',
  letras: 'Letras', silabas: 'Sílabas', suma: 'Sumas', resta: 'Restas', multiplicacion: 'Multiplicaciones', division: 'Divisiones',
  lectura: 'Comprensión lectora (problemas)', secuencias: 'Orden de los números', series: 'Series numéricas',
  comparar: 'Comparar números', memoria: 'Memoria', logica: 'Lógica y planificación'
};

/* ---------- Rangos de cálculo según dificultad (6–10 años) ---------- */
function rangosEscolares(d) {
  return {
    maxTotal: d <= 8 ? 4 + 2 * d : Math.min(20 + (d - 8) * 10, 100),     // resultado máximo de sumas/restas
    maxSumando: d <= 8 ? Math.min(2 + d, 9) : Math.min(9 + (d - 8) * 5, 50),
    tablaMax: d >= 5 ? Math.min(2 + (d - 5), 10) : 0,                   // hasta qué tabla de multiplicar
    conDivision: d >= 7, conDosPasos: d >= 6, conSeries: d >= 6
  };
}
// Los números tienen un mínimo de un tercio del rango: así a los 10 años no salen restas como 6 − 1
function generarSuma(r) {
  const maxB = Math.min(r.maxSumando, r.maxTotal - 1), b = azar(Math.max(1, Math.floor(maxB / 3)), maxB);
  const a = azar(Math.max(1, Math.floor((r.maxTotal - b) / 3)), r.maxTotal - b);
  return { a, b, res: a + b };
}
function generarResta(r) {
  const a = azar(Math.max(3, Math.floor(r.maxTotal / 2)), Math.max(3, r.maxTotal)), maxB = Math.min(r.maxSumando, a - 1);
  const b = azar(Math.max(1, Math.floor(maxB / 3)), maxB);
  return { a, b, res: a - b };
}
function generarMulti(r) { const a = azar(2, Math.max(2, r.tablaMax)), b = azar(1, 10); return { a, b, res: a * b }; }
function generarDivision(r) { const a = azar(2, Math.max(2, r.tablaMax)), b = azar(1, 10); return { a: a * b, b: a, res: b }; }

/* ---------- Sonido ---------- */
const Sonido = {
  ctx: null,
  iniciar() {
    if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  tono(f, d = .12, tipo = 'sine', vol = .15, retraso = 0) {
    if (!this.ctx || !estado.sonido) return;
    const t = this.ctx.currentTime + retraso, o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = tipo; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t + d + .02);
  },
  acierto() { this.tono(660, .1, 'triangle'); this.tono(990, .16, 'triangle', .15, .08); },
  fallo() { this.tono(240, .2, 'sawtooth', .05); this.tono(180, .2, 'sawtooth', .05, .1); },
  pop() { this.tono(520, .07, 'square', .05); },
  tic() { this.tono(880, .05, 'square', .04); },
  corte() { this.tono(1400, .05, 'triangle', .08); this.tono(900, .06, 'triangle', .07, .04); },
  moneda() { this.tono(1046, .07, 'square', .05); this.tono(1568, .1, 'square', .05, .06); },
  freno() { this.tono(700, .25, 'sine', .08); this.tono(500, .25, 'sine', .06, .1); },
  silbato() { this.tono(2200, .5, 'square', .06); },
  fanfarria() { [523, 659, 784, 1047].forEach((f, i) => this.tono(f, .2, 'triangle', .15, i * .12)); },
  triste() { [392, 349, 311].forEach((f, i) => this.tono(f, .25, 'triangle', .1, i * .18)); }
};

/* ---------- Voz ---------- */
function vozPara(idioma) {
  const vs = speechSynthesis.getVoices();
  return vs.find(v => v.lang === idioma) || vs.find(v => v.lang.replace('_', '-').startsWith(idioma.slice(0, 2)));
}
function hablar(texto, idioma = 'es-ES', cancelar = true) {
  if (!estado.sonido || !('speechSynthesis' in window)) return;
  try {
    if (cancelar) speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = idioma; const v = vozPara(idioma); if (v) u.voice = v;
    u.rate = .95; u.pitch = 1.15; speechSynthesis.speak(u);
  } catch (e) {}
}
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};

/* ---------- Efectos ---------- */
function mensaje(texto, malo = false) {
  const g = $('#globo'); g.textContent = texto; g.classList.toggle('mal', malo);
  g.classList.remove('ver'); void g.offsetWidth; g.classList.add('ver');
}
const ELOGIOS = ['¡Muy bien!', '¡Genial!', '¡Bravo!', '¡Eso es!', '¡Fenomenal!', '¡Crack!'];
const elogio = () => elegir(ELOGIOS);

const Confeti = {
  parts: [], corriendo: false,
  lanzar(cantidad = 120) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = $('#confeti'), W = innerWidth, H = innerHeight;
    cv.width = W; cv.height = H;
    const cols = ['#FF6F59', '#FFC83D', '#7A5CFA', '#4CB5F5', '#2FB765', '#F472B6'];
    for (let i = 0; i < cantidad; i++) this.parts.push({ x: W / 2, y: H * .4, vx: (Math.random() - .5) * 14, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 4, c: elegir(cols), rot: Math.random() * 6, vida: 1 });
    if (!this.corriendo) { this.corriendo = true; this.paso(); }
  },
  paso() {
    const cv = $('#confeti'), ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, cv.width, cv.height);
    this.parts.forEach(p => { p.x += p.vx; p.y += p.vy; p.vy += .4; p.rot += .2; p.vida -= .008;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.globalAlpha = Math.max(p.vida, 0); ctx.fillStyle = p.c; ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2); ctx.restore(); });
    this.parts = this.parts.filter(p => p.vida > 0 && p.y < cv.height + 20);
    if (this.parts.length) requestAnimationFrame(() => this.paso()); else { this.corriendo = false; ctx.clearRect(0, 0, cv.width, cv.height); }
  }
};

/* ---------- Lienzo ---------- */
function prepararLienzo(cv) {
  const dpr = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
  cv.width = Math.max(1, r.width * dpr); cv.height = Math.max(1, r.height * dpr);
  const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, W: r.width, H: r.height };
}
function rectRedondo(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h); }
function textoFlotante(ctx, t) {
  ctx.globalAlpha = Math.max(t.vida, 0); ctx.font = '800 26px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.strokeText(t.t, t.x, t.y); ctx.fillStyle = t.c; ctx.fillText(t.t, t.x, t.y); ctx.globalAlpha = 1;
}
function estrellaLienzo(ctx, x, y, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; ctx[i ? 'lineTo' : 'moveTo'](x + rr * Math.cos(a), y + rr * Math.sin(a)); }
  ctx.closePath(); ctx.fillStyle = '#FFC83D'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#1D2142'; ctx.stroke();
}
const puntos = (n, clase = 'a') => `<span class="pt ${clase}"></span>`.repeat(n);
const puntosResta = (a, b) => Array.from({ length: a }, (_, i) => `<span class="pt ${i >= a - b ? 'tachado' : 'a'}"></span>`).join('');
