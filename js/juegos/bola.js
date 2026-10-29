/* =========================================================================
 * Bola veloz — esquivar obstáculos; antes de cada puerta la pista se para
 * y el niño elige la respuesta sin prisa
 * ========================================================================= */
const FORMAS = [['circulo', 'el círculo'], ['cuadrado', 'el cuadrado'], ['triangulo', 'el triángulo'], ['estrella', 'la estrella'], ['corazon', 'el corazón']];

function preguntaBola(peque, d) {
  if (peque) {
    const tipo = elegir(['contar', 'contar', 'color', 'forma', ...(d >= 3 ? ['numero', 'numero'] : [])]), maxN = Math.min(2 + d, 9);
    if (tipo === 'contar' || tipo === 'numero') {
      const n = azar(1, maxN), ops = opcionesNumericas(n, 3, 1, Math.max(4, maxN)), esContar = tipo === 'contar';
      return { habilidad: esContar ? 'contar' : 'numeros', texto: esContar ? `¿Dónde hay ${n}?` : `¿Dónde está el ${n}?`, voz: esContar ? `¿Dónde hay ${n}?` : `¿Dónde está el número ${n}?`, correcta: String(n),
        opciones: barajar(ops.map(v => ({ tipo: esContar ? 'puntos' : 'texto', valor: esContar ? v : String(v), correcta: v === n }))) };
    }
    if (tipo === 'color') {
      const tres = barajar(COLORES).slice(0, 3), a = tres[0];
      return { habilidad: 'colores', texto: `¿Dónde está el ${a.nombre.toUpperCase()}?`, voz: `¿Dónde está el color ${a.nombre}?`, correcta: a.nombre,
        opciones: barajar(tres.map(c => ({ tipo: 'color', hex: c.hex, correcta: c === a }))) };
    }
    const tres = barajar(FORMAS).slice(0, 3), a = tres[0];
    return { habilidad: 'formas', texto: `¿Dónde está ${a[1].toUpperCase()}?`, voz: `¿Dónde está ${a[1]}?`, correcta: a[1],
      opciones: barajar(tres.map(f => ({ tipo: 'forma', valor: f[0], correcta: f === a }))) };
  }

  const r = rangosEscolares(d), conAyuda = d <= 2, maxSecuencia = Math.min(10 + 5 * d, 100);
  const tipo = elegir(['suma', 'suma', 'resta', 'resta', 'siguiente', ...(d >= 3 ? ['anterior'] : []),
    ...(r.tablaMax ? ['multi', 'multi', 'multi'] : []), ...(r.conSeries ? ['serie'] : []), ...(r.conDivision ? ['division', 'division'] : [])]);
  let res, texto, voz, ayuda = '', habilidad = 'secuencias', salto = 3;
  if (tipo === 'suma') { const s = generarSuma(r); res = s.res; texto = `${s.a} + ${s.b} = ?`; voz = `¿Cuánto es ${s.a} más ${s.b}?`; habilidad = 'suma'; if (conAyuda) ayuda = puntos(s.a) + ' + ' + puntos(s.b, 'b'); }
  else if (tipo === 'resta') { const s = generarResta(r); res = s.res; texto = `${s.a} − ${s.b} = ?`; voz = `¿Cuánto es ${s.a} menos ${s.b}?`; habilidad = 'resta'; if (conAyuda) ayuda = puntosResta(s.a, s.b); }
  else if (tipo === 'multi') { const s = generarMulti(r); res = s.res; texto = `${s.a} × ${s.b} = ?`; voz = `¿Cuánto es ${s.a} por ${s.b}?`; habilidad = 'multiplicacion'; salto = s.a; }
  else if (tipo === 'division') { const s = generarDivision(r); res = s.res; texto = `${s.a} ÷ ${s.b} = ?`; voz = `¿Cuánto es ${s.a} entre ${s.b}?`; habilidad = 'division'; }
  else if (tipo === 'serie') {
    const paso = elegir([2, 5, 10]), inicio = paso * azar(0, 6);
    res = inicio + 3 * paso; texto = `${inicio}, ${inicio + paso}, ${inicio + 2 * paso}, ?`; voz = `¿Qué número sigue? ${inicio}, ${inicio + paso}, ${inicio + 2 * paso}...`; habilidad = 'series'; salto = paso;
  }
  else if (tipo === 'siguiente') { const a = azar(1, maxSecuencia - 1); res = a + 1; texto = `¿Qué va después del ${a}?`; voz = `¿Qué número va después del ${a}?`; }
  else { const a = azar(2, maxSecuencia); res = a - 1; texto = `¿Qué va antes del ${a}?`; voz = `¿Qué número va antes del ${a}?`; }
  return { habilidad, texto, voz, ayuda, correcta: String(res), opciones: barajar(opcionesNumericas(res, 3, 0, 1000, Math.max(2, salto)).map(v => ({ tipo: 'texto', valor: String(v), correcta: v === res }))) };
}

