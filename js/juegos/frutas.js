/* =========================================================================
 * Corta frutas — misiones de reconocer (colores, números, letras, tablas)
 * Las frutas se dibujan con formas: los emojis en canvas salen como
 * siluetas en muchos Android.
 * ========================================================================= */
const COLOR_FRUTA = { manzana: '#E53935', manzanaVerde: '#7CB342', pera: '#C0CA33', naranja: '#FB8C00', limon: '#FDD835',
  platano: '#FFD54F', uvas: '#8E44AD', fresa: '#E53935', cereza: '#C62828', sandia: '#EF5350', kiwi: '#8BC34A' };
const FRUTAS = ['manzana', 'platano', 'uvas', 'sandia', 'naranja', 'fresa', 'pera', 'cereza', 'limon', 'kiwi'];

function trazo(ctx, relleno) { ctx.fillStyle = relleno; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#1D2142'; ctx.stroke(); }
function brillo(ctx, x, y, r) { ctx.beginPath(); ctx.ellipse(x, y, r, r * .6, -.6, 0, Math.PI * 2); ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fill(); }
function hojaFruta(ctx, x, y, r, ang) { ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.beginPath(); ctx.ellipse(r * .32, 0, r * .32, r * .14, 0, 0, Math.PI * 2); trazo(ctx, '#43A047'); ctx.restore(); }
function rabito(ctx, x, y, r) { ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + r * .08, y - r * .25, x + r * .15, y - r * .42); ctx.lineWidth = r * .11; ctx.strokeStyle = '#6D4C41'; ctx.lineCap = 'round'; ctx.stroke(); }

