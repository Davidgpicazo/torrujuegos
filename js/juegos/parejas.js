/* =========================================================================
 * Parejas — memoria (1 jugador o 2 hermanos por turnos). Sin vidas.
 * ========================================================================= */
const PAREJAS_PEQUE = [3, 4, 6, 6, 8, 8, 10];
const PAREJAS_ESCOLAR = [4, 6, 6, 8, 8, 10, 10];
const COLUMNAS = { 6: 3, 8: 4, 12: 3, 16: 4, 20: 4 };

function crearParejas(cont, nino, d, partida) {
  const otros = estado.ninos.filter(n => n.id !== nino.id);
  cont.innerHTML = `<div class="eleccion"><h2 style="font-size:1.8rem">¿Cuántos jugáis?</h2>
    <button class="btn primario" id="p1">1 jugador · ${escaparHTML(nino.nombre)}</button>
    ${otros.length ? `<p class="nota" style="font-weight:800;opacity:1">2 jugadores: ¿con quién juega ${escaparHTML(nino.nombre)}?</p>
    <div class="companeros">${otros.map(o => `<button class="btn" data-id="${o.id}">${escaparHTML(o.nombre)}</button>`).join('')}</div>
    <p class="nota">Con 2 jugadores gana quien encuentre más parejas.</p>` : ''}</div>`;
  hablar('¿Cuántos jugáis?');
  $('#p1', cont).onclick = () => iniciarParejas(cont, [nino], d, partida);
  $$('[data-id]', cont).forEach(b => b.onclick = () => {
    const otro = estado.ninos.find(n => n.id === b.dataset.id);
    const jugadores = [nino, otro];
    // Dificultad del más pequeño para que sea justo
    iniciarParejas(cont, jugadores, Math.min(...jugadores.map(j => dificultadDe(j, 'parejas'))), partida);
  });
  return { destruir() {} };
}

/** Cartas según edad y dificultad: animales iguales (peques) o número↔cantidad, sumas, multiplicaciones, palabra↔dibujo. */
function cartasPara(peque, nPares, d) {
  if (peque) return barajar(ANIMALES).slice(0, nPares).flatMap((a, i) => [{ id: i, html: a.e, clase: '', voz: a.n }, { id: i, html: a.e, clase: '', voz: a.n }]);
  const r = rangosEscolares(d), nNum = Math.ceil(nPares / 2), nAnim = nPares - nNum;
  const cartas = [], usados = new Set();
  for (let i = 0, intentos = 0; cartas.length < nNum * 2 && intentos < 300; intentos++) {
    let par;
    if (r.conDivision && i % 3 === 2) { const s = generarDivision(r); par = { valor: s.res, otra: `${s.a}÷${s.b}`, clase: 'num', voz: `${s.a} entre ${s.b}` }; }
    else if (r.tablaMax && i % 2 === 1) { const s = generarMulti(r); par = { valor: s.res, otra: `${s.a}×${s.b}`, clase: 'num', voz: `${s.a} por ${s.b}` }; }
    else if (d >= 4 && i % 2 === 1) { const n = azar(3, Math.min(r.maxTotal, 20)), a = azar(1, n - 1); par = { valor: n, otra: `${a}+${n - a}`, clase: 'num', voz: `${a} más ${n - a}` }; }
    else { const n = azar(2, Math.min(4 + d, 9)); par = { valor: n, otra: elegir(['🍎', '⭐', '🐞', '🍓']).repeat(n), clase: 'cantidad', voz: String(n) }; }
    if (usados.has(par.valor)) continue;
    usados.add(par.valor);
    cartas.push({ id: 'n' + i, html: String(par.valor), clase: 'num', voz: String(par.valor) }, { id: 'n' + i, html: par.otra, clase: par.clase, voz: par.voz });
    i++;
  }
  barajar(ANIMALES).slice(0, nAnim).forEach((a, i) => cartas.push({ id: 'a' + i, html: a.n.toUpperCase(), clase: 'palabra', voz: a.n }, { id: 'a' + i, html: a.e, clase: '', voz: a.n }));
  return cartas;
}

