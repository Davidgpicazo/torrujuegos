/* =========================================================================
 * Peluquería — colores, números, letras/sílabas, contar, sumas, restas,
 * multiplicaciones y problemas de comprensión lectora
 * ========================================================================= */
const OBJETOS_SALON = [{ p: 'lazos', g: 'm' }, { p: 'horquillas', g: 'f' }, { p: 'peines', g: 'm' }, { p: 'gomas del pelo', g: 'f' }, { p: 'clientes', g: 'm' }];

/** Problema de texto adaptado a la dificultad: suma, resta, multiplicación, división o dos pasos. */
function generarProblema(nombre, d) {
  const r = rangosEscolares(d);
  const tipos = ['suma', 'resta', ...(r.tablaMax ? ['multi', 'multi'] : []), ...(r.conDosPasos ? ['dosPasos'] : []), ...(r.conDivision ? ['division', 'division'] : [])];
  const tipo = elegir(tipos);
  const o = elegir(tipo === 'multi' || tipo === 'division' ? OBJETOS_SALON.slice(0, 4) : OBJETOS_SALON);
  const cu = o.g === 'm' ? 'Cuántos' : 'Cuántas';
  if (tipo === 'suma') {
    const { a, b, res } = generarSuma(r);
    const texto = o.p === 'clientes' ? `En la peluquería hay ${a} clientes. Llegan ${b} más. ¿${cu} hay ahora?`
      : elegir([`${nombre} tiene ${a} ${o.p}. Le regalan ${b} más. ¿${cu} tiene ahora?`, `En una caja hay ${a} ${o.p} y en otra hay ${b}. ¿${cu} hay en total?`]);
    return { texto, res, max: r.maxTotal };
  }
  if (tipo === 'resta') {
    const { a, b, res } = generarResta(r);
    const texto = o.p === 'clientes' ? `En la peluquería hay ${a} clientes. Se van ${b}. ¿${cu} quedan?`
      : elegir([`${nombre} tiene ${a} ${o.p}. Pierde ${b}. ¿${cu} le quedan?`, `En el cajón hay ${a} ${o.p}. ${nombre} usa ${b}. ¿${cu} quedan?`]);
    return { texto, res, max: r.maxTotal };
  }
  if (tipo === 'multi') {
    const { a, b, res } = generarMulti(r);
    return { texto: elegir([`Hay ${a} cajas con ${b} ${o.p} en cada una. ¿${cu} ${o.p} hay en total?`, `${nombre} peina a ${a} niñas y a cada una le pone ${b} ${o.p}. ¿${cu} ${o.p} usa?`]), res, max: res + 12 };
  }
  if (tipo === 'division') {
    const { a, b, res } = generarDivision(r);
    return { texto: `${nombre} reparte ${a} ${o.p} entre ${b} amigas, a partes iguales. ¿${cu} le da a cada una?`, res, max: Math.max(12, res + 6) };
  }
  // Dos pasos: suma y luego resta
  const a = azar(3, Math.min(r.maxTotal, 15)), b = azar(1, Math.min(r.maxSumando, 9)), c = azar(1, a + b - 1);
  return { texto: `${nombre} tiene ${a} ${o.p}. Le regalan ${b} y después pierde ${c}. ¿${cu} tiene ahora?`, res: a + b - c, max: a + b + 3 };
}

