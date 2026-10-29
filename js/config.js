/*
 * Configuración de la sincronización entre dispositivos (Supabase).
 *
 * - Si lo dejas vacío, el juego funciona igual, pero cada dispositivo guarda sus propios datos.
 * - Para sincronizar, sigue los pasos del README.md y pega aquí la URL y la clave pública del proyecto.
 *   La clave "anon"/"publishable" es pública por diseño: la seguridad está en las funciones de supabase/esquema.sql.
 */
window.CONFIG = {
  supabaseUrl: 'https://cjtmnqxbpvqlujrogkbl.supabase.co/rest/v1/',     // p. ej. 'https://abcdefghijkl.supabase.co'
  supabaseClave: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqdG1ucXhicHZxbHVqcm9na2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyOTEyOTUsImV4cCI6MjEwODg2NzI5NX0.8G69KO5qbBH1mTwHzoemws3Z8lW9gh6cpUxWqW3TDwI'    // clave pública del proyecto (anon / publishable key)
};
