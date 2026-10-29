/* =========================================================================
 * app.js — catálogo de juegos, navegación, partidas, límite diario,
 * candado de adulto, alta de familia, panel de padres e instalación
 * ========================================================================= */

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const MINUTOS_OPCIONES = [10, 15, 20, 30, 40, 45, 60];

const JUEGOS = {
  peluqueria: { nombre: 'Peluquería', ico: '💇‍♀️', color: '#FFB8D2', desc: 'Colores, letras y problemas', crear: crearPeluqueria },
  bola: { nombre: 'Bola veloz', ico: '🔮', color: '#B9A8FF', desc: 'Para y elige la puerta', crear: crearBola },
  frutas: { nombre: 'Corta frutas', ico: '🍉', color: '#FFD27A', desc: 'Corta solo las de la misión', crear: crearFrutas },
  tuercas: { nombre: 'Tuercas', ico: '🔩', color: '#9FD8FF', desc: 'Ordena por colores', crear: crearTuercas, sinVidas: true },
  parejas: { nombre: 'Parejas', ico: '🃏', color: '#A8EDC4', desc: 'Memoria · 1 o 2 jugadores', crear: crearParejas, sinVidas: true },
  misiones: { nombre: 'Misiones', ico: '🤸', color: '#C6F27A', desc: 'Retos para moverse en casa', crear: crearMisiones, sinVidas: true, sinLimite: true, clase: 'mision' }
};

/** Pregunta corta para que el adulto converse con el niño al terminar (lo que más aprendizaje aporta). */
function preguntaAdulto(clave, nino) {
  const n = nino.nombre, peque = esPeque(nino), mayor = edadJuego(nino) >= 8;
  const opciones = {
    peluqueria: peque ? [`Pídele a ${n} que te diga 3 cosas de color rojo que vea ahora mismo.`, `Pregúntale a ${n} cuántos lazos le puso a la clienta.`]
      : [`Pregúntale a ${n} cómo resolvió uno de los problemas de la peluquería.`, `Pídele a ${n} que te invente un problema para ti.`],
    bola: peque ? [`Enséñale a ${n} varios dedos y que los cuente: prueba con 3 y con 5.`, `Pídele a ${n} que busque un círculo en la habitación.`]
      : mayor ? [`Pregúntale a ${n} cuánto es ${azar(3, 9)} × ${azar(3, 9)} y cómo lo ha calculado.`, `Pregúntale a ${n} qué tabla le cuesta más.`]
        : [`Pregúntale a ${n} qué número va después del ${azar(11, 29)}.`, `Pregúntale a ${n} cómo hace las restas: ¿con los dedos o de cabeza?`],
    frutas: [`Pregúntale a ${n} qué frutas había que cortar y cuáles no.`, `Pregúntale a ${n} cuál es su fruta favorita y de qué color es.`],
    tuercas: [`Pregúntale a ${n} cómo decidía qué tuerca mover primero.`, `Pídele a ${n} que te diga los colores en inglés.`],
    parejas: [`Pregúntale a ${n} qué truco usa para acordarse de dónde estaban las cartas.`, `Pídele a ${n} que te diga todos los animales que recuerde.`],
    misiones: [`Haced juntos la siguiente misión: ¿quién aguanta más a la pata coja?`, `Pregúntale a ${n} qué misión le ha gustado más.`]
  };
  return elegir(opciones[clave]);
}

/* =================== Piezas de interfaz de partida =================== */
function crearVidas(el, alAgotar) {
  let vidas = VIDAS_INICIALES, activo = true;
  const pintar = () => { el.innerHTML = Array.from({ length: VIDAS_INICIALES }, (_, i) => `<span class="corazon ${i < vidas ? '' : 'vacio'}">♥</span>`).join(''); };
  el.hidden = false; pintar();
  return {
    perder() {
      if (!activo || vidas <= 0) return vidas;
      vidas--; pintar(); Sonido.fallo();
      el.classList.remove('golpe'); void el.offsetWidth; el.classList.add('golpe');
      if (vidas === 0) setTimeout(alAgotar, 700);
      return vidas;
    },
    get valor() { return activo ? vidas : VIDAS_INICIALES; },
    ocultar() { activo = false; el.hidden = true; }
  };
}

/** Tarjeta final. botones: [{ texto, accion, clase }]; siempre se añade "Menú". */
function mostrarFinal(cont, { titulo, texto, botones, nota = '', fiesta = true }) {
  const ov = document.createElement('div'); ov.className = 'finalOverlay';
  ov.innerHTML = `<div class="finalTarjeta"><div class="finalEstrellas">${fiesta ? '★★★' : '💔'}</div><h2>${escaparHTML(titulo)}</h2><p>${escaparHTML(texto)}</p>
    <div class="finalBotones"></div>${nota ? `<div class="notaAdulto">👨‍👩‍👧 <b>Para el adulto:</b> ${escaparHTML(nota)}</div>` : ''}</div>`;
  const zona = $('.finalBotones', ov);
  [...botones, { texto: 'Menú', accion: cerrarJuego, clase: 'pequeno' }].forEach(b => {
    const el = document.createElement('button'); el.className = `btn ${b.clase || ''}`; el.textContent = b.texto;
    el.onclick = () => { ov.remove(); b.accion(); }; zona.appendChild(el);
  });
  cont.appendChild(ov);
  if (fiesta) { Confeti.lanzar(cantidadConfeti()); Sonido.fanfarria(); } else Sonido.triste();
  hablar(titulo);
}