function dibujarFormaFruta(ctx, id, r) {
  ctx.lineJoin = 'round';
  switch (id) {
    case 'manzana': case 'manzanaVerde':
      ctx.beginPath(); ctx.moveTo(0, -r * .55);
      ctx.bezierCurveTo(r * .5, -r * .95, r * 1.1, -r * .45, r * .9, r * .2);
      ctx.bezierCurveTo(r * .75, r * .8, r * .3, r, 0, r * .8);
      ctx.bezierCurveTo(-r * .3, r, -r * .75, r * .8, -r * .9, r * .2);
      ctx.bezierCurveTo(-r * 1.1, -r * .45, -r * .5, -r * .95, 0, -r * .55); ctx.closePath();
      trazo(ctx, COLOR_FRUTA[id]); brillo(ctx, -r * .4, -r * .15, r * .18);
      rabito(ctx, 0, -r * .55, r); hojaFruta(ctx, r * .12, -r * .78, r, -.5); break;
    case 'pera':
      ctx.beginPath(); ctx.moveTo(0, -r * .8);
      ctx.bezierCurveTo(r * .35, -r * .8, r * .3, -r * .2, r * .6, r * .2);
      ctx.bezierCurveTo(r * .9, r * .7, r * .4, r * .95, 0, r * .95);
      ctx.bezierCurveTo(-r * .4, r * .95, -r * .9, r * .7, -r * .6, r * .2);
      ctx.bezierCurveTo(-r * .3, -r * .2, -r * .35, -r * .8, 0, -r * .8); ctx.closePath();
      trazo(ctx, COLOR_FRUTA.pera); brillo(ctx, -r * .3, r * .25, r * .15); rabito(ctx, 0, -r * .8, r); break;
    case 'naranja':
      ctx.beginPath(); ctx.arc(0, 0, r * .85, 0, Math.PI * 2); trazo(ctx, COLOR_FRUTA.naranja);
      ctx.fillStyle = 'rgba(0,0,0,.15)'; [[.3, .2], [-.25, .35], [.1, -.3], [-.4, -.1], [.45, -.15]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x * r, y * r, r * .04, 0, Math.PI * 2); ctx.fill(); });
      brillo(ctx, -r * .35, -r * .3, r * .18); hojaFruta(ctx, 0, -r * .82, r, -.3); break;
    case 'limon':
      ctx.beginPath(); ctx.moveTo(-r, 0);
      ctx.quadraticCurveTo(-r * .9, -r * .7, 0, -r * .66); ctx.quadraticCurveTo(r * .9, -r * .7, r, 0);
      ctx.quadraticCurveTo(r * .9, r * .7, 0, r * .66); ctx.quadraticCurveTo(-r * .9, r * .7, -r, 0); ctx.closePath();
      trazo(ctx, COLOR_FRUTA.limon); brillo(ctx, -r * .35, -r * .25, r * .2); break;
    case 'platano':
      ctx.beginPath(); ctx.moveTo(-r * .85, -r * .5);
      ctx.quadraticCurveTo(-r * .55, r * 1.15, r * .95, r * .05);
      ctx.quadraticCurveTo(-r * .3, r * .2, -r * .55, -r * .55); ctx.closePath();
      trazo(ctx, COLOR_FRUTA.platano);
      ctx.fillStyle = '#6D4C41'; ctx.beginPath(); ctx.arc(-r * .7, -r * .55, r * .1, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(r * .92, r * .05, r * .07, 0, Math.PI * 2); ctx.fill(); break;
    case 'uvas':
      rabito(ctx, 0, -r * .55, r);
      [[-.4, -.38], [0, -.42], [.4, -.38], [-.2, -.02], [.2, -.02], [-.42, .3], [.42, .3], [0, .34], [0, .68]].forEach(([x, y]) => {
        ctx.beginPath(); ctx.arc(x * r, y * r, r * .26, 0, Math.PI * 2); trazo(ctx, COLOR_FRUTA.uvas); brillo(ctx, x * r - r * .08, y * r - r * .08, r * .06);
      }); break;
    case 'fresa':
      ctx.beginPath(); ctx.moveTo(0, r * .9);
      ctx.bezierCurveTo(-r * .5, r * .6, -r * .95, -r * .1, -r * .7, -r * .5);
      ctx.quadraticCurveTo(0, -r * .75, r * .7, -r * .5);
      ctx.bezierCurveTo(r * .95, -r * .1, r * .5, r * .6, 0, r * .9); ctx.closePath();
      trazo(ctx, COLOR_FRUTA.fresa);
      ctx.fillStyle = '#FFEB3B'; [[-.35, -.2], [0, -.25], [.35, -.2], [-.2, .15], [.2, .15], [0, .5], [-.45, .1], [.45, .1]].forEach(([x, y]) => { ctx.beginPath(); ctx.ellipse(x * r, y * r, r * .05, r * .08, 0, 0, Math.PI * 2); ctx.fill(); });
      [-.9, -.3, .3, .9].forEach(a => hojaFruta(ctx, 0, -r * .6, r, a - Math.PI / 2)); break;
    case 'cereza':
      ctx.beginPath(); ctx.moveTo(-r * .35, r * .2); ctx.quadraticCurveTo(-r * .2, -r * .5, r * .15, -r * .85);
      ctx.moveTo(r * .4, r * .3); ctx.quadraticCurveTo(r * .35, -r * .3, r * .15, -r * .85);
      ctx.lineWidth = r * .09; ctx.strokeStyle = '#558B2F'; ctx.lineCap = 'round'; ctx.stroke();
      [[-.38, .45], [.42, .55]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x * r, y * r, r * .38, 0, Math.PI * 2); trazo(ctx, COLOR_FRUTA.cereza); brillo(ctx, x * r - r * .12, y * r - r * .12, r * .1); }); break;
    case 'sandia':
      ctx.beginPath(); ctx.moveTo(-r, -r * .25); ctx.lineTo(r, -r * .25); ctx.arc(0, -r * .25, r, 0, Math.PI); ctx.closePath(); trazo(ctx, '#43A047');
      ctx.beginPath(); ctx.moveTo(-r * .82, -r * .25); ctx.lineTo(r * .82, -r * .25); ctx.arc(0, -r * .25, r * .82, 0, Math.PI); ctx.closePath(); ctx.fillStyle = COLOR_FRUTA.sandia; ctx.fill();
      ctx.fillStyle = '#1D2142'; [[-.4, 0], [0, .1], [.4, 0], [-.2, .3], [.2, .3]].forEach(([x, y]) => { ctx.beginPath(); ctx.ellipse(x * r, y * r, r * .05, r * .08, 0, 0, Math.PI * 2); ctx.fill(); }); break;
    case 'kiwi':
      ctx.beginPath(); ctx.arc(0, 0, r * .85, 0, Math.PI * 2); trazo(ctx, '#8D6E63');
      ctx.beginPath(); ctx.arc(0, 0, r * .7, 0, Math.PI * 2); ctx.fillStyle = COLOR_FRUTA.kiwi; ctx.fill();
      ctx.beginPath(); ctx.ellipse(0, 0, r * .25, r * .18, 0, 0, Math.PI * 2); ctx.fillStyle = '#F1F8E9'; ctx.fill();
      ctx.fillStyle = '#1D2142'; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; ctx.beginPath(); ctx.arc(Math.cos(a) * r * .4, Math.sin(a) * r * .4, r * .04, 0, Math.PI * 2); ctx.fill(); } break;
  }
}


