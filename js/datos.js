/* =========================================================================
 * datos.js — estado local, niños, edad → dificultad, tiempo diario,
 * habilidades y recompensas
 * ========================================================================= */

const CLAVE_ESTADO = 'torrujuegos_v2';
const CLAVE_ANTIGUA = 'juegosTito_v1';

/* ---------- Niños ---------- */
function limitePorEdad(edad) { return edad <= 4 ? 15 : edad <= 6 ? 20 : edad <= 8 ? 30 : 40; }

function ninoNuevo({ nombre, anio, mes, color, limiteMin }) {
  const n = {
    id: idAleatorio(), nombre, nacimiento: { anio, mes }, color: color || elegir(COLORES_NINO), editado: Date.now(),
    estrellas: 0, pegatinas: [], especiales: [], niveles: {}, habilidades: {}, misiones: 0, misionesRecientes: [],
    limiteMin: 20, uso: {}, extra: {}, bloqueo: null
  };
  n.limiteMin = limiteMin || limitePorEdad(edadDe(n));
  return n;
}
/** Completa campos que falten (datos de versiones antiguas o de otro dispositivo). */
function normalizarNino(n) {
  const base = { estrellas: 0, pegatinas: [], especiales: [], niveles: {}, habilidades: {}, misiones: 0, misionesRecientes: [], uso: {}, extra: {}, bloqueo: null, editado: 0, reinicio: 0, color: COLORES_NINO[0] };
  Object.keys(base).forEach(k => { if (n[k] === undefined || n[k] === null && k !== 'bloqueo') n[k] = base[k]; });
  if (!n.nacimiento) n.nacimiento = { anio: new Date().getFullYear() - 6, mes: 1 };
  if (!n.limiteMin) n.limiteMin = limitePorEdad(edadDe(n));
  return n;
}

/* ---------- Edad y dificultad ---------- */
function edadDe(n) {
  const d = new Date(), { anio, mes } = n.nacimiento;
  return d.getFullYear() - anio - ((d.getMonth() + 1) < mes ? 1 : 0);
}
const edadJuego = n => limitar(edadDe(n), 3, 10);
const esPeque = n => edadJuego(n) <= 5;
const cumpleEsteMes = n => (new Date().getMonth() + 1) === n.nacimiento.mes;

/*
 * Dificultad interna = base según la edad + (nivel del juego - 1).
 * Hasta 5 años se usa el contenido "peque" (contar, colores, formas);
 * desde 6, el "escolar" (letras, sumas… y desde la dificultad 5, multiplicar, dividir, series).
 * Al cumplir años la base sube sola: así el juego se adapta a la edad sin tocar nada.
 */
const BASE_DIFICULTAD = { 3: 1, 4: 1, 5: 3, 6: 1, 7: 3, 8: 5, 9: 7, 10: 9 };
const nivelDe = (n, clave) => n.niveles[clave] || 1;
const dificultadDe = (n, clave) => BASE_DIFICULTAD[edadJuego(n)] + nivelDe(n, clave) - 1;

/* ---------- Estado global ---------- */
function estadoVacio() {
  return { version: 2, dispositivo: idAleatorio(), sonido: true, activo: null, familia: null, ninos: [], eliminados: [], bannerCerrado: false };
}

/** Pasa los datos del prototipo (2 perfiles fijos con edad) al formato de niños con fecha. */
function migrarDesdeV1(v1, disp) {
  const ahora = new Date();
  return (v1.perfiles || []).map(p => {
    const uso = {};
    Object.entries(p.uso || {}).forEach(([f, s]) => { uso[f] = typeof s === 'number' ? { [disp]: s } : s; });
    return normalizarNino({
      id: idAleatorio(), nombre: p.nombre, nacimiento: { anio: ahora.getFullYear() - (p.edad || 6), mes: ahora.getMonth() + 1 },
      color: p.color, editado: Date.now(), estrellas: p.estrellas || 0, pegatinas: p.pegatinas || [], especiales: p.especiales || [],
      niveles: p.niveles || {}, habilidades: p.habilidades || {}, misiones: p.misiones || 0, limiteMin: p.limiteMin, uso, extra: p.extra || {}, bloqueo: p.bloqueo || null
    });
  });
}

