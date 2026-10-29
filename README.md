# Torrujuegos
## Estructura

```
index.html            Pantallas y paneles
privacidad.html       Política de privacidad (editar contacto)
manifest.webmanifest  Datos para instalarlo como app
sw.js                 Funcionamiento sin conexión (subir VERSION al actualizar)
css/estilos.css       Estilos
js/config.js          URL y clave pública de Supabase
js/base.js            Utilidades, sonido, voz, rangos de cálculo
js/datos.js           Niños, edad → dificultad, tiempo diario, habilidades
js/sync.js            Código de familia y sincronización
js/app.js             Navegación, partidas, candado, panel de padres
js/juegos/*.js        Un archivo por juego
iconos/               Logo y iconos de la app
supabase/esquema.sql  Tabla y funciones de Supabase
```

### Cómo se adapta la dificultad

`dificultad = base según la edad + (nivel del juego − 1)`

| Edad | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|
| Contenido | peque | peque | peque | escolar | escolar | escolar | escolar | escolar |
| Base | 1 | 1 | 3 | 1 | 3 | 5 | 7 | 9 |

En el contenido escolar, la dificultad 5 añade multiplicaciones, la 6 series y problemas de dos pasos, y la 7 divisiones. Se ajusta en `BASE_DIFICULTAD` (`js/datos.js`) y `rangosEscolares` (`js/base.js`).

### Probarlo en el ordenador

Abre `index.html` con doble clic. Para probar la instalación como app y el modo sin conexión hace falta servirlo por http, por ejemplo con `python -m http.server` dentro de la carpeta.