function crearBola(cont, nino, d, partida) {
  const peque = esPeque(nino);
  // Dificultad
  const META = Math.min(4 + d, 10);
  const vBase = Math.min((peque ? 80 : 95) + (d - 1) * 12, 230);
  const separacion = Math.max(110, 185 - d * 8);
  const anchoBloque = Math.min(.22 + d * .022, .42);

  cont.innerHTML = `<div class="juegoLienzo">
    <div class="hud"><button class="btnVoz" aria-label="Repetir pregunta">🔊</button><div class="pregunta" id="bolaPregunta">Arrastra la bola para esquivar</div>
    <div class="hudDcha"><span>Puerta</span><span><span id="bolaMeta">0</span>/${META}</span></div></div>
    <canvas aria-label="Pista de la bola"></canvas></div>`;
  const cv = $('canvas', cont), pregEl = $('#bolaPregunta', cont), metaEl = $('#bolaMeta', cont);
  let { ctx, W, H } = prepararLienzo(cv);
  const R = 20, bolaY = () => H * .82, lineaParada = () => bolaY() - R - 26;
  const s = { x: W / 2, obj: W / 2, v: vBase, objetos: [], dist: 0, prox: 60, pasos: 0, puertas: 0, aciertos: 0, racha: 0,
    invul: 0, textos: [], estela: [], activa: null, esperando: false, pulso: 0 };
  let raf, ultimo = performance.now();

  $('.btnVoz', cont).onclick = () => s.activa && hablar(s.activa.voz);
  const flotante = (t, x, y, c = '#2FB765') => s.textos.push({ t, x, y, c, vida: 1 });

  function spawnPuerta() {
    s.activa = { tipo: 'puerta', y: -60, alto: 86, ...preguntaBola(peque, d), eleccion: null, resuelta: false };
    s.objetos.push(s.activa);
    pregEl.textContent = '¡Atención, viene una pregunta!';
  }
  function spawnBloque() {
    const w = W * anchoBloque, x = Math.random() * (W - w);
    s.objetos.push({ tipo: 'bloque', x, y: -30, w, h: 26 });
    if (Math.random() < .7) {
      let ex, i = 0; do { ex = 20 + Math.random() * (W - 40); } while (ex > x - 24 && ex < x + w + 24 && i++ < 20);
      s.objetos.push({ tipo: 'moneda', x: ex, y: -30 });
    }
  }
  // La puerta se detiene justo encima de la bola y espera a que el niño toque una opción.
  function pararEnPuerta() {
    s.esperando = true; s.v = 0; Sonido.freno();
    pregEl.innerHTML = s.activa.texto + (s.activa.ayuda ? `<div class="ayuda">${s.activa.ayuda}</div>` : '');
    hablar(s.activa.voz);
  }
  function elegirOpcion(x) {
    const p = s.activa, k = p.opciones.length, i = limitar(Math.floor(x / (W / k)), 0, k - 1);
    p.eleccion = i; s.esperando = false; s.obj = (i + .5) * (W / k); Sonido.pop();
  }
  function resolverPuerta(p) {
    p.resuelta = true; s.puertas++; s.activa = null; metaEl.textContent = s.puertas;
    pregEl.textContent = 'Arrastra la bola para esquivar';
    const ok = p.opciones[p.eleccion].correcta;
    registrar(p.habilidad, ok, nino);
    if (ok) { s.aciertos++; s.racha++; Sonido.acierto(); premiar(1, nino); flotante(s.racha >= 3 ? `¡Racha x${s.racha}!` : elogio(), s.x, bolaY() - 50); }
    else { s.racha = 0; flotante('¡Uy!', s.x, bolaY() - 50, '#FF6F59'); partida.vidas.perder(); if (partida.vidas.valor > 0) hablar(`Era ${p.correcta}`); }
    if (s.puertas >= META && partida.vidas.valor > 0) setTimeout(() => partida.ganar(`Has acertado ${s.aciertos} de ${META} puertas.`), 700);
  }
  function chocaBloque(b) {
    const cx = limitar(s.x, b.x, b.x + b.w), cy = limitar(bolaY(), b.y, b.y + b.h);
    return (s.x - cx) ** 2 + (bolaY() - cy) ** 2 < R * R;
  }
  function velObjetivo() {
    const p = s.activa;
    if (p && p.eleccion === null) return limitar((lineaParada() - (p.y + p.alto / 2)) * 2.2, 0, vBase);
    return vBase;
  }

  function actualizar(dt) {
    s.pulso += dt;
    if (!s.esperando) {
      s.v += (velObjetivo() - s.v) * Math.min(1, dt * 4);
      const p = s.activa;
      if (p && p.eleccion === null && lineaParada() - (p.y + p.alto / 2) < 1.5) pararEnPuerta();
    }
    const v = s.esperando ? 0 : s.v;
    s.prox -= v * dt;
    if (s.prox <= 0) {
      s.prox = separacion;
      if (s.pasos >= 3 && !s.activa && s.puertas < META) { spawnPuerta(); s.pasos = 0; }
      else if (!s.activa) { spawnBloque(); s.pasos++; }
    }
    s.dist += v * dt;
    s.x += (s.obj - s.x) * Math.min(1, dt * 10);
    s.x = limitar(s.x, R, W - R);
    s.estela.push({ x: s.x, y: bolaY() }); if (s.estela.length > 10) s.estela.shift();
    s.estela.forEach(e => e.y += v * dt);
    if (s.invul > 0) s.invul -= dt;
    for (const o of s.objetos) {
      o.y += v * dt;
      if (o.tipo === 'puerta' && !o.resuelta && o.eleccion !== null && o.y + o.alto / 2 >= bolaY()) resolverPuerta(o);
      if (o.tipo === 'bloque' && !o.golpeado && s.invul <= 0 && chocaBloque(o)) {
        o.golpeado = true; s.invul = 1.2; s.racha = 0; flotante('¡Pum!', s.x, bolaY() - 40, '#FF6F59'); partida.vidas.perder();
      }
      if (o.tipo === 'moneda' && !o.cogida && (o.x - s.x) ** 2 + (o.y - bolaY()) ** 2 < (R + 16) ** 2) { o.cogida = true; Sonido.moneda(); flotante('+1', o.x, o.y, '#E8A300'); }
    }
    s.objetos = s.objetos.filter(o => o.y < H + 120 && !o.cogida);
    s.textos.forEach(t => { t.y -= 50 * dt; t.vida -= dt * .9; });
    s.textos = s.textos.filter(t => t.vida > 0);
  }

  function dibujarOpcion(op, cx, cy, ancho) {
    ctx.fillStyle = '#1D2142'; ctx.strokeStyle = '#1D2142'; ctx.lineWidth = 3;
    if (op.tipo === 'texto') { ctx.font = `800 ${Math.min(40, ancho * (op.valor.length > 2 ? .3 : .4))}px "Baloo 2", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(op.valor, cx, cy + 2); }
    else if (op.tipo === 'puntos') {
      const n = op.valor, cols = n <= 3 ? n : Math.ceil(n / 2), filas = n <= 3 ? 1 : 2, sep = Math.min(22, (ancho - 16) / cols), rr = Math.min(8, sep * .38);
      for (let i = 0; i < n; i++) { const f = Math.floor(i / cols), c = i % cols, enFila = f === filas - 1 ? n - cols * f : cols;
        const x = cx + (c - (enFila - 1) / 2) * sep, y = cy + (f - (filas - 1) / 2) * 22;
        ctx.beginPath(); ctx.arc(x, y, rr, 0, Math.PI * 2); ctx.fillStyle = '#FF6F59'; ctx.fill(); ctx.stroke(); }
    } else if (op.tipo === 'forma') {
      ctx.fillStyle = '#fff'; const rr = 22; ctx.beginPath();
      if (op.valor === 'circulo') ctx.arc(cx, cy, rr, 0, Math.PI * 2);
      else if (op.valor === 'cuadrado') ctx.rect(cx - rr, cy - rr, rr * 2, rr * 2);
      else if (op.valor === 'triangulo') { ctx.moveTo(cx, cy - rr); ctx.lineTo(cx + rr, cy + rr * .8); ctx.lineTo(cx - rr, cy + rr * .8); ctx.closePath(); }
      else if (op.valor === 'corazon') { ctx.moveTo(cx, cy + rr); ctx.bezierCurveTo(cx - rr * 1.6, cy - rr * .2, cx - rr * .6, cy - rr * 1.3, cx, cy - rr * .4); ctx.bezierCurveTo(cx + rr * .6, cy - rr * 1.3, cx + rr * 1.6, cy - rr * .2, cx, cy + rr); }
      else for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? rr * .45 : rr; ctx[i ? 'lineTo' : 'moveTo'](cx + q * Math.cos(a), cy + q * Math.sin(a)); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }

  function dibujar() {
    ctx.fillStyle = '#E6F4FF'; ctx.fillRect(0, 0, W, H);
    const banda = 60, off = s.dist % (banda * 2);
    ctx.fillStyle = '#D6ECFB';
    for (let y = -banda * 2 + off; y < H; y += banda * 2) ctx.fillRect(0, y, W, banda);
    for (const o of s.objetos) {
      if (o.tipo === 'bloque') { rectRedondo(ctx, o.x, o.y, o.w, o.h, 8); ctx.fillStyle = o.golpeado ? '#FFB3A7' : '#FF6F59'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#1D2142'; ctx.stroke(); }
      else if (o.tipo === 'moneda') estrellaLienzo(ctx, o.x, o.y, 14);
      else if (o.tipo === 'puerta') {
        const k = o.opciones.length, aw = W / k, top = o.y - o.alto / 2;
        const brillo = s.esperando && o === s.activa ? 3 + 2 * Math.sin(s.pulso * 8) : 0;
        o.opciones.forEach((op, i) => {
          const x = i * aw + 6;
          rectRedondo(ctx, x, top, aw - 12, o.alto, 16);
          ctx.fillStyle = op.tipo === 'color' ? op.hex : ['#FFF3C4', '#E3DBFF', '#D3F5E1'][i % 3]; ctx.fill();
          const marcada = o.resuelta && (i === o.eleccion || op.correcta);
          ctx.lineWidth = marcada ? 7 : 3 + brillo;
          ctx.strokeStyle = o.resuelta ? (op.correcta ? '#2FB765' : i === o.eleccion ? '#FF6F59' : '#1D2142') : (o.eleccion === i ? '#7A5CFA' : '#1D2142');
          ctx.stroke();
          if (op.tipo !== 'color') dibujarOpcion(op, x + (aw - 12) / 2, o.y, aw - 12);
        });
      }
    }
    s.estela.forEach((e, i) => { ctx.globalAlpha = i / 20; ctx.beginPath(); ctx.arc(e.x, e.y, R * (i / 10), 0, Math.PI * 2); ctx.fillStyle = '#7A5CFA'; ctx.fill(); });
    ctx.globalAlpha = s.invul > 0 && Math.floor(s.invul * 10) % 2 ? .35 : 1;
    const g = ctx.createRadialGradient(s.x - 6, bolaY() - 6, 3, s.x, bolaY(), R);
    g.addColorStop(0, '#B9A8FF'); g.addColorStop(1, '#7A5CFA');
    ctx.beginPath(); ctx.arc(s.x, bolaY(), R, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#1D2142'; ctx.stroke();
    ctx.globalAlpha = 1;
    if (s.esperando) {
      ctx.font = '800 22px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.lineWidth = 5; ctx.strokeStyle = '#fff'; ctx.strokeText('👆 Toca la respuesta', W / 2, H - 22); ctx.fillStyle = '#1D2142'; ctx.fillText('👆 Toca la respuesta', W / 2, H - 22);
    }
    s.textos.forEach(t => textoFlotante(ctx, t));
  }

  function bucle(t) { const dt = Math.min(.05, (t - ultimo) / 1000); ultimo = t; if (!partida.terminado) actualizar(dt); dibujar(); raf = requestAnimationFrame(bucle); }
  const posX = e => e.clientX - cv.getBoundingClientRect().left;
  cv.addEventListener('pointerdown', e => {
    if (partida.terminado) return;
    if (s.esperando) return elegirOpcion(posX(e));
    if (s.activa && s.activa.eleccion !== null) return;
    s.obj = posX(e); cv.setPointerCapture(e.pointerId);
  });
  cv.addEventListener('pointermove', e => { if (!s.esperando && !(s.activa && s.activa.eleccion !== null) && (e.buttons || e.pointerType === 'mouse')) s.obj = posX(e); });
  const alRedimensionar = () => { const prev = W; ({ ctx, W, H } = prepararLienzo(cv)); s.x *= W / prev; s.obj = s.x; };
  addEventListener('resize', alRedimensionar);
  raf = requestAnimationFrame(bucle);
  return { destruir() { cancelAnimationFrame(raf); removeEventListener('resize', alRedimensionar); } };
}
