/* =========================================================================
 * sync.js — sincronización entre dispositivos con un código de familia
 *
 * Modelo: cada familia es una fila en Supabase identificada por el hash de su código.
 * El código es el único secreto (no hay emails ni contraseñas). Se guarda primero en
 * el dispositivo (funciona sin conexión) y se sube/baja en segundo plano.
 * Si dos dispositivos guardan a la vez, se fusionan los datos de cada niño (ver fusionarNino).
 * ========================================================================= */

const ALFABETO_CODIGO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sin O/0, I/1, L para evitar confusiones

/** Código de 15 caracteres aleatorios (~74 bits): imposible de adivinar probando. */
function generarCodigoFamilia() {
  const v = new Uint32Array(15); crypto.getRandomValues(v);
  const c = [...v].map(x => ALFABETO_CODIGO[x % ALFABETO_CODIGO.length]).join('');
  return `TJ-${c.slice(0, 5)}-${c.slice(5, 10)}-${c.slice(10)}`;
}
/** Acepta el código escrito de cualquier manera (minúsculas, sin guiones, con espacios). */
function normalizarCodigo(texto) {
  const limpio = String(texto).toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^TJ/, '');
  if (limpio.length !== 15) return null;
  return `TJ-${limpio.slice(0, 5)}-${limpio.slice(5, 10)}-${limpio.slice(10)}`;
}

/* ---------- Fusión de datos de dos dispositivos ---------- */
const maxPorClave = (a = {}, b = {}) => { const r = { ...a }; Object.entries(b).forEach(([k, v]) => { r[k] = Math.max(r[k] || 0, v); }); return r; };

function fusionarUso(a = {}, b = {}) {
  const r = {};
  new Set([...Object.keys(a), ...Object.keys(b)]).forEach(f => { r[f] = maxPorClave(a[f], b[f]); });
  return r;
}
function fusionarHabilidades(a = {}, b = {}) {
  const r = { ...a };
  Object.entries(b).forEach(([k, h]) => { const x = r[k]; if (!x || (h.ok + h.ko) > (x.ok + x.ko)) r[k] = h; });
  return r;
}
/**
 * Fusiona dos versiones del mismo niño:
 * - ficha (nombre, nacimiento, color, minutos): la editada más recientemente;
 * - progreso: lo mayor de cada dato (estrellas, niveles, pegatinas…);
 * - tiempo de uso: por día y por dispositivo, para que el límite diario sume todos los dispositivos.
 */
function fusionarNino(x, y) {
  x = normalizarNino(x); y = normalizarNino(y);
  const ficha = (y.editado || 0) > (x.editado || 0) ? y : x;
  // Si en un dispositivo se borró el progreso, manda el borrado más reciente (no se suma lo anterior)
  if ((x.reinicio || 0) !== (y.reinicio || 0)) {
    const nuevo = (x.reinicio || 0) > (y.reinicio || 0) ? x : y;
    return { ...ficha, estrellas: nuevo.estrellas, pegatinas: nuevo.pegatinas, especiales: nuevo.especiales, misiones: nuevo.misiones,
      misionesRecientes: nuevo.misionesRecientes, niveles: nuevo.niveles, habilidades: nuevo.habilidades, reinicio: nuevo.reinicio,
      uso: fusionarUso(x.uso, y.uso), extra: maxPorClave(x.extra, y.extra), bloqueo: x.bloqueo === hoy() || y.bloqueo === hoy() ? hoy() : ficha.bloqueo };
  }
  return {
    ...ficha,
    estrellas: Math.max(x.estrellas, y.estrellas),
    pegatinas: x.pegatinas.length >= y.pegatinas.length ? x.pegatinas : y.pegatinas,
    especiales: x.especiales.length >= y.especiales.length ? x.especiales : y.especiales,
    misiones: Math.max(x.misiones, y.misiones),
    misionesRecientes: x.misionesRecientes.length >= y.misionesRecientes.length ? x.misionesRecientes : y.misionesRecientes,
    niveles: maxPorClave(x.niveles, y.niveles),
    habilidades: fusionarHabilidades(x.habilidades, y.habilidades),
    uso: fusionarUso(x.uso, y.uso),
    extra: maxPorClave(x.extra, y.extra),
    bloqueo: x.bloqueo === hoy() || y.bloqueo === hoy() ? hoy() : ficha.bloqueo
  };
}
const datosSincronizables = () => ({ ninos: estado.ninos, eliminados: estado.eliminados });

