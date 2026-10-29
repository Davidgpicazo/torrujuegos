/*
 * Configuración de la sincronización entre dispositivos (Supabase).
 *
 * - Si lo dejas vacío, el juego funciona igual, pero cada dispositivo guarda sus propios datos.
 * - Para sincronizar, sigue los pasos del README.md y pega aquí la URL y la clave pública del proyecto.
 *   La clave "anon"/"publishable" es pública por diseño: la seguridad está en las funciones de supabase/esquema.sql.
 */
window.CONFIG = {
  supabaseUrl: '',     // p. ej. 'https://abcdefghijkl.supabase.co'
  supabaseClave: ''    // clave pública del proyecto (anon / publishable key)
};