const REGLAS_COLOR = [
  { habilidad: 'observacion', texto: 'Corta solo los PLÁTANOS', voz: 'Corta solo los plátanos', gen: ok => ({ fruta: ok ? 'platano' : elegir(['manzana', 'fresa', 'uvas', 'sandia', 'naranja']) }) },
  { habilidad: 'colores', texto: 'Corta las frutas ROJAS', voz: 'Corta las frutas de color rojo', gen: ok => ({ fruta: ok ? elegir(['manzana', 'fresa', 'cereza']) : elegir(['platano', 'limon', 'manzanaVerde', 'kiwi', 'uvas']) }) },
  { habilidad: 'colores', texto: 'Corta las frutas AMARILLAS', voz: 'Corta las frutas de color amarillo', gen: ok => ({ fruta: ok ? elegir(['platano', 'limon']) : elegir(['manzana', 'fresa', 'uvas', 'kiwi', 'naranja']) }) },
  { habilidad: 'observacion', texto: 'Corta solo las UVAS', voz: 'Corta solo las uvas', gen: ok => ({ fruta: ok ? 'uvas' : elegir(['manzana', 'platano', 'naranja', 'fresa', 'sandia']) }) },
  { habilidad: 'colores', texto: 'Corta las frutas VERDES', voz: 'Corta las frutas de color verde', gen: ok => ({ fruta: ok ? elegir(['manzanaVerde', 'kiwi', 'pera']) : elegir(['manzana', 'platano', 'fresa', 'uvas', 'naranja']) }) }
];
const frutaCualquiera = () => elegir(FRUTAS);
function reglaNumero(max) {
  const n = azar(1, max), otro = () => { let x; do { x = azar(1, Math.max(max, 3)); } while (x === n); return x; };
  return { habilidad: 'numeros', texto: `Corta los números ${n}`, voz: `Corta solo los números ${n}`, gen: ok => ({ fruta: frutaCualquiera(), etq: String(ok ? n : otro()) }) };
}
/** Reglas según edad y dificultad. Es un juego de reflejos: se reconoce, no se calcula con calma. */
function reglasFrutas(nino, d) {
  if (esPeque(nino)) return d >= 3 ? [...REGLAS_COLOR, reglaNumero(Math.min(2 + d, 9))] : REGLAS_COLOR;
  const inicial = (nino.nombre.toUpperCase().normalize('NFD').match(/[A-Z]/) || ['M'])[0];
  const otrasLetras = ['A', 'E', 'O', 'P', 'S', 'L', 'T', 'M', 'R', 'G', 'D'].filter(l => l !== inicial);
  const reglas = [
    reglaNumero(9),
    { habilidad: 'letras', texto: `Corta la letra ${inicial}`, voz: `Corta la letra ${inicial}, como la de ${nino.nombre}`, gen: ok => ({ fruta: frutaCualquiera(), etq: ok ? inicial : elegir(otrasLetras) }) },
    REGLAS_COLOR[1], REGLAS_COLOR[4]
  ];
  if (d >= 3) reglas.push({ habilidad: 'comparar', texto: 'Corta los números MAYORES que 5', voz: 'Corta los números mayores que cinco', gen: ok => ({ fruta: frutaCualquiera(), etq: String(ok ? azar(6, 10) : azar(1, 5)) }) });
  if (d >= 4) reglas.push({ habilidad: 'letras', texto: 'Corta las VOCALES: A E I O U', voz: 'Corta las vocales: a, e, i, o, u', gen: ok => ({ fruta: frutaCualquiera(), etq: ok ? elegir(['A', 'E', 'I', 'O', 'U']) : elegir(['M', 'P', 'S', 'L', 'T', 'R', 'D']) }) });
  if (d >= 5) reglas.push({ habilidad: 'numeros', texto: 'Corta los números PARES', voz: 'Corta los números pares: dos, cuatro, seis, ocho y diez', gen: ok => { let n; do { n = azar(1, 20); } while ((n % 2 === 0) !== ok); return { fruta: frutaCualquiera(), etq: String(n) }; } });
  if (d >= 6) reglas.push({ habilidad: 'multiplicacion', texto: 'Corta los de la TABLA DEL 5', voz: 'Corta los números de la tabla del cinco', gen: ok => { const n = ok ? 5 * azar(1, 10) : 5 * azar(0, 9) + azar(1, 4); return { fruta: frutaCualquiera(), etq: String(n) }; } });
  if (d >= 7) reglas.push({ habilidad: 'multiplicacion', texto: 'Corta las multiplicaciones que dan 12', voz: 'Corta las multiplicaciones que dan doce', gen: ok => ({ fruta: frutaCualquiera(), etq: ok ? elegir(['3×4', '4×3', '2×6', '6×2']) : elegir(['3×3', '2×5', '4×4', '2×7', '3×5', '5×2']) }) });
  if (d >= 8) reglas.push({ habilidad: 'suma', texto: 'Corta las sumas que dan 20', voz: 'Corta las sumas que dan veinte', gen: ok => { let a, b; if (ok) { a = azar(5, 15); b = 20 - a; } else { do { a = azar(5, 15); b = azar(3, 15); } while (a + b === 20); } return { fruta: frutaCualquiera(), etq: `${a}+${b}` }; } });
  return reglas.length > 4 ? reglas.slice(-4) : reglas;
}