function iniciarParejas(cont, jugadores, d, partida) {
  const dos = jugadores.length === 2;
  const peque = jugadores.some(esPeque);
  const tabla = peque ? PAREJAS_PEQUE : PAREJAS_ESCOLAR;
  const nPares = dos ? 8 : tabla[Math.min(nivelDe(jugadores[0], 'parejas'), tabla.length) - 1];
  const cartas = barajar(cartasPara(peque, nPares, d)), colsN = COLUMNAS[cartas.length] || 4;
  const marcador = jugadores.map(() => 0);
  let turno = 0, abiertas = [], bloqueo = false, hechas = 0;
  const vistas = new Set();

  cont.innerHTML = `<div class="parejas"><div class="marcador" id="marcador"></div><div class="rejilla" id="rejilla"></div></div>`;
  const rej = $('#rejilla', cont), marc = $('#marcador', cont);
  function ajustarRejilla() {
    const rc = rej.getBoundingClientRect(), filas = Math.ceil(cartas.length / colsN);
    const ancho = Math.min((rc.width - 20 - 8 * (colsN - 1)) / colsN, ((rc.height - 20 - 8 * (filas - 1)) / filas) * .75, 130);
    rej.style.gridTemplateColumns = `repeat(${colsN}, ${Math.max(40, ancho)}px)`;
  }
  function pintarMarcador() {
    marc.innerHTML = jugadores.map((j, i) => `<span class="jug ${!dos || i === turno ? 'turno' : ''}">${escaparHTML(j.nombre)}: ${marcador[i]}</span>`).join('') +
      `<span style="margin-left:auto;font-family:var(--f-display);font-weight:800">Parejas ${hechas}/${nPares}</span>`;
  }
  cartas.forEach((c, idx) => {
    c.idx = idx;
    const b = document.createElement('button'); b.className = 'carta'; b.setAttribute('aria-label', 'Carta');
    b.innerHTML = `<div class="cartaIn"><div class="cara dorso">?</div><div class="cara frente ${c.clase}">${c.html}</div></div>`;
    b.onclick = () => voltear(b, c); c.el = b; rej.appendChild(b);
  });
  // Un fallo cuenta para el panel solo si ya se había visto la pareja de la primera carta (memoria, no suerte)
  const parejaVista = c => cartas.some(o => o !== c && o.id === c.id && vistas.has(o.idx));

  function voltear(b, c) {
    if (bloqueo || partida.terminado || b.classList.contains('vuelta')) return;
    b.classList.add('vuelta'); Sonido.pop(); hablar(c.voz); abiertas.push(c);
    if (abiertas.length < 2) return;
    bloqueo = true; const [a, x] = abiertas, quien = jugadores[turno];
    if (a.id === x.id) {
      setTimeout(() => {
        a.el.classList.add('hecha'); x.el.classList.add('hecha'); marcador[turno]++; hechas++;
        registrar('memoria', true, quien); Sonido.acierto(); mensaje(elogio()); premiar(1, quien);
        abiertas = []; bloqueo = false; pintarMarcador();
        if (hechas === nPares) finPartida();
      }, 500);
    } else {
      if (parejaVista(a)) registrar('memoria', false, quien);
      vistas.add(a.idx); vistas.add(x.idx);
      setTimeout(() => {
        a.el.classList.remove('vuelta'); x.el.classList.remove('vuelta'); abiertas = []; bloqueo = false;
        if (dos) { turno = 1 - turno; pintarMarcador(); hablar(`Turno de ${jugadores[turno].nombre}`); }
      }, 1100);
    }
  }
  function finPartida() {
    if (!dos) return setTimeout(() => partida.ganar('Has encontrado todas las parejas.'), 600);
    const [p0, p1] = marcador;
    const titulo = p0 === p1 ? '¡Empate! Los dos sois campeones' : `¡Gana ${jugadores[p0 > p1 ? 0 : 1].nombre}!`;
    setTimeout(() => partida.terminarLibre({ titulo, texto: `${jugadores[0].nombre} ${p0} · ${jugadores[1].nombre} ${p1}`, otraVez: () => iniciarParejas(cont, jugadores, d, partida) }), 600);
  }
  pintarMarcador(); ajustarRejilla(); addEventListener('resize', ajustarRejilla);
  if (dos) hablar(`Empieza ${jugadores[0].nombre}`);
}