function podarUso(n) {
  const limite = fechaLocal(new Date(Date.now() - 60 * 864e5));
  Object.keys(n.uso).forEach(f => { if (f < limite) delete n.uso[f]; });
  Object.keys(n.extra).forEach(f => { if (f < limite) delete n.extra[f]; });
}

function cargarEstado() {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE_ESTADO));
    if (s && Array.isArray(s.ninos)) { s.ninos.forEach(n => { normalizarNino(n); podarUso(n); }); s.eliminados = s.eliminados || []; return s; }
  } catch (e) {}
  const nuevo = estadoVacio();
  try {
    const v1 = JSON.parse(localStorage.getItem(CLAVE_ANTIGUA));
    if (v1 && v1.perfiles) { nuevo.ninos = migrarDesdeV1(v1, nuevo.dispositivo); nuevo.sonido = v1.sonido !== false; }
  } catch (e) {}
  return nuevo;
}
let estado = cargarEstado();

function guardarLocal() { try { localStorage.setItem(CLAVE_ESTADO, JSON.stringify(estado)); } catch (e) {} }
/** Guarda en el dispositivo y programa la sincronización con la familia. */
function guardarEstado() { guardarLocal(); if (typeof Sync !== 'undefined') Sync.programar(); }

const perfilActivo = () => estado.ninos.find(n => n.id === estado.activo) || null;

/* ---------- Tiempo diario (suma de todos los dispositivos) ---------- */
const segundosDia = (n, fecha) => Object.values(n.uso[fecha] || {}).reduce((a, b) => a + b, 0);
const segundosHoy = n => segundosDia(n, hoy());
const limiteHoySeg = n => (n.limiteMin + (n.extra[hoy()] || 0)) * 60;
const restantesSeg = n => limiteHoySeg(n) - segundosHoy(n);
const bloqueadoHoy = n => n.bloqueo === hoy() || restantesSeg(n) <= 0;
function sumarSegundo(n) {
  const f = hoy(), d = estado.dispositivo;
  if (!n.uso[f]) n.uso[f] = {};
  n.uso[f][d] = (n.uso[f][d] || 0) + 1;
}

/* ---------- Registro de habilidades (panel de padres) ---------- */
function registrar(habilidad, acierto, nino = perfilActivo()) {
  if (!nino || !habilidad) return;
  const h = nino.habilidades[habilidad] || (nino.habilidades[habilidad] = { ok: 0, ko: 0, ult: [] });
  acierto ? h.ok++ : h.ko++;
  h.ult.push(acierto ? 1 : 0); if (h.ult.length > VENTANA_HABILIDAD) h.ult.shift();
  guardarEstado();
}

/* ---------- Recompensas ---------- */
function actualizarContadores() { const n = perfilActivo(); $$('.contEstrellas').forEach(e => e.textContent = n ? n.estrellas : 0); }

function premiar(cantidad = 1, nino = perfilActivo()) {
  if (!nino) return;
  const antes = Math.floor(nino.estrellas / ESTRELLAS_POR_PEGATINA);
  nino.estrellas += cantidad;
  const despues = Math.floor(nino.estrellas / ESTRELLAS_POR_PEGATINA);
  if (despues > antes && nino.pegatinas.length < PEGATINAS.length) {
    const nueva = PEGATINAS[nino.pegatinas.length]; nino.pegatinas.push(nueva); mostrarPegatina(nueva, nino.nombre);
  }
  actualizarContadores(); guardarEstado();
}
function mostrarPegatina(peg, nombre, especial = false) {
  $('#toastPegatina')?.remove();
  const t = document.createElement('div'); t.id = 'toastPegatina';
  t.innerHTML = `<span class="peg">${peg}</span><span>¡Nueva pegatina${especial ? ' de misiones' : ''} para ${escaparHTML(nombre)}!</span>`;
  document.body.appendChild(t); Sonido.fanfarria();
  setTimeout(() => hablar(`¡${nombre}, has ganado una pegatina${especial ? ' especial' : ''}!`, 'es-ES', false), 600);
  setTimeout(() => t.remove(), 3200);
}
// Menos celebración cuanto más rato lleva jugando (evita sobreestimular en sesiones largas)
const cantidadConfeti = () => { const n = perfilActivo(); return n && segundosHoy(n) > 600 ? 35 : 120; };