function crearFrutas(cont, nino, d, partida) {
  const peque = esPeque(nino);
  // Dificultad
  const OBJETIVO = Math.min((peque ? 4 : 5) + d, 12);
  const factorG = Math.min((peque ? .55 : .62) + (d - 1) * .05, 1.1);
  const intervalo = Math.max(.85, (peque ? 2 : 1.7) - (d - 1) * .12);
  const probDoble = Math.min(.08 + d * .05, .45);

  cont.innerHTML = `<div class="juegoLienzo">
    <div class="hud"><button class="btnVoz" aria-label="Repetir misión">🔊</button><div class="pregunta" id="frutaRegla"></div>
    <div class="hudDcha"><span>Cortadas</span><span id="frutaProg"></span></div></div>
    <canvas aria-label="Zona de frutas"></canvas></div>`;
  const cv = $('canvas', cont), reglaEl = $('#frutaRegla', cont), progEl = $('#frutaProg', cont);
  let { ctx, W, H } = prepararLienzo(cv);
  const regla = elegir(reglasFrutas(nino, d));
  const s = { frutas: [], mitades: [], gotas: [], textos: [], estela: [], pulsado: false, previo: null, hechos: 0, combo: 0, ultimoCorte: 0, prox: 1, pausa: 1.5 };
  let raf, ultimo = performance.now();
  const g = () => H * factorG;

  const pintarProg = () => progEl.textContent = `${s.hechos}/${OBJETIVO}`;
  reglaEl.textContent = '🔪 ' + regla.texto; pintarProg(); hablar(regla.voz);
  $('.btnVoz', cont).onclick = () => hablar(regla.voz);

  function lanzar() {
    const ok = Math.random() < .5, f = regla.gen(ok);
    const x = W * (.15 + Math.random() * .7), vy = -Math.sqrt(2 * g() * H * (.55 + Math.random() * .25));
    s.frutas.push({ ...f, correcta: ok, x, y: H + 40, vx: (W / 2 - x) * (.1 + Math.random() * .2), vy, r: Math.min(38, W * .09), rot: 0, vr: (Math.random() - .5) * 3 });
  }

  function cortar(f) {
    f.cortada = true;
    [-1, 1].forEach(lado => s.mitades.push({ fruta: f.fruta, x: f.x, y: f.y, vx: f.vx + lado * 90, vy: f.vy * .3 - 80, rot: f.rot, vr: lado * 4, r: f.r, lado, vida: 1.2 }));
    const col = COLOR_FRUTA[f.fruta] || '#FFC83D';
    for (let i = 0; i < 14; i++) s.gotas.push({ x: f.x, y: f.y, vx: (Math.random() - .5) * 360, vy: (Math.random() - .5) * 360, vida: .7, c: col });
    registrar(regla.habilidad, f.correcta, nino);
    if (f.correcta) {
      const ahora = performance.now(); s.combo = ahora - s.ultimoCorte < 800 ? s.combo + 1 : 1; s.ultimoCorte = ahora;
      s.hechos++; pintarProg(); Sonido.corte(); Sonido.acierto();
      s.textos.push({ t: s.combo >= 2 ? `¡Combo x${s.combo}!` : (f.etq || '¡Zas!'), x: f.x, y: f.y - 30, c: '#2FB765', vida: 1 });
      if (s.combo >= 2) premiar(1, nino);
      if (s.hechos >= OBJETIVO) { premiar(1, nino); s.frutas.forEach(x => x.cortada = true); setTimeout(() => partida.ganar('¡Misión cumplida!'), 600); }
    } else {
      s.combo = 0;
      s.textos.push({ t: '¡Esa no!', x: f.x, y: f.y - 30, c: '#FF6F59', vida: 1 });
      partida.vidas.perder(); if (partida.vidas.valor > 0) hablar(f.etq ? `El ${f.etq} no` : '¡Esa no!');
    }
  }

  function distSeg(px, py, a, b) {
    const dx = b.x - a.x, dy = b.y - a.y, l = dx * dx + dy * dy || 1;
    const t = limitar(((px - a.x) * dx + (py - a.y) * dy) / l, 0, 1);
    return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
  }

  function actualizar(dt) {
    if (s.pausa > 0) s.pausa -= dt;
    else if (s.hechos < OBJETIVO && (s.prox -= dt) <= 0) { lanzar(); if (Math.random() < probDoble) lanzar(); s.prox = intervalo; }
    s.frutas.forEach(f => { f.x += f.vx * dt; f.y += f.vy * dt; f.vy += g() * dt; f.rot += f.vr * dt; });
    s.frutas = s.frutas.filter(f => !f.cortada && f.y < H + 80);
    s.mitades.forEach(m => { m.x += m.vx * dt; m.y += m.vy * dt; m.vy += g() * dt; m.rot += m.vr * dt; m.vida -= dt; });
    s.mitades = s.mitades.filter(m => m.vida > 0);
    s.gotas.forEach(q => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 600 * dt; q.vida -= dt; });
    s.gotas = s.gotas.filter(q => q.vida > 0);
    s.textos.forEach(t => { t.y -= 40 * dt; t.vida -= dt; }); s.textos = s.textos.filter(t => t.vida > 0);
    const ahora = performance.now(); s.estela = s.estela.filter(p => ahora - p.t < 160);
  }

  function dibujarFruta(f, clip) {
    ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.rot);
    if (clip) { ctx.beginPath(); ctx.rect(clip < 0 ? -f.r * 2 : 0, -f.r * 2, f.r * 2, f.r * 4); ctx.clip(); }
    dibujarFormaFruta(ctx, f.fruta, f.r);
    ctx.restore();
    if (!clip && f.etq) {
      ctx.font = `800 ${f.etq.length > 3 ? 18 : 24}px "Baloo 2", sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const w = ctx.measureText(f.etq).width + 16;
      rectRedondo(ctx, f.x - w / 2, f.y + f.r * .55, w, 28, 10); ctx.fillStyle = '#fff'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = '#1D2142'; ctx.stroke();
      ctx.fillStyle = '#1D2142'; ctx.fillText(f.etq, f.x, f.y + f.r * .55 + 15);
    }
  }

  function dibujar() {
    const grd = ctx.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#5B3A29'); grd.addColorStop(1, '#3E271C');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,.06)'; ctx.lineWidth = 2;
    for (let y = 40; y < H; y += 46) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y + 8); ctx.stroke(); }
    s.gotas.forEach(q => { ctx.globalAlpha = Math.max(q.vida / .7, 0); ctx.fillStyle = q.c; ctx.beginPath(); ctx.arc(q.x, q.y, 5, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;
    s.mitades.forEach(m => { ctx.globalAlpha = Math.min(1, m.vida); dibujarFruta(m, m.lado); }); ctx.globalAlpha = 1;
    s.frutas.forEach(f => dibujarFruta(f));
    if (s.estela.length > 1) {
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (let i = 1; i < s.estela.length; i++) { ctx.strokeStyle = `rgba(255,255,255,${i / s.estela.length})`; ctx.lineWidth = 3 + 9 * i / s.estela.length; ctx.beginPath(); ctx.moveTo(s.estela[i - 1].x, s.estela[i - 1].y); ctx.lineTo(s.estela[i].x, s.estela[i].y); ctx.stroke(); }
    }
    s.textos.forEach(t => textoFlotante(ctx, t));
    if (s.pausa > 0) { ctx.font = '800 28px "Baloo 2", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#FFC83D'; ctx.fillText('¡Prepárate!', W / 2, H / 2); }
  }

  function bucle(t) { const dt = Math.min(.05, (t - ultimo) / 1000); ultimo = t; if (!partida.terminado) actualizar(dt); dibujar(); raf = requestAnimationFrame(bucle); }
  const punto = e => { const rc = cv.getBoundingClientRect(); return { x: e.clientX - rc.left, y: e.clientY - rc.top, t: performance.now() }; };
  cv.addEventListener('pointerdown', e => { s.pulsado = true; s.previo = punto(e); s.estela = [s.previo]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (!s.pulsado || partida.terminado) return;
    const p = punto(e); s.estela.push(p);
    s.frutas.forEach(f => { if (!f.cortada && distSeg(f.x, f.y, s.previo, p) < f.r) cortar(f); });
    s.previo = p;
  });
  const soltar = () => { s.pulsado = false; };
  cv.addEventListener('pointerup', soltar); cv.addEventListener('pointercancel', soltar);
  const alRedimensionar = () => ({ ctx, W, H } = prepararLienzo(cv));
  addEventListener('resize', alRedimensionar);
  raf = requestAnimationFrame(bucle);
  return { destruir() { cancelAnimationFrame(raf); removeEventListener('resize', alRedimensionar); } };
}
