/* =========================================================================
 * Misiones — retos fuera de la pantalla: deporte en casa, búsqueda y un
 * reto especial al final que cambia en cada nivel. No gastan tiempo.
 * ========================================================================= */
const ORDENES_SIMON = ['Manos arriba', 'Toca tu nariz', 'Salta dos veces', 'Toca el suelo', 'Da una vuelta', 'Toca tus rodillas',
  'Pon las manos en la cabeza', 'Aplaude tres veces', 'Ponte a la pata coja', 'Toca tus orejas', 'Agáchate como una bola', 'Estira los brazos como un avión'];

function catalogoMisiones(peque, d) {
  const reps = Math.min((peque ? 3 : 5) + (d - 1) * 2, peque ? 12 : 20);
  const segs = Math.min((peque ? 5 : 8) + (d - 1) * 2, 30);
  const ritmo = peque ? 1.4 : 1.1;
  const color = elegir(COLORES), letra = elegir(['M', 'P', 'S', 'C', 'L', 'T']), cuantas = Math.min(1 + d, 6);
  const corto = Math.min(reps, 10);

  const deporte = [
    { id: 'saltos', tipo: 'contar', ico: '🦘', titulo: `Da ${reps} saltos`, sub: 'Salta con los pies juntos. ¡Yo cuento contigo!', n: reps, ritmo },
    { id: 'sentadillas', tipo: 'contar', ico: '🏋️', titulo: `Haz ${reps} sentadillas`, sub: 'Baja como si te sentaras en una silla y sube.', n: reps, ritmo: ritmo + .5 },
    { id: 'techo', tipo: 'contar', ico: '🙌', titulo: `Toca el techo ${reps} veces`, sub: 'Estírate hacia arriba todo lo que puedas.', n: reps, ritmo },
    { id: 'estrella', tipo: 'contar', ico: '⭐', titulo: `Haz ${reps} saltos de estrella`, sub: 'Abre brazos y piernas al saltar, y ciérralos.', n: reps, ritmo: ritmo + .2 },
    { id: 'rodillas', tipo: 'contar', ico: '🦵', titulo: `Sube las rodillas ${reps} veces`, sub: 'Toca cada rodilla con la mano contraria.', n: reps, ritmo },
    { id: 'puntillas', tipo: 'contar', ico: '🩰', titulo: `Ponte de puntillas ${reps} veces`, sub: 'Sube despacio y baja despacio.', n: reps, ritmo: ritmo + .3 },
    { id: 'boxeo', tipo: 'contar', ico: '🥊', titulo: `Da ${reps * 2} puñetazos al aire`, sub: 'Rápidos y sin tocar a nadie.', n: reps * 2, ritmo: .7 },
    { id: 'comba', tipo: 'contar', ico: '🪢', titulo: `Salta ${reps} veces a la comba imaginaria`, sub: 'Mueve las manos como si tuvieras una cuerda.', n: reps, ritmo },
    { id: 'patacoja', tipo: 'tiempo', ico: '🦩', titulo: `Aguanta a la pata coja ${segs} segundos`, sub: 'Como un flamenco. Si te caes, vuelve a subir el pie.', s: segs },
    { id: 'oso', tipo: 'tiempo', ico: '🐻', titulo: `Anda como un oso ${segs} segundos`, sub: 'Manos y pies en el suelo, con el culete arriba.', s: segs },
    { id: 'rana', tipo: 'tiempo', ico: '🐸', titulo: `Salta como una rana ${segs} segundos`, sub: 'Agáchate y salta hacia delante.', s: segs },
    { id: 'correr', tipo: 'tiempo', ico: '🏃', titulo: `Corre sin moverte ${segs} segundos`, sub: 'Levanta mucho las rodillas.', s: segs },
    { id: 'cangrejo', tipo: 'tiempo', ico: '🦀', titulo: `Anda como un cangrejo ${segs} segundos`, sub: 'Boca arriba, apoyando manos y pies.', s: segs },
    { id: 'libro', tipo: 'tiempo', ico: '📚', titulo: `Camina con un libro en la cabeza ${segs} segundos`, sub: 'Un libro blandito. ¡Que no se caiga!', s: segs },
    ...(peque ? [] : [{ id: 'plancha', tipo: 'tiempo', ico: '🧱', titulo: `Haz la plancha ${Math.min(segs, 20)} segundos`, sub: 'Apoyado en codos y puntas de los pies, recto como una tabla.', s: Math.min(segs, 20) }])
  ];
  const busqueda = peque ? [
    { id: 'color', tipo: 'libre', ico: '🔎', titulo: `Trae algo de color ${color.nombre}`, sub: 'Búscalo por casa y enséñaselo a un mayor.' },
    { id: 'redondo', tipo: 'libre', ico: '⚪', titulo: 'Busca algo redondo', sub: 'Una pelota, un plato, un botón…' },
    { id: 'cuadrado', tipo: 'libre', ico: '🟦', titulo: 'Busca algo cuadrado', sub: 'Un cojín, una caja, un libro…' },
    { id: 'juguetes', tipo: 'libre', ico: '🧸', titulo: `Trae ${cuantas} ${cuantas === 1 ? 'juguete' : 'juguetes'}`, sub: 'Cuéntalos en voz alta al dejarlos.' },
    { id: 'blando', tipo: 'libre', ico: '🛏️', titulo: 'Trae algo blando y algo duro', sub: 'Un cojín y una cuchara, por ejemplo.' },
    { id: 'ruido', tipo: 'libre', ico: '🔔', titulo: 'Trae algo que haga ruido', sub: 'Hazlo sonar para un mayor.' },
    { id: 'pequeno', tipo: 'libre', ico: '🐜', titulo: 'Trae algo más pequeño que tu mano', sub: 'Ponlo encima de tu mano para comprobarlo.' }
  ] : [
    { id: 'letra', tipo: 'libre', ico: '🔎', titulo: `Trae algo que empiece por ${letra}`, sub: `Piensa palabras que empiecen por ${letra} y busca una cosa.` },
    { id: 'colorN', tipo: 'libre', ico: '🎨', titulo: `Trae ${cuantas} cosas de color ${color.nombre}`, sub: 'Ponlas en fila y cuéntalas.' },
    { id: 'tamano', tipo: 'libre', ico: '📏', titulo: 'Busca algo más grande que tu mano y algo más pequeño', sub: 'Compáralos con tu mano.' },
    { id: 'cocina', tipo: 'libre', ico: '🥄', titulo: 'Busca 3 cosas que se usen en la cocina', sub: 'Pide permiso a un mayor y nada que corte.' },
    { id: 'tacto', tipo: 'libre', ico: '✋', titulo: 'Trae algo suave, algo rugoso y algo frío', sub: 'Tócalos con los ojos cerrados.' },
    { id: 'ventanas', tipo: 'libre', ico: '🪟', titulo: 'Cuenta las ventanas de casa', sub: 'Dile el número a un mayor.' },
    { id: 'ordenar', tipo: 'libre', ico: '📶', titulo: 'Ordena 5 cosas de la más pequeña a la más grande', sub: 'Pueden ser juguetes, lápices o zapatos.' }
  ];
  // Reto especial del final: uno distinto en cada nivel (rotan en este orden)
  const especiales = [
    { id: 'estatuas', tipo: 'estatuas', ico: '💃', titulo: 'Baila y… ¡estatua!', sub: 'Baila con la música. Cuando pare, ¡quieto como una estatua!', rondas: Math.min(2 + Math.floor(d / 4), 3) },
    { id: 'simon', tipo: 'secuencia', ico: '🗣️', titulo: 'Simón dice', sub: 'Haz lo que diga la voz, ¡rápido!', prefijo: 'Simón dice: ', pasos: barajar(ORDENES_SIMON).slice(0, peque ? 5 : 7), seg: peque ? 4 : 3 },
    { id: 'calcetines', tipo: 'libre', ico: '🧦', titulo: 'Mete 5 calcetines en una caja', sub: 'Haz bolas con calcetines y lánzalas desde 2 pasos. Si fallas, ¡otra vez!' },
    { id: 'yoga', tipo: 'secuencia', ico: '🧘', titulo: 'Yoga de animales', sub: 'Imita cada postura y aguanta.', prefijo: '', seg: peque ? 6 : 8,
      pasos: ['Postura del árbol: un pie apoyado en la otra pierna', 'Postura del gato: a cuatro patas con la espalda redonda', 'Postura del perro: manos y pies en el suelo, culete arriba', 'Postura de la cobra: tumbado boca abajo, levanta el pecho', 'Postura de la mariposa: sentado, junta las plantas de los pies'] },
    { id: 'espejo', tipo: 'libre', ico: '🪞', titulo: 'El espejo', sub: 'Ponte frente a un mayor e imita todo lo que haga. ¡Luego cambiáis!' },
    { id: 'circuito', tipo: 'secuencia', ico: '🏁', titulo: 'Circuito de campeones', sub: 'Una prueba detrás de otra, sin parar.', prefijo: '', seg: peque ? 10 : 12,
      pasos: [`${corto} saltos`, `${corto} sentadillas`, 'A la pata coja', 'Corre sin moverte', 'Anda como un oso'] },
    { id: 'bolos', tipo: 'libre', ico: '🎳', titulo: 'Bolos caseros', sub: 'Pon 6 botellas de plástico y derríbalas con una pelota. ¿Cuántas tiras?' },
    { id: 'lava', tipo: 'libre', ico: '🌋', titulo: '¡El suelo es lava!', sub: 'Pon cojines en el suelo y cruza la habitación sin pisar el suelo.' },
    { id: 'adivina', tipo: 'libre', ico: '🐒', titulo: 'Adivina el animal', sub: 'Imita un animal sin hablar y que un mayor lo adivine.' },
    { id: 'obstaculos', tipo: 'libre', ico: '🛋️', titulo: 'Carrera de obstáculos', sub: 'Con cojines y sillas, monta un camino: pasa por debajo, salta y rodea.' },
    { id: 'torre', tipo: 'libre', ico: '🗼', titulo: 'La torre más alta', sub: 'Haz una torre con vasos de plástico o bloques. ¿Cuántos pisos aguanta?' },
    { id: 'nombreAire', tipo: 'libre', ico: '☁️', titulo: peque ? 'Haz una estrella con tu cuerpo' : 'Escribe tu nombre en el aire', sub: peque ? 'Abre brazos y piernas todo lo que puedas.' : 'Con el dedo, letra a letra y bien grande.' }
  ];
  deporte.forEach(m => m.cat = 'deporte'); busqueda.forEach(m => m.cat = 'busqueda'); especiales.forEach(m => m.cat = 'especiales');
  return { deporte, busqueda, especiales };
}