/* =================== Reloj de uso diario =================== */
let partidaActual = null, juegoActual = null;
setInterval(() => {
  if (document.hidden || $('#pantallaJuego').hidden || !partidaActual || partidaActual.terminado || partidaActual.sinLimite) return;
  const n = perfilActivo(); if (!n) return;
  sumarSegundo(n);
  if (segundosHoy(n) % 20 === 0) guardarEstado();
}, 1000);

/* =================== Navegación =================== */
function mostrar(id) { $$('.pantalla').forEach(p => p.hidden = p.id !== id); actualizarContadores(); }
const visible = id => !$('#' + id).hidden;

function pintarInicio() {
  const cont = $('#perfiles'); cont.innerHTML = '';
  if (!estado.ninos.length) {
    cont.innerHTML = `<p class="nota" style="font-weight:800;opacity:1">Todavía no hay niños. Pulsa «Padres» para añadirlos.</p>`;
  }
  estado.ninos.forEach(n => {
    const b = document.createElement('button'); b.className = 'tarjetaPerfil';
    b.innerHTML = `<div class="avatar" style="background:${n.color}">${escaparHTML(n.nombre.charAt(0).toUpperCase())}</div>
      <div class="nombre">${escaparHTML(n.nombre)}</div><div class="edad">${edadDe(n)} años · ★ ${n.estrellas}</div>${cumpleEsteMes(n) ? '<div class="edad">🎂 ¡Su mes de cumple!</div>' : ''}`;
    b.onclick = () => { Sonido.iniciar(); estado.activo = n.id; guardarLocal(); abrirMenu(); };
    cont.appendChild(b);
  });
  pintarBannerInstalar();
}
function irAInicio() { pintarInicio(); mostrar('pantallaInicio'); Sync.bajarSiToca(); }

function textoTiempo(n) { return bloqueadoHoy(n) ? '🌙 Descanso' : `⏱ ${Math.max(1, Math.ceil(restantesSeg(n) / 60))} min`; }

function abrirMenu(saludar = true) {
  const n = perfilActivo(); if (!n) return irAInicio();
  const bloqueado = bloqueadoHoy(n);
  $('#saludo').textContent = bloqueado ? `${n.nombre}, hoy ya toca descansar` : cumpleEsteMes(n) ? `¡Feliz mes de cumple, ${n.nombre}! 🎂` : `¡Hola, ${n.nombre}! ¿A qué jugamos?`;
  $('#chipTiempo').textContent = textoTiempo(n);
  $('#tiles').innerHTML = '';
  Object.entries(JUEGOS).forEach(([clave, j]) => {
    const apagado = bloqueado && !j.sinLimite;
    const t = document.createElement('button'); t.className = `tile ${j.clase || ''} ${apagado ? 'apagado' : ''}`; t.style.background = j.color;
    t.innerHTML = `<span class="chipNivel">${apagado ? '🔒' : `Nivel ${nivelDe(n, clave)}`}</span><span class="ico">${j.ico}</span><h3>${j.nombre}</h3><p>${j.desc}</p>`;
    t.onclick = () => { Sonido.iniciar(); apagado ? mostrarDescanso() : abrirJuego(clave); };
    $('#tiles').appendChild(t);
  });
  mostrar('pantallaMenu');
  if (saludar) { hablar(bloqueado ? `${n.nombre}, hoy ya has jugado mucho. Puedes hacer misiones.` : `¡Hola ${n.nombre}! ¿A qué jugamos?`); Sync.bajarSiToca(); }
}

