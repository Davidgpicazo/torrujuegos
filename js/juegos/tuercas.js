/* =========================================================================
 * Tuercas — ordenar por colores (lógica y planificación). Sin vidas.
 * ========================================================================= */
function crearTuercas(cont, nino, d, partida) {
  const peque = esPeque(nino);
  // Dificultad: más colores y tornillos más altos
  const nColores = Math.min((peque ? 2 : 3) + d, peque ? 6 : 7);
  const cap = peque ? (d >= 4 ? 4 : 3) : (d >= 4 ? 5 : 4);
  const vacios = 2;
  cont.innerHTML = `<div class="tuercas">
    <div class="tarea"><button class="btnVoz" aria-label="Repetir">🔊</button><div class="txt">Pon cada color en su tornillo</div></div>
    <div class="tornillos" id="tornillos"></div>
    <div class="botonera"><button class="btn pequeno" id="btnDeshacer">↶ Deshacer</button><button class="btn pequeno" id="btnNuevo">↻ Empezar de nuevo</button></div></div>`;
  const zona = $('#tornillos', cont), cols = COLORES.slice(0, nColores);
  let pilas, inicial, sel = null, historial = [];
  const completos = new Set();

  function generar() {
    let tuercas;
    do { tuercas = barajar(cols.flatMap(c => Array(cap).fill(c.id))); }
    while (Array.from({ length: nColores }, (_, i) => tuercas.slice(i * cap, i * cap + cap)).some(p => p.every(x => x === p[0])));
    pilas = Array.from({ length: nColores }, (_, i) => tuercas.slice(i * cap, i * cap + cap));
    for (let i = 0; i < vacios; i++) pilas.push([]);
    inicial = pilas.map(x => [...x]);
  }
  const esCompleto = p => p.length === cap && p.every(x => x === p[0]);
  const color = id => COLORES.find(c => c.id === id);

  function pintar() {
    zona.innerHTML = '';
    pilas.forEach((p, i) => {
      const t = document.createElement('button'); t.className = 'tornillo'; t.style.height = `${cap * 33 + 60}px`;
      t.setAttribute('aria-label', `Tornillo ${i + 1}`);
      if (sel === i) t.classList.add('sel'); if (esCompleto(p)) t.classList.add('completo');
      p.forEach((id, j) => { const n = document.createElement('div'); n.className = 'tuerca'; n.style.background = color(id).hex; if (sel === i && j === p.length - 1) n.classList.add('arriba'); t.appendChild(n); });
      t.onclick = () => tocar(i, t);
      zona.appendChild(t);
    });
  }
  function decirColor(id) { const c = color(id); hablar(c.nombre); if (!peque) hablar(c.en, 'en-GB', false); }

  function tocar(i, el) {
    if (partida.terminado) return;
    const p = pilas[i];
    if (sel === null) { if (!p.length || esCompleto(p)) return; sel = i; Sonido.pop(); decirColor(p[p.length - 1]); return pintar(); }
    if (sel === i) { sel = null; return pintar(); }
    const origen = pilas[sel], tuerca = origen[origen.length - 1];
    if (p.length < cap && (!p.length || p[p.length - 1] === tuerca)) {
      historial.push(pilas.map(x => [...x])); p.push(origen.pop()); sel = null; Sonido.pop();
      if (esCompleto(p) && !completos.has(i)) { completos.add(i); registrar('logica', true, nino); Sonido.acierto(); premiar(1, nino); mensaje(elogio()); }
      pintar(); comprobar();
    } else {
      registrar('logica', false, nino); Sonido.fallo();
      el.classList.remove('temblar'); void el.offsetWidth; el.classList.add('temblar'); sel = null;
      hablar(p.length >= cap ? 'Ese tornillo está lleno' : 'Ahí no. Tiene que ser del mismo color o un tornillo vacío.');
      setTimeout(pintar, 350);
    }
  }
  function comprobar() {
    if (pilas.every(p => !p.length || esCompleto(p))) setTimeout(() => partida.ganar('Todos los colores están en su sitio.'), 500);
  }

  $('#btnDeshacer', cont).onclick = () => { if (historial.length && !partida.terminado) { pilas = historial.pop(); sel = null; pintar(); } };
  $('#btnNuevo', cont).onclick = () => { if (partida.terminado) return; pilas = inicial.map(x => [...x]); historial = []; sel = null; pintar(); };
  $('.btnVoz', cont).onclick = () => hablar('Toca un tornillo para coger la tuerca de arriba. Luego toca otro tornillo con el mismo color arriba, o uno vacío.');
  generar(); pintar(); hablar('Pon cada color en su tornillo');
  return { destruir() {} };
}