/**
 * Mezcla los datos remotos en el estado local SIN sustituir los objetos de los niños
 * (los juegos en curso guardan referencias a ellos).
 */
function aplicarRemoto(remoto) {
  if (!remoto) return;
  const eliminados = [...new Set([...(estado.eliminados || []), ...(remoto.eliminados || [])])];
  (remoto.ninos || []).forEach(r => {
    const local = estado.ninos.find(n => n.id === r.id);
    if (local) Object.assign(local, fusionarNino(local, r));
    else estado.ninos.push(normalizarNino(JSON.parse(JSON.stringify(r))));
  });
  estado.ninos = estado.ninos.filter(n => !eliminados.includes(n.id));
  estado.eliminados = eliminados;
  if (estado.activo && !perfilActivo()) estado.activo = null;
}

/* ---------- Cliente de Supabase (llamadas RPC, sin librerías) ---------- */
const Sync = {
  estado: 'local', ultimo: null, temporizador: null, enCurso: false, pendiente: false, ultimaBajada: 0,
  configurado() { return !!(window.CONFIG && CONFIG.supabaseUrl && CONFIG.supabaseClave); },
  activo() { return this.configurado() && !!(estado.familia && estado.familia.codigo); },

  async rpc(funcion, cuerpo) {
    const url = `${CONFIG.supabaseUrl.replace(/\/$/, '')}/rest/v1/rpc/${funcion}`;
    const r = await fetch(url, { method: 'POST', headers: { apikey: CONFIG.supabaseClave, Authorization: `Bearer ${CONFIG.supabaseClave}`, 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) });
    if (!r.ok) throw new Error(`Error ${r.status}`);
    const texto = await r.text();
    return texto ? JSON.parse(texto) : null;
  },

  programar(retraso = 6000) {
    if (!this.activo()) return;
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.subir(), retraso);
  },

  /** Sube los datos; si otro dispositivo guardó antes, fusiona y reintenta. */
  async subir() {
    if (!this.activo()) return false;
    if (this.enCurso) { this.pendiente = true; return false; }
    this.enCurso = true;
    let ok = false;
    try {
      for (let intento = 0; intento < 3 && !ok; intento++) {
        const r = await this.rpc('guardar_familia', { p_codigo: estado.familia.codigo, p_datos: datosSincronizables(), p_version: estado.familia.version || 0 });
        if (r && r.ok) { estado.familia.version = r.version; ok = true; }
        else if (r) { aplicarRemoto(r.datos); estado.familia.version = r.version; alCambiarDatosRemotos(); }
      }
      this.estado = ok ? 'ok' : 'error'; if (ok) this.ultimo = Date.now();
    } catch (e) { this.estado = 'error'; }
    finally {
      this.enCurso = false; guardarLocal();
      if (this.pendiente) { this.pendiente = false; this.programar(1500); }
    }
    return ok;
  },

  /** Baja los datos de la familia y los fusiona. Devuelve false si el código no existe. */
  async bajar() {
    if (!this.activo()) return false;
    try {
      const r = await this.rpc('obtener_familia', { p_codigo: estado.familia.codigo });
      this.ultimaBajada = Date.now();
      if (!r) { this.estado = 'error'; return false; }
      aplicarRemoto(r.datos); estado.familia.version = r.version;
      this.estado = 'ok'; this.ultimo = Date.now(); guardarLocal(); alCambiarDatosRemotos();
      return true;
    } catch (e) { this.estado = 'error'; return false; }
  },
  /** Bajada ligera para refrescar al volver a la app o al menú (como mucho cada 30 s). */
  bajarSiToca() { if (this.activo() && !this.enCurso && Date.now() - this.ultimaBajada > 30000) this.bajar(); },

  async existe(codigo) { const r = await this.rpc('obtener_familia', { p_codigo: codigo }); return r; },
  async borrarFamilia() { await this.rpc('borrar_familia', { p_codigo: estado.familia.codigo }); },

  textoEstado() {
    if (!this.configurado()) return 'La sincronización no está configurada: los datos se guardan solo en este dispositivo.';
    if (!this.activo()) return 'Este dispositivo no está unido a ninguna familia.';
    if (this.estado === 'error') return 'Sin conexión. Se sincronizará al volver la red.';
    if (this.ultimo) return `Sincronizado a las ${new Date(this.ultimo).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.`;
    return 'Pendiente de sincronizar.';
  }
};