/** Crea la partida (vidas, ganar/perder, límite diario) y arranca el juego con la dificultad que toca por edad y nivel. */
function abrirJuego(clave) {
  if (juegoActual?.destruir) juegoActual.destruir();
  juegoActual = null; partidaActual = null;
  const def = JUEGOS[clave], n = perfilActivo(); if (!n) return irAInicio();
  const nivel = nivelDe(n, clave), dif = dificultadDe(n, clave);
  if (!def.sinLimite && bloqueadoHoy(n)) return mostrarDescanso();
  const ultima = !def.sinLimite && restantesSeg(n) < AVISO_ULTIMA_SEG;

  mostrar('pantallaJuego');
  $('#tituloJuego').textContent = def.nombre;
  $('#nivelJuego').textContent = `Nivel ${nivel}`;
  const cont = $('#zonaJuego'); cont.innerHTML = '';

  const partida = {
    terminado: false, sinLimite: !!def.sinLimite, ultima, nivel, vidas: null,
    // Tras la última partida (o si el tiempo se agotó jugando) se cierra el día para este niño
    seAcaboElDia() { return !def.sinLimite && (this.ultima || restantesSeg(n) <= 0); },
    botonesTrasPartida(normales) {
      if (this.seAcaboElDia()) { n.bloqueo = hoy(); guardarEstado(); return [{ texto: '🌙 Terminar por hoy', accion: mostrarDescanso, clase: 'primario' }]; }
      return normales;
    },
    ganar(texto) {
      if (this.terminado) return; this.terminado = true;
      n.niveles[clave] = nivel + 1; premiar(2, n);
      const opciones = clave === 'misiones'
        ? [{ texto: 'Más misiones', accion: () => abrirJuego('misiones'), clase: 'verde' }]
        : [{ texto: 'Otro nivel', accion: () => abrirJuego(clave) }, { texto: '🤸 Misión fuera', accion: () => abrirJuego('misiones') }];
      mostrarFinal(cont, { titulo: `¡Nivel ${nivel} superado!`, texto, botones: this.botonesTrasPartida(opciones), nota: preguntaAdulto(clave, n) });
    },
    perder() {
      if (this.terminado) return; this.terminado = true;
      mostrarFinal(cont, { titulo: '¡Sin vidas!', texto: `No pasa nada. Vuelve a intentar el nivel ${nivel}.`, fiesta: false,
        botones: this.botonesTrasPartida([{ texto: 'Reintentar', accion: () => abrirJuego(clave), clase: 'primario' }]), nota: preguntaAdulto(clave, n) });
    },
    // Final sin cambio de nivel (partida de 2 jugadores)
    terminarLibre({ titulo, texto, otraVez }) {
      if (this.terminado) return; this.terminado = true;
      mostrarFinal(cont, { titulo, texto, botones: this.botonesTrasPartida([{ texto: 'Otra vez', accion: () => { this.terminado = false; otraVez(); }, clase: 'primario' }]) });
    }
  };
  partida.vidas = crearVidas($('#vidasJuego'), () => partida.perder());
  if (def.sinVidas) partida.vidas.ocultar();

  const arrancar = () => { partidaActual = partida; juegoActual = def.crear(cont, n, dif, partida); };
  if (ultima) avisoUltimaPartida(cont, n, arrancar); else requestAnimationFrame(arrancar);
}
function avisoUltimaPartida(cont, n, alSeguir) {
  const ov = document.createElement('div'); ov.className = 'finalOverlay';
  ov.innerHTML = `<div class="finalTarjeta"><div class="finalEstrellas">⏳</div><h2>Esta es la última partida del día</h2><p>Disfrútala, ${escaparHTML(n.nombre)}. Cuando acabe, toca descansar.</p>
    <div class="finalBotones"><button class="btn primario">¡Vamos!</button></div></div>`;
  $('button', ov).onclick = () => { ov.remove(); alSeguir(); };
  cont.appendChild(ov); hablar(`${n.nombre}, esta es la última partida del día`);
}
function terminarJuegoActual() {
  if (juegoActual?.destruir) juegoActual.destruir();
  juegoActual = null; partidaActual = null;
  try { speechSynthesis.cancel(); } catch (e) {}
  $('#zonaJuego').innerHTML = ''; guardarEstado();
}
function cerrarJuego() { terminarJuegoActual(); abrirMenu(); }
function mostrarDescanso() {
  terminarJuegoActual();
  const n = perfilActivo(); if (!n) return irAInicio();
  $('#descansoTitulo').textContent = `¡A descansar, ${n.nombre}!`;
  mostrar('pantallaDescanso');
  hablar(`¡A descansar, ${n.nombre}! Mañana más juegos. Ahora puedes hacer misiones.`);
}
function abrirAlbum() {
  const n = perfilActivo(), resto = ESTRELLAS_POR_PEGATINA - (n.estrellas % ESTRELLAS_POR_PEGATINA);
  $('#albumTexto').textContent = n.pegatinas.length >= PEGATINAS.length ? '¡Álbum completo!' : `Te faltan ${resto} estrellas para la próxima pegatina.`;
  $('#albumBarra').style.width = `${((n.estrellas % ESTRELLAS_POR_PEGATINA) / ESTRELLAS_POR_PEGATINA) * 100}%`;
  $('#album').innerHTML = PEGATINAS.map((p, i) => i < n.pegatinas.length ? `<div class="hueco">${p}</div>` : `<div class="hueco bloq">${(i + 1) * ESTRELLAS_POR_PEGATINA}★</div>`).join('');
  $('#albumEspecial').innerHTML = PEGATINAS_MISION.map((p, i) => i < n.especiales.length ? `<div class="hueco especial">${p}</div>` : `<div class="hueco bloq">🤸<br>${i + 1}</div>`).join('');
  mostrar('pantallaAlbum');
}

/** Refresca lo que se ve cuando llegan datos de otro dispositivo (sin interrumpir una partida). */
function alCambiarDatosRemotos() {
  if (visible('pantallaInicio')) pintarInicio();
  else if (visible('pantallaMenu')) abrirMenu(false);
  else if (visible('pantallaBienvenida') && estado.ninos.length) irAInicio();
  if (!$('#panelPadres').hidden && !$('#tabProgreso').hidden) pintarProgreso();
}

/* =================== Candado de adulto =================== */
let alPasarCandado = null, respuestaCandado = null;
function nuevaPreguntaCandado() {
  const a = azar(6, 9), b = azar(6, 9);
  if (Math.random() < .5) { respuestaCandado = a * b; $('#preguntaCandado').textContent = `${a} × ${b} = ?`; }
  else { respuestaCandado = b; $('#preguntaCandado').textContent = `${a * b} ÷ ${a} = ?`; }
  $('#inputCandado').value = '';
}
function pedirAdulto(alPasar) {
  alPasarCandado = alPasar; nuevaPreguntaCandado(); $('#errorCandado').hidden = true;
  $('#panelCandado').hidden = false; setTimeout(() => $('#inputCandado').focus(), 50);
}
$('#formCandado').onsubmit = e => {
  e.preventDefault();
  if (+$('#inputCandado').value === respuestaCandado) { $('#panelCandado').hidden = true; const f = alPasarCandado; alPasarCandado = null; f && f(); }
  else { $('#errorCandado').hidden = false; nuevaPreguntaCandado(); }
};
$('#btnCandadoCancelar').onclick = () => { $('#panelCandado').hidden = true; alPasarCandado = null; };