/** Misiones de un nivel: deporte y búsqueda sin repetir las recientes + el especial del nivel al final. */
function generarMisiones(nino, d, nivel) {
  const cat = catalogoMisiones(esPeque(nino), d);
  const usadas = new Set(nino.misionesRecientes || []);
  const nueva = lista => { const libres = lista.filter(m => !usadas.has(m.id)); const m = elegir(libres.length ? libres : lista); usadas.add(m.id); return m; };
  const total = Math.min(3 + Math.floor((nivel - 1) / 2), 5);
  const lista = ['deporte', 'busqueda', 'deporte', 'busqueda'].slice(0, total - 1).map(c => nueva(cat[c]));
  if (d >= 4 && lista.length >= 3) {
    const a = Math.ceil(Math.min(lista[0].n || 10, 12) / 2) + 2, b = a - 1;
    lista[2] = { id: 'combo', cat: 'deporte', tipo: 'contar', ico: '🔥', titulo: `${a} saltos + ${b} sentadillas`, sub: 'Primero los saltos y luego las sentadillas.', n: a + b, ritmo: esPeque(nino) ? 1.6 : 1.3 };
  }
  lista.push(cat.especiales[(nivel - 1) % cat.especiales.length]);
  return lista;
}

function crearMisiones(cont, nino, d, partida) {
  const nivel = partida.nivel;
  const misiones = generarMisiones(nino, d, nivel);
  let actual = 0, timers = [], intervalos = [], wakeLock = null;
  const limpiar = () => { timers.forEach(clearTimeout); intervalos.forEach(clearInterval); timers = []; intervalos = []; };
  try { navigator.wakeLock?.request('screen').then(w => wakeLock = w).catch(() => {}); } catch (e) {}

  cont.innerHTML = `<div class="mision">
    <div class="tarea"><button class="btnVoz" aria-label="Repetir">🔊</button><div class="txt" id="misionNum"></div><div class="misionPasos" id="misionPasos"></div></div>
    <div class="misionCuerpo"><span class="etiquetaEspecial" id="misionEspecial" hidden>⭐ Reto especial del nivel</span><div class="misionIco" id="misionIco"></div><h2 class="misionTitulo" id="misionTitulo"></h2><p class="misionSub" id="misionSub"></p><div class="contadorGrande" id="contador"></div></div>
    <div class="botonera" id="misionBotones"></div></div>`;
  const ico = $('#misionIco', cont), titulo = $('#misionTitulo', cont), sub = $('#misionSub', cont), contador = $('#contador', cont), botones = $('#misionBotones', cont);
  $('.btnVoz', cont).onclick = () => { const m = misiones[actual]; m && hablar(`${m.titulo}. ${m.sub}`); };

  function pintarPasos() {
    $('#misionNum', cont).textContent = `Misión ${Math.min(actual + 1, misiones.length)} de ${misiones.length}`;
    $('#misionPasos', cont).innerHTML = misiones.map((_, i) => `<span class="${i < actual ? 'hecho' : i === actual ? 'actual' : ''}"></span>`).join('');
  }
  function boton(texto, clase, accion) { const b = document.createElement('button'); b.className = `btn ${clase}`; b.textContent = texto; b.onclick = accion; botones.appendChild(b); return b; }

  function mostrarMision() {
    limpiar(); pintarPasos();
    const m = misiones[actual];
    $('#misionEspecial', cont).hidden = m.cat !== 'especiales';
    ico.textContent = m.ico; titulo.textContent = m.titulo; sub.textContent = m.sub; contador.textContent = '';
    hablar(`${m.cat === 'especiales' ? 'Reto especial. ' : ''}${m.titulo}. ${m.sub}`);
    botones.innerHTML = '';
    if (m.tipo === 'libre') return botonHecho(true);
    boton('▶ ¡Empezar!', 'primario', () => cuentaAtras(() => ({ contar: ejercicioContar, tiempo: ejercicioTiempo, estatuas: ejercicioEstatuas, secuencia: ejercicioSecuencia })[m.tipo](m)));
    boton('↻ Otra misión', 'pequeno', cambiarMision);
  }

  function cambiarMision() {
    const m = misiones[actual], cat = catalogoMisiones(esPeque(nino), d)[m.cat] || [];
    const opciones = cat.filter(x => x.id !== m.id && !misiones.some(y => y.id === x.id));
    if (opciones.length) { misiones[actual] = elegir(opciones); mostrarMision(); }
  }
  function cuentaAtras(alTerminar) {
    botones.innerHTML = '';
    let n = 3; contador.textContent = n; hablar('Tres');
    const id = setInterval(() => {
      n--;
      if (n > 0) { contador.textContent = n; Sonido.tic(); hablar(n === 2 ? 'Dos' : 'Uno'); }
      else { clearInterval(id); contador.textContent = '¡Ya!'; hablar('¡Ya!'); timers.push(setTimeout(alTerminar, 600)); }
    }, 1000);
    intervalos.push(id);
  }
  function ejercicioContar(m) {
    let i = 0; contador.textContent = '0';
    const id = setInterval(() => {
      i++; contador.textContent = i; Sonido.tic(); hablar(String(i));
      if (i >= m.n) { clearInterval(id); timers.push(setTimeout(() => { hablar('¡Muy bien!'); botonHecho(); }, 700)); }
    }, m.ritmo * 1000);
    intervalos.push(id);
  }
  function ejercicioTiempo(m) {
    let t = m.s; contador.textContent = t;
    const id = setInterval(() => {
      t--; contador.textContent = Math.max(t, 0); Sonido.tic();
      if (t <= 5 && t > 0) hablar(String(t));
      if (t <= 0) { clearInterval(id); hablar('¡Tiempo! ¡Muy bien!'); botonHecho(); }
    }, 1000);
    intervalos.push(id);
  }
  /** Varias órdenes seguidas (Simón dice, yoga, circuito) con cuenta atrás en cada una. */
  function ejercicioSecuencia(m) {
    let paso = 0;
    const siguiente = () => {
      if (paso >= m.pasos.length) { contador.textContent = '🎉'; sub.textContent = '¡Lo has hecho todo!'; hablar('¡Genial!'); botonHecho(); return; }
      const texto = m.pasos[paso++]; let t = m.seg;
      sub.textContent = `${paso}/${m.pasos.length} · ${texto}`; contador.textContent = t; hablar(m.prefijo + texto);
      const id = setInterval(() => {
        t--; contador.textContent = Math.max(t, 0);
        if (t <= 0) { clearInterval(id); Sonido.tic(); timers.push(setTimeout(siguiente, 400)); }
      }, 1000);
      intervalos.push(id);
    };
    siguiente();
  }
  function ejercicioEstatuas(m) {
    const NOTAS = [523, 587, 659, 784, 880];
    let ronda = 0;
    const bailar = () => {
      ronda++; contador.textContent = '💃'; sub.textContent = `¡A bailar! Ronda ${ronda} de ${m.rondas}`;
      const musica = setInterval(() => Sonido.tono(elegir(NOTAS), .18, 'triangle', .12), 260);
      intervalos.push(musica);
      timers.push(setTimeout(() => {
        clearInterval(musica); Sonido.silbato(); contador.textContent = '🗿'; sub.textContent = '¡ESTATUA! No te muevas…'; hablar('¡Estatua!');
        timers.push(setTimeout(() => { if (ronda < m.rondas) bailar(); else { contador.textContent = '🎉'; sub.textContent = '¡Eres una estatua de campeonato!'; hablar('¡Genial!'); botonHecho(); } }, 3500));
      }, azar(3000, 6000)));
    };
    bailar();
  }

  // Confirmación: mantener pulsado 2 segundos (se confía en el niño)
  function botonHecho(conCambio = false) {
    botones.innerHTML = '';
    const b = document.createElement('button'); b.className = 'btn btnMantener';
    b.innerHTML = '<div class="relleno"></div><span>Mantén pulsado: ¡Hecho!</span>';
    const relleno = $('.relleno', b); let inicio = null, raf = null;
    const paso = t => {
      if (inicio === null) inicio = t;
      const p = Math.min(1, (t - inicio) / 2000); relleno.style.width = `${p * 100}%`;
      if (p >= 1) { cancelar(); misionHecha(); } else raf = requestAnimationFrame(paso);
    };
    const empezar = e => { e.preventDefault(); inicio = null; raf = requestAnimationFrame(paso); };
    const cancelar = () => { cancelAnimationFrame(raf); relleno.style.width = '0'; };
    b.addEventListener('pointerdown', empezar); b.addEventListener('pointerup', cancelar); b.addEventListener('pointerleave', cancelar); b.addEventListener('pointercancel', cancelar);
    botones.appendChild(b);
    if (conCambio) boton('↻ Otra misión', 'pequeno', cambiarMision);
  }

  function misionHecha() {
    const m = misiones[actual];
    nino.misiones++;
    nino.misionesRecientes = [...(nino.misionesRecientes || []).filter(id => id !== m.id), m.id].slice(-10);
    premiar(2, nino); Sonido.acierto(); mensaje(elogio());
    actual++;
    if (actual < misiones.length) { timers.push(setTimeout(mostrarMision, 1200)); return; }
    pintarPasos(); botones.innerHTML = '';
    if (nino.especiales.length < PEGATINAS_MISION.length) {
      const peg = PEGATINAS_MISION[nino.especiales.length]; nino.especiales.push(peg); guardarEstado();
      mostrarPegatina(peg, nino.nombre, true);
    }
    timers.push(setTimeout(() => partida.ganar('¡Todas las misiones hechas!'), 1500));
  }

  mostrarMision();
  return { destruir() { limpiar(); try { wakeLock?.release(); } catch (e) {} } };
}