function crearPeluqueria(cont, nino, d, partida) {
  const peque = esPeque(nino), r = rangosEscolares(d);
  // Dificultad
  const N = Math.min((peque ? 5 : 7) + d, 10);                  // mechones
  const maxNumPeque = Math.min(2 + d, 9);                       // contar / reconocer número
  const maxLazos = Math.min(r.maxTotal, 20);                    // lazos que caben en pantalla
  const nBotes = Math.min(3 + d, 7);
  const tipos = peque ? barajar(['color', 'cortar', 'lazos', 'cortar', 'lazos'])
    : d < 5 ? ['color', ...barajar(['cortar', 'lazos', 'resta', 'problema', 'problema', ...(d >= 3 ? ['problema'] : [])])]
      : barajar(['cortar', 'lazos', 'resta', 'problema', 'problema', 'problema', 'problema']);
  const RONDAS = tipos.length;

  cont.innerHTML = `<div class="salon">
    <div class="tarea"><button class="btnVoz" aria-label="Repetir">🔊</button><div class="txt" id="salonTarea"></div></div>
    <div class="salonEscena"><svg viewBox="0 0 300 330" id="salonSvg" aria-label="Cliente de la peluquería"></svg></div>
    <div class="salonHerr" id="salonHerr"></div></div>`;
  const svg = $('#salonSvg', cont), herr = $('#salonHerr', cont), tareaEl = $('#salonTarea', cont);
  const NS = 'http://www.w3.org/2000/svg';
  let colorPelo = '#7A4A2A', ronda = 0, tarea = null, lazos = [], timers = [];
  const LETRAS = (nino.nombre.toUpperCase().normalize('NFD').replace(/[^A-ZÑ]/g, '') + 'MPSLTANE').split('');

  svg.innerHTML = `
    <ellipse cx="150" cy="170" rx="140" ry="155" fill="#fff" stroke="#1D2142" stroke-width="4" opacity=".7"/>
    <g id="mechones"></g>
    <rect x="125" y="240" width="50" height="50" fill="#F2BC92" stroke="#1D2142" stroke-width="3"/>
    <path d="M70 330 Q75 280 150 282 Q225 280 230 330Z" fill="#7A5CFA" stroke="#1D2142" stroke-width="3"/>
    <circle cx="150" cy="170" r="80" fill="#F6C9A0" stroke="#1D2142" stroke-width="4"/>
    <path id="flequillo" d="M68 168 Q62 82 150 80 Q238 82 232 168 Q222 116 150 114 Q78 116 68 168Z" stroke="#1D2142" stroke-width="4"/>
    <circle cx="122" cy="178" r="9" fill="#1D2142"/><circle cx="178" cy="178" r="9" fill="#1D2142"/>
    <circle cx="125" cy="175" r="3" fill="#fff"/><circle cx="181" cy="175" r="3" fill="#fff"/>
    <circle cx="105" cy="205" r="11" fill="#FF9A9A" opacity=".6"/><circle cx="195" cy="205" r="11" fill="#FF9A9A" opacity=".6"/>
    <path d="M128 210 Q150 232 172 210" fill="none" stroke="#1D2142" stroke-width="5" stroke-linecap="round"/>
    <g id="lazos"></g>`;
  const gMech = $('#mechones', svg), gLazos = $('#lazos', svg), flequillo = $('#flequillo', svg);

  function pintarPelo() { flequillo.setAttribute('fill', colorPelo); $$('.pelo', svg).forEach(x => x.setAttribute('fill', colorPelo)); }
  function temblar(el) { el.classList.remove('temblar'); void (el.getBBox ? el.getBBox() : el.offsetWidth); el.classList.add('temblar'); }
  function fallo(textoVoz) {
    if (partida.terminado || !tarea) return;
    registrar(tarea.habilidad, false, nino);
    partida.vidas.perder(); if (partida.vidas.valor > 0) hablar(textoVoz);
  }

  function dibujarMechones(etiquetas) {
    gMech.innerHTML = '';
    for (let i = 0; i < N; i++) {
      const th = (200 + (140 / (N - 1)) * i) * Math.PI / 180, giro = th * 180 / Math.PI + 90;
      const x = 150 + 74 * Math.cos(th), y = 170 + 74 * Math.sin(th), L = 78;
      const et = etiquetas ? String(etiquetas[i]) : '';
      const g = document.createElementNS(NS, 'g');
      g.setAttribute('transform', `translate(${x} ${y}) rotate(${giro})`);
      g.classList.add('mechon'); g.dataset.i = i;
      g.innerHTML = `<g class="inner"><rect class="pelo" x="-14" y="${-L}" width="28" height="${L + 10}" rx="14" fill="${colorPelo}" stroke="#1D2142" stroke-width="3"/>
        ${etiquetas ? `<g class="etq"><circle cx="0" cy="${-L + 18}" r="15" fill="#fff" stroke="#1D2142" stroke-width="2.5"/>
        <text x="0" y="${-L + 18}" dy="${et.length > 1 ? 6 : 7}" text-anchor="middle" font-family="Baloo 2, sans-serif" font-weight="800" font-size="${et.length > 1 ? 15 : 20}" fill="#1D2142" transform="rotate(${-giro} 0 ${-L + 18})">${et}</text></g>` : ''}</g>`;
      gMech.appendChild(g);
    }
  }

  function ponerTarea(texto, voz) { tareaEl.textContent = texto; tareaEl.classList.toggle('larga', texto.length > 36); hablar(voz || texto); }
  $('.btnVoz', cont).onclick = () => tarea && hablar(tarea.voz);

  function siguienteRonda() {
    if (partida.terminado) return;
    if (ronda >= RONDAS) return partida.ganar('¡Qué peinado más chulo!');
    gLazos.innerHTML = ''; lazos = []; herr.innerHTML = '';
    ({ color: tareaColor, cortar: tareaCortar, lazos: tareaLazos, resta: tareaResta, problema: tareaProblema })[tipos[ronda]]();
  }
  function rondaSuperada() {
    registrar(tarea.habilidad, true, nino);
    Sonido.acierto(); mensaje(elogio()); premiar(1, nino); ronda++; tarea = null;
    timers.push(setTimeout(siguienteRonda, 1300));
  }

  function tareaColor() {
    dibujarMechones(null);
    const opciones = barajar(COLORES).slice(0, nBotes);
    const obj = elegir(opciones.filter(c => c.hex !== colorPelo));
    tarea = { tipo: 'color', habilidad: 'colores', voz: `Pinta el pelo de color ${obj.nombre}` };
    ponerTarea(`Pinta el pelo de color ${obj.nombre.toUpperCase()}`, tarea.voz);
    if (!peque) setTimeout(() => hablar(obj.en, 'en-GB', false), 50);
    opciones.forEach(c => {
      const b = document.createElement('button'); b.className = 'bote'; b.style.background = c.hex; b.setAttribute('aria-label', c.nombre);
      b.onclick = () => {
        if (!tarea || tarea.tipo !== 'color' || partida.terminado) return;
        if (c.id === obj.id) { colorPelo = c.hex; pintarPelo(); rondaSuperada(); }
        else { temblar(b); fallo(`Ese es el ${c.nombre}. Busca el ${obj.nombre}.`); }
      };
      herr.appendChild(b);
    });
  }

  /** Qué hay que cortar según edad y dificultad: números, letras, sílabas o la tabla de multiplicar. */
  function objetivoCorte() {
    if (peque) {
      const max = Math.max(3, maxNumPeque), obj = String(azar(1, max));
      return { habilidad: 'numeros', obj, correctos: [obj], distractores: Array.from({ length: max }, (_, i) => String(i + 1)).filter(x => x !== obj), texto: `Corta los mechones con el número ${obj}`, decir: et => `Ese es el ${et}. Busca el ${obj}.` };
    }
    if (d >= 7) {
      const t = azar(2, r.tablaMax), multiplos = barajar(Array.from({ length: 10 }, (_, i) => String(t * (i + 1))));
      const otros = Array.from({ length: t * 10 }, (_, i) => i + 1).filter(v => v % t).map(String);
      return { habilidad: 'multiplicacion', obj: null, correctos: multiplos, distractores: otros, texto: `Corta los resultados de la tabla del ${t}`, decir: et => `${et} no está en la tabla del ${t}.` };
    }
    if (d >= 5) {
      const obj = elegir(SILABAS), parecidas = SILABAS.filter(s => s !== obj && (s[0] === obj[0] || s[1] === obj[1]));
      return { habilidad: 'silabas', obj, correctos: [obj], distractores: parecidas, texto: `Corta los mechones con la sílaba ${obj}`, decir: et => `Esa es ${et}. Busca ${obj}.` };
    }
    const obj = elegir(LETRAS.slice(0, 4));
    return { habilidad: 'letras', obj, correctos: [obj], distractores: [...new Set(LETRAS.concat(['P', 'R', 'O', 'U', 'B', 'D', 'C']))].filter(x => x !== obj), texto: `Corta los mechones con la letra ${obj}`, decir: et => `Esa es la ${et}. Busca la ${obj}.` };
  }

  function tareaCortar() {
    const o = objetivoCorte(), nCorrectos = peque ? 2 : (d >= 3 ? 3 : 2);
    const buenos = Array.from({ length: nCorrectos }, (_, i) => o.correctos[i % o.correctos.length]);
    const etiquetas = barajar([...buenos, ...Array.from({ length: N - nCorrectos }, () => elegir(o.distractores))]);
    const esCorrecta = et => o.correctos.includes(et);
    let pendientes = etiquetas.filter(esCorrecta).length;
    dibujarMechones(etiquetas);
    tarea = { tipo: 'cortar', habilidad: o.habilidad, voz: o.texto };
    ponerTarea(`✂️ ${o.texto}`, o.texto);
    herr.innerHTML = `<span class="contadorLazos">✂️ Toca el mechón para cortarlo</span>`;
    $$('.mechon', gMech).forEach(g => g.onclick = () => {
      if (!tarea || tarea.tipo !== 'cortar' || g.dataset.cortado || partida.terminado) return;
      const et = etiquetas[+g.dataset.i];
      if (esCorrecta(et)) {
        g.dataset.cortado = '1'; Sonido.corte();
        const rect = $('rect', g); rect.setAttribute('y', -28); rect.setAttribute('height', 38); $('.etq', g)?.remove();
        if (--pendientes === 0) rondaSuperada();
      } else { temblar($('.inner', g)); fallo(o.decir(et)); }
    });
  }

  function tareaLazos() {
    dibujarMechones(null);
    let n, texto, voz, habilidad;
    if (peque) { n = azar(1, maxNumPeque); habilidad = 'contar'; texto = `🎀 Pon ${n} ${n === 1 ? 'lazo' : 'lazos'}`; voz = `Pon ${n} ${n === 1 ? 'lazo' : 'lazos'} en el pelo`; }
    else { const s = generarSuma({ ...r, maxTotal: maxLazos, maxSumando: Math.min(r.maxSumando, 10) }); n = s.res; habilidad = 'suma'; texto = `🎀 Pon ${s.a} + ${s.b} lazos`; voz = `Pon ${s.a} más ${s.b} lazos en el pelo`; }
    tarea = { tipo: 'lazos', habilidad, voz };
    ponerTarea(texto, voz);
    herramientasLazos(n, c => `Tienes ${c}. Necesitas ${n}.`);
  }

  function tareaResta() {
    dibujarMechones(null);
    const s = generarResta({ ...r, maxTotal: maxLazos, maxSumando: Math.min(r.maxSumando, 10) }), a = s.a, b = s.b;
    tarea = { tipo: 'lazos', habilidad: 'resta', voz: `Hay ${a} lazos. Quita ${b}. ¿Cuántos quedan?` };
    ponerTarea(`🎀 Hay ${a} lazos. Toca ${b} para quitarlos.`, tarea.voz);
    for (let i = 0; i < a; i++) {
      const anillo = i % 2 && a > 10 ? 118 : 96;
      const th = (205 + (130 / Math.max(1, a - 1)) * i) * Math.PI / 180;
      añadirLazo(150 + anillo * Math.cos(th), 170 + anillo * Math.sin(th));
    }
    herramientasLazos(s.res, c => `Quedan ${c}. Tienen que quedar ${a} menos ${b}.`);
    actualizarLazos();
  }

  function herramientasLazos(n, textoFallo) {
    herr.innerHTML = `<span class="contadorLazos">🎀 × <span id="nLazos">0</span></span><button class="btn primario" id="btnListo">¡Listo!</button>`;
    $('#btnListo', herr).onclick = () => {
      if (!tarea || tarea.tipo !== 'lazos' || partida.terminado) return;
      if (lazos.length === n) rondaSuperada();
      else { mensaje(`Hay ${lazos.length}`, true); fallo(textoFallo(lazos.length)); }
    };
  }
  function actualizarLazos() { const e = $('#nLazos', herr); if (e) e.textContent = lazos.length; }
  function añadirLazo(x, y) {
    const t = document.createElementNS(NS, 'text');
    t.setAttribute('x', x); t.setAttribute('y', y + 12); t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', '32');
    t.classList.add('lazo'); t.style.cursor = 'pointer'; t.textContent = '🎀';
    gLazos.appendChild(t); lazos.push(t);
  }

  function tareaProblema() {
    dibujarMechones(null);
    const p = generarProblema(nino.nombre, d);
    tarea = { tipo: 'problema', habilidad: 'lectura', voz: p.texto };
    ponerTarea('📖 ' + p.texto, p.texto);
    herr.innerHTML = `<div class="respuestas"></div>`;
    opcionesNumericas(p.res, 3, 0, p.max + 3).sort((x, y) => x - y).forEach(v => {
      const bt = document.createElement('button'); bt.className = 'btn respuesta'; bt.textContent = v;
      bt.onclick = () => {
        if (!tarea || tarea.tipo !== 'problema' || partida.terminado) return;
        if (v === p.res) rondaSuperada();
        else { temblar(bt); fallo('Casi. Vamos a leerlo otra vez despacito.'); setTimeout(() => partida.vidas.valor > 0 && hablar(p.texto, 'es-ES', false), 100); }
      };
      $('.respuestas', herr).appendChild(bt);
    });
  }

  svg.addEventListener('click', e => {
    if (!tarea || tarea.tipo !== 'lazos' || partida.terminado) return;
    if (e.target.classList.contains('lazo')) { e.target.remove(); lazos = lazos.filter(l => l !== e.target); Sonido.pop(); actualizarLazos(); return; }
    if (lazos.length >= 20) return;
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    añadirLazo(p.x, p.y); Sonido.pop(); actualizarLazos();
    if (peque) hablar(String(lazos.length));
  });

  pintarPelo(); siguienteRonda();
  return { destruir() { timers.forEach(clearTimeout); } };
}