/* ---- Más tiempo hoy ---- */
function elegirExtra() {
  const n = perfilActivo();
  $('#extraTexto').textContent = `${n.nombre} lleva ${Math.round(segundosHoy(n) / 60)} min hoy (límite: ${n.limiteMin} min).`;
  $('#panelExtra').hidden = false;
}
$$('#panelExtra [data-min]').forEach(b => b.onclick = () => {
  const n = perfilActivo(), f = hoy(), min = +b.dataset.min;
  const exceso = Math.max(0, segundosHoy(n) - limiteHoySeg(n));   // si ya se pasó, el extra cuenta desde ahora
  n.extra[f] = (n.extra[f] || 0) + min + Math.ceil(exceso / 60);
  n.bloqueo = null; n.editado = Date.now(); guardarEstado(); $('#panelExtra').hidden = true; abrirMenu();
});
$('#btnExtraCancelar').onclick = () => { $('#panelExtra').hidden = true; };

/* =================== Formularios de niños =================== */
function filaNinoHTML(n, conBorrar = false) {
  const ahora = new Date(), anioActual = ahora.getFullYear();
  const mes = n ? n.nacimiento.mes : ahora.getMonth() + 1, anio = n ? n.nacimiento.anio : anioActual - 6;
  const color = n ? n.color : elegir(COLORES_NINO), lim = n ? n.limiteMin : 20;
  const anios = Array.from({ length: 11 }, (_, i) => anioActual - 2 - i);
  return `<div class="filaNino" data-id="${n ? n.id : ''}">
    <label class="ancho2">Nombre o apodo<input class="fNombre" maxlength="14" value="${n ? escaparHTML(n.nombre) : ''}" placeholder="Por ejemplo: Lucía" autocomplete="off"></label>
    <label>Mes de nacimiento<select class="fMes">${MESES.map((m, i) => `<option value="${i + 1}" ${i + 1 === mes ? 'selected' : ''}>${m}</option>`).join('')}</select></label>
    <label>Año<select class="fAnio">${anios.map(a => `<option value="${a}" ${a === anio ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
    <label>Minutos de juego al día<select class="fLim">${MINUTOS_OPCIONES.map(m => `<option value="${m}" ${m === lim ? 'selected' : ''}>${m} min</option>`).join('')}</select></label>
    <span class="nota fEdad" style="align-self:end;font-weight:800"></span>
    <div class="ancho2 muestras">${COLORES_NINO.map(c => `<button type="button" class="muestra ${c === color ? 'sel' : ''}" data-color="${c}" style="background:${c}" aria-label="Elegir color"></button>`).join('')}
      ${conBorrar && n ? '<button type="button" class="btn pequeno peligro fBorrar" style="margin-left:auto">Eliminar</button>' : ''}</div>
  </div>`;
}
function leerFila(el) {
  return { id: el.dataset.id || null, nombre: $('.fNombre', el).value.trim(), mes: +$('.fMes', el).value, anio: +$('.fAnio', el).value,
    limiteMin: +$('.fLim', el).value, color: $('.muestra.sel', el)?.dataset.color || COLORES_NINO[0] };
}
function actualizarEdadFila(el) {
  const f = leerFila(el), edad = edadDe({ nacimiento: { anio: f.anio, mes: f.mes } });
  $('.fEdad', el).textContent = `${edad} años${edad < 3 || edad > 10 ? ' (el juego está pensado para 3–10)' : ''}`;
}
/** Comportamiento común de las filas: elegir color, ver la edad y sugerir minutos al cambiar el año. */
function activarFilas(cont) {
  cont.onclick = e => {
    const m = e.target.closest('.muestra'); if (!m) return;
    $$('.muestra', m.parentElement).forEach(x => x.classList.toggle('sel', x === m));
  };
  cont.onchange = e => {
    const fila = e.target.closest('.filaNino'); if (!fila) return;
    if (e.target.matches('.fAnio, .fMes') && !fila.dataset.id) { const f = leerFila(fila); $('.fLim', fila).value = String(limitePorEdad(edadDe({ nacimiento: { anio: f.anio, mes: f.mes } }))); }
    actualizarEdadFila(fila);
  };
  $$('.filaNino', cont).forEach(actualizarEdadFila);
}
function añadirFila(cont, n = null, conBorrar = false) {
  cont.insertAdjacentHTML('beforeend', filaNinoHTML(n, conBorrar));
  const fila = cont.lastElementChild; actualizarEdadFila(fila);
  if (!n) $('.fLim', fila).value = String(limitePorEdad(6));
  return fila;
}

/* =================== Bienvenida, alta y unión a familia =================== */
function mostrarBienvenida() {
  const conSync = Sync.configurado();
  $('#btnUnirseFamilia').hidden = !conSync;
  $('#btnCrearFamilia').textContent = conSync ? '👨‍👩‍👧 Es mi primera vez: crear familia' : '👨‍👩‍👧 Empezar: añadir a los niños';
  $('#notaBienvenida').textContent = conSync ? 'Con el código de familia podréis jugar en varios móviles y tablets con el mismo progreso.' : 'Los datos se guardan en este dispositivo.';
  mostrar('pantallaBienvenida');
}
function abrirAlta() {
  const filas = $('#filasAlta'); filas.innerHTML = ''; añadirFila(filas); activarFilas(filas);
  $('#consentimientoAlta').hidden = !Sync.configurado(); $('#chkConsentimiento').checked = false;
  $('#errorAlta').hidden = true; $('#panelAlta').hidden = false;
}
$('#btnCrearFamilia').onclick = () => { Sonido.iniciar(); abrirAlta(); };
$('#btnAltaOtro').onclick = () => añadirFila($('#filasAlta'));
$('#btnAltaCancelar').onclick = () => { $('#panelAlta').hidden = true; };
function errorEn(el, texto) { el.textContent = texto; el.hidden = false; el.style.opacity = 1; el.style.color = '#B3261E'; el.style.fontWeight = 800; }

$('#formAlta').onsubmit = async e => {
  e.preventDefault();
  const datos = $$('#filasAlta .filaNino').map(leerFila).filter(f => f.nombre);
  if (!datos.length) return errorEn($('#errorAlta'), 'Escribe al menos un nombre.');
  if (Sync.configurado() && !$('#chkConsentimiento').checked) return errorEn($('#errorAlta'), 'Marca la casilla de consentimiento para continuar.');
  datos.forEach(f => estado.ninos.push(ninoNuevo(f)));
  $('#panelAlta').hidden = true;
  if (Sync.configurado()) await crearFamiliaConCodigo();
  else { guardarEstado(); irAInicio(); }
};

/** Genera el código, sube los datos y lo enseña. Si no hay red, se sube más tarde. */
async function crearFamiliaConCodigo() {
  estado.familia = { codigo: generarCodigoFamilia(), version: 0, creada: Date.now() };
  guardarLocal();
  await Sync.subir();
  $('#textoCodigo').textContent = estado.familia.codigo;
  $('#panelCodigo').hidden = false;
}
$('#btnCodigoListo').onclick = () => { $('#panelCodigo').hidden = true; if (!$('#panelPadres').hidden) pintarFamilia(); else irAInicio(); };
$('#btnCopiarCodigo').onclick = () => copiarTexto($('#textoCodigo'));
function copiarTexto(el) {
  const texto = el.textContent;
  const seleccionar = () => { const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); };
  if (navigator.clipboard) navigator.clipboard.writeText(texto).then(() => mensaje('¡Copiado!')).catch(seleccionar); else seleccionar();
}

function abrirUnirse() {
  $('#inputCodigo').value = ''; $('#errorUnirse').hidden = true;
  $('#unirLocal').hidden = !estado.ninos.length; $('#chkUnirLocal').checked = false;
  $('#panelUnirse').hidden = false; setTimeout(() => $('#inputCodigo').focus(), 50);
}
$('#btnUnirseFamilia').onclick = () => { Sonido.iniciar(); abrirUnirse(); };
$('#btnUnirseCancelar').onclick = () => { $('#panelUnirse').hidden = true; };
$('#formUnirse').onsubmit = async e => {
  e.preventDefault();
  const codigo = normalizarCodigo($('#inputCodigo').value);
  if (!codigo) return errorEn($('#errorUnirse'), 'El código empieza por TJ y tiene 15 letras o números más.');
  $('#btnUnirseEnviar').disabled = true;
  try {
    const r = await Sync.existe(codigo);
    if (!r) return errorEn($('#errorUnirse'), 'No encuentro ninguna familia con ese código. Revisa que esté bien escrito.');
    if (!$('#chkUnirLocal').checked) { estado.ninos = []; estado.eliminados = []; estado.activo = null; }
    estado.familia = { codigo, version: r.version };
    aplicarRemoto(r.datos); guardarLocal();
    if ($('#chkUnirLocal').checked) Sync.subir();
    $('#panelUnirse').hidden = true; Sync.estado = 'ok'; Sync.ultimo = Date.now();
    if (!$('#panelPadres').hidden) pintarFamilia(); else irAInicio();
    mensaje('¡Familia unida!');
  } catch (err) { errorEn($('#errorUnirse'), 'Sin conexión a internet. Inténtalo de nuevo cuando haya red.'); }
  finally { $('#btnUnirseEnviar').disabled = false; }
};

/* =================== Panel de padres =================== */
let ninoPanel = null;
function abrirPanel() {
  ninoPanel = estado.activo || estado.ninos[0]?.id || null;
  cambiarPestana('progreso'); $('#panelPadres').hidden = false;
}
function cambiarPestana(tab) {
  $$('#panelPadres .pestana[data-tab]').forEach(b => b.classList.toggle('activa', b.dataset.tab === tab));
  ['progreso', 'ninos', 'familia', 'ajustes'].forEach(t => { $('#tab' + t[0].toUpperCase() + t.slice(1)).hidden = t !== tab; });
  ({ progreso: pintarProgreso, ninos: pintarNinos, familia: pintarFamilia, ajustes: pintarAjustes })[tab]();
}
$$('#panelPadres .pestana[data-tab]').forEach(b => b.onclick = () => cambiarPestana(b.dataset.tab));
$('#btnPadresCerrar').onclick = () => { $('#panelPadres').hidden = true; estado.ninos.length ? irAInicio() : mostrarBienvenida(); };

/** Confirmación en dos toques (los diálogos del navegador no son fiables en todas partes). */
function dosPasos(boton, textoConfirmar, accion) {
  boton.onclick = () => {
    if (boton.dataset.armado) { boton.dataset.armado = ''; accion(); return; }
    boton.dataset.armado = '1'; const original = boton.textContent; boton.textContent = textoConfirmar;
    setTimeout(() => { if (boton.dataset.armado) { boton.dataset.armado = ''; boton.textContent = original; } }, 4000);
  };
}

/** Valora una habilidad con los últimos intentos: qué necesita refuerzo y qué va bien. */
function valorarHabilidad(h) {
  const n = h.ult.length, pct = n ? Math.round(100 * h.ult.reduce((a, b) => a + b, 0) / n) : 0;
  let estadoH = 'progreso', texto = 'En progreso';
  if (n < INTENTOS_MINIMOS) { estadoH = 'pocos'; texto = 'Pocos datos'; }
  else if (pct < 60) { estadoH = 'refuerzo'; texto = 'Necesita refuerzo'; }
  else if (pct >= 85) { estadoH = 'bien'; texto = 'Va muy bien'; }
  return { pct, n, estadoH, texto };
}

function pintarProgreso() {
  if (!estado.ninos.length) { $('#selectorPerfil').innerHTML = ''; $('#contenidoProgreso').innerHTML = '<p class="nota">Añade niños en la pestaña «Niños».</p>'; return; }
  if (!estado.ninos.some(n => n.id === ninoPanel)) ninoPanel = estado.ninos[0].id;
  $('#selectorPerfil').innerHTML = estado.ninos.map(n => `<button class="pestana ${n.id === ninoPanel ? 'activa' : ''}" data-id="${n.id}">${escaparHTML(n.nombre)}</button>`).join('');
  $$('#selectorPerfil [data-id]').forEach(b => b.onclick = () => { ninoPanel = b.dataset.id; pintarProgreso(); });
  const n = estado.ninos.find(x => x.id === ninoPanel);

  const usado = Math.round(segundosHoy(n) / 60), limite = Math.round(limiteHoySeg(n) / 60);
  const dias = Array.from({ length: 7 }, (_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5); return { d, min: Math.round(segundosDia(n, fechaLocal(d)) / 60) }; });
  const maxMin = Math.max(n.limiteMin, ...dias.map(x => x.min), 1);
  const habilidades = Object.entries(n.habilidades).map(([k, h]) => ({ k, nombre: HABILIDADES[k] || k, ...valorarHabilidad(h) }))
    .sort((a, b) => (a.estadoH === 'pocos') - (b.estadoH === 'pocos') || a.pct - b.pct);
  const colorBarra = e => ({ refuerzo: 'var(--coral)', bien: 'var(--hoja)', progreso: 'var(--sol)', pocos: '#9AA4B8' })[e];
  const flojas = habilidades.filter(h => h.estadoH === 'refuerzo').map(h => h.nombre.toLowerCase());
  const fuertes = habilidades.filter(h => h.estadoH === 'bien').map(h => h.nombre.toLowerCase());

  $('#contenidoProgreso').innerHTML = `
    <div class="seccion"><h3>${escaparHTML(n.nombre)}, ${edadDe(n)} años · hoy: ${usado} de ${limite} min</h3><div class="barraHoy"><div style="width:${Math.min(100, 100 * usado / Math.max(limite, 1))}%"></div></div></div>
    <div class="seccion"><h3>Últimos 7 días (minutos, todos los dispositivos)</h3>
      <div class="semana">${dias.map(x => `<div class="dia"><span>${x.min}</span><div class="col ${x.min > n.limiteMin ? 'pasado' : ''}" style="height:${Math.max(3, 70 * x.min / maxMin)}%"></div><span>${x.d.toLocaleDateString('es-ES', { weekday: 'narrow' }).toUpperCase()}</span></div>`).join('')}</div>
      <p class="nota">En rojo, los días que superó su límite (${n.limiteMin} min). Las misiones no cuentan.</p></div>
    <div class="seccion"><h3>Habilidades</h3>
      ${flojas.length || fuertes.length ? `<p style="margin:0 0 6px;font-weight:700">${flojas.length ? `Le cuesta más: <b>${flojas.join(', ')}</b>. ` : ''}${fuertes.length ? `Va muy bien en: <b>${fuertes.join(', ')}</b>.` : ''}</p>` : ''}
      ${habilidades.length ? habilidades.map(h => `<div class="habil"><div class="nom">${h.nombre} <span class="estado ${h.estadoH}">${h.texto}</span></div>
        <div class="barrita"><div style="width:${h.pct}%;background:${colorBarra(h.estadoH)}"></div></div><div class="pct">${h.n ? h.pct + '%' : '—'}</div></div>`).join('')
        : '<p class="nota">Todavía no hay datos. Aparecerán a medida que juegue.</p>'}
      <p class="nota" style="margin-top:6px">Aciertos en los últimos ${VENTANA_HABILIDAD} intentos de cada habilidad. Se valora a partir de ${INTENTOS_MINIMOS} intentos.</p></div>
    <div class="seccion"><h3>Niveles</h3><div class="listaNiveles">${Object.entries(JUEGOS).map(([k, j]) => `<span>${j.ico} ${j.nombre}: ${nivelDe(n, k)}</span>`).join('')}</div></div>
    <div class="seccion"><h3>Misiones fuera de pantalla: ${n.misiones}</h3><p class="nota">Estrellas: ${n.estrellas} · Pegatinas: ${n.pegatinas.length} + ${n.especiales.length} de misiones</p></div>`;
}

function pintarNinos() {
  const cont = $('#filasNinos'); cont.innerHTML = '';
  estado.ninos.forEach(n => añadirFila(cont, n, true));
  if (!estado.ninos.length) añadirFila(cont);
  activarFilas(cont); $('#avisoNinos').hidden = true;
  $$('.fBorrar', cont).forEach(b => {
    const fila = b.closest('.filaNino');
    dosPasos(b, '¿Seguro? Se borra su progreso', () => {
      const id = fila.dataset.id;
      estado.ninos = estado.ninos.filter(n => n.id !== id);
      estado.eliminados = [...new Set([...(estado.eliminados || []), id])];
      if (estado.activo === id) estado.activo = null;
      guardarEstado(); pintarNinos();
    });
  });
}
$('#btnNinoNuevo').onclick = () => { const f = añadirFila($('#filasNinos')); $('.fNombre', f).focus(); };
$('#btnGuardarNinos').onclick = () => {
  const filas = $$('#filasNinos .filaNino').map(leerFila);
  if (filas.some(f => !f.nombre && f.id)) return errorEn($('#avisoNinos'), 'Todos los niños necesitan un nombre.');
  filas.filter(f => f.nombre).forEach(f => {
    const n = f.id && estado.ninos.find(x => x.id === f.id);
    if (!n) { estado.ninos.push(ninoNuevo(f)); return; }
    const cambios = n.nombre !== f.nombre || n.nacimiento.mes !== f.mes || n.nacimiento.anio !== f.anio || n.limiteMin !== f.limiteMin || n.color !== f.color;
    if (cambios) Object.assign(n, { nombre: f.nombre, nacimiento: { anio: f.anio, mes: f.mes }, limiteMin: f.limiteMin, color: f.color, editado: Date.now() });
  });
  guardarEstado(); pintarNinos(); mensaje('¡Guardado!');
};

function pintarFamilia() {
  const t = $('#tabFamilia');
  if (!Sync.configurado()) {
    t.innerHTML = `<p class="nota" style="opacity:1">La sincronización entre dispositivos no está activada en esta instalación del juego, así que los datos se guardan solo aquí.</p>
      <p class="nota">Para pasar el progreso a otro dispositivo puedes usar <b>Ajustes → Copia de seguridad</b>.</p>`;
    return;
  }
  if (!Sync.activo()) {
    t.innerHTML = `<p style="margin:0;font-weight:700">Con un código de familia podéis jugar en varios móviles y tablets con el mismo progreso y el mismo límite de tiempo.</p>
      <label class="consentimiento"><input type="checkbox" id="chkConsFamilia"><span>Soy su padre, madre o tutor y acepto que los datos de los niños se guarden para sincronizarlos. <a href="privacidad.html" target="_blank" rel="noopener">Ver privacidad</a>.</span></label>
      <p class="nota" id="errorFamilia" hidden></p>
      <div class="barra"><button class="btn primario" id="btnCrearCodigo">Crear código de familia</button><button class="btn" id="btnUnirmePanel">Ya tengo un código</button></div>`;
    $('#btnCrearCodigo').onclick = async () => {
      if (!estado.ninos.length) return errorEn($('#errorFamilia'), 'Primero añade algún niño en la pestaña «Niños».');
      if (!$('#chkConsFamilia').checked) return errorEn($('#errorFamilia'), 'Marca la casilla de consentimiento para continuar.');
      await crearFamiliaConCodigo();
    };
    $('#btnUnirmePanel').onclick = abrirUnirse;
    return;
  }
  t.innerHTML = `<div class="seccion"><h3>Código de familia</h3><div class="codigoFamilia" id="codigoPanel">${escaparHTML(estado.familia.codigo)}</div>
      <p class="nota" style="margin-top:6px">Escríbelo en cada dispositivo donde jueguen (botón «Ya tengo un código de familia»). Quien lo tenga puede ver y cambiar el progreso: compártelo solo con la familia.</p>
      <div class="barra" style="margin-top:8px"><button class="btn pequeno" id="btnCopiarPanel">📋 Copiar</button><button class="btn pequeno" id="btnSincronizar">🔄 Sincronizar ahora</button></div>
      <p class="estadoSync ${Sync.estado}" id="estadoSync" style="margin-top:8px">${escaparHTML(Sync.textoEstado())}</p></div>
    <div class="seccion"><h3>Este dispositivo</h3><p class="nota">Desvincular quita la familia y sus datos de este dispositivo. En internet y en los demás dispositivos sigue todo igual.</p>
      <button class="btn pequeno" id="btnDesvincular" style="margin-top:8px">Desvincular este dispositivo</button></div>
    <div class="seccion"><h3>Borrar datos de internet</h3><p class="nota">Borra para siempre los datos de la familia guardados en internet. Este dispositivo conserva una copia local.</p>
      <button class="btn pequeno peligro" id="btnBorrarNube" style="margin-top:8px">Borrar datos de internet</button></div>`;
  $('#btnCopiarPanel').onclick = () => copiarTexto($('#codigoPanel'));
  $('#btnSincronizar').onclick = async () => {
    const e = $('#estadoSync'); e.textContent = 'Sincronizando…';
    await Sync.bajar(); await Sync.subir();
    e.className = `estadoSync ${Sync.estado}`; e.textContent = Sync.textoEstado();
  };
  dosPasos($('#btnDesvincular'), '¿Seguro? Toca otra vez', () => {
    estado.familia = null; estado.ninos = []; estado.eliminados = []; estado.activo = null; guardarLocal();
    $('#panelPadres').hidden = true; mostrarBienvenida();
  });
  dosPasos($('#btnBorrarNube'), '¿Seguro? No se puede deshacer', async () => {
    try { await Sync.borrarFamilia(); estado.familia = null; guardarLocal(); mensaje('Datos borrados'); pintarFamilia(); }
    catch (e) { mensaje('Sin conexión', true); }
  });
}

function pintarAjustes() {
  $('#chkSonido').checked = estado.sonido; $('#avisoCopia').hidden = true;
  $('#btnBorrar').textContent = 'Borrar progreso';
}
$('#chkSonido').onchange = () => { estado.sonido = $('#chkSonido').checked; guardarLocal(); };
dosPasos($('#btnBorrar'), '¿Seguro? Toca otra vez', () => {
  // "reinicio" hace que, al sincronizar, el borrado gane al progreso antiguo de otros dispositivos
  estado.ninos.forEach(n => Object.assign(n, { estrellas: 0, pegatinas: [], especiales: [], niveles: {}, habilidades: {}, misiones: 0, misionesRecientes: [], reinicio: Date.now() }));
  guardarEstado(); $('#btnBorrar').textContent = 'Progreso borrado';
});
$('#btnExportar').onclick = () => {
  const blob = new Blob([JSON.stringify({ app: 'torrujuegos', version: 2, fecha: new Date().toISOString(), datos: datosSincronizables() }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `torrujuegos-${hoy()}.json`;
  document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
};
$('#inputImportar').onchange = e => {
  const archivo = e.target.files[0]; if (!archivo) return;
  const lector = new FileReader();
  lector.onload = () => {
    try {
      const contenido = JSON.parse(lector.result);
      if (contenido.app !== 'torrujuegos' || !contenido.datos) throw new Error('formato');
      aplicarRemoto(contenido.datos); guardarEstado();
      $('#avisoCopia').textContent = 'Copia importada y fusionada con los datos de este dispositivo.'; $('#avisoCopia').hidden = false;
    } catch (err) { errorEn($('#avisoCopia'), 'Ese archivo no es una copia de Torrujuegos.'); }
    e.target.value = '';
  };
  lector.readAsText(archivo);
};

/* =================== Instalación como app =================== */
let eventoInstalar = null;
const esStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
addEventListener('beforeinstallprompt', e => { e.preventDefault(); eventoInstalar = e; pintarBannerInstalar(); });
function pintarBannerInstalar() {
  const banner = $('#bannerInstalar');
  if (esStandalone() || estado.bannerCerrado || location.protocol === 'file:') { banner.hidden = true; return; }
  $('#instruccionesInstalar').textContent = esIOS() ? 'En iPhone/iPad: botón Compartir ⬆️ → «Añadir a pantalla de inicio».'
    : eventoInstalar ? '' : 'En el menú del navegador ⋮ → «Instalar aplicación» o «Añadir a pantalla de inicio».';
  $('#btnInstalar').hidden = !eventoInstalar;
  banner.hidden = false;
}
$('#btnInstalar').onclick = async () => { if (!eventoInstalar) return; eventoInstalar.prompt(); await eventoInstalar.userChoice.catch(() => {}); eventoInstalar = null; pintarBannerInstalar(); };
$('#btnCerrarBanner').onclick = () => { estado.bannerCerrado = true; guardarLocal(); pintarBannerInstalar(); };

/* =================== Botones generales y arranque =================== */
$('#btnPadres').onclick = () => pedirAdulto(abrirPanel);
$('#btnCambiar').onclick = irAInicio;
$('#btnSalir').onclick = cerrarJuego;
$('#btnAlbum').onclick = abrirAlbum;
$('#btnAlbumVolver').onclick = () => abrirMenu(false);
$('#btnDescansoMision').onclick = () => abrirJuego('misiones');
$('#btnDescansoJugador').onclick = irAInicio;
$('#btnDescansoExtra').onclick = () => pedirAdulto(elegirExtra);
document.addEventListener('visibilitychange', () => { if (document.hidden) { guardarLocal(); Sync.subir(); } else Sync.bajarSiToca(); });
addEventListener('online', () => Sync.subir());

function arrancar() {
  if (estado.ninos.length || estado.familia) irAInicio(); else mostrarBienvenida();
  if (Sync.activo()) Sync.bajar().then(() => Sync.subir());
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  try { navigator.storage?.persist?.(); } catch (e) {}
}
arrancar();
