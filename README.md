# Torrujuegos

Juegos educativos para niños de 3 a 10 años que se juegan desde el móvil o la tablet, gratis y sin anuncios.

- **Seis juegos:** Peluquería (colores, letras, sílabas, sumas, restas, tablas y problemas de lectura), Bola veloz, Corta frutas, Tuercas, Parejas y Misiones (retos para moverse en casa).
- **Se adapta a la edad:** cada niño se registra con su mes y año de nacimiento. La edad decide el contenido y la dificultad de partida, y al cumplir años sube sola.
- **Varios dispositivos:** con un código de familia, el progreso y el límite de tiempo se comparten entre móviles y tablets.
- **Uso sano de pantallas:** límite diario por niño, aviso de «última partida del día», candado de adulto, misiones fuera de la pantalla que no gastan tiempo y panel de padres con qué habilidades cuestan más.

---

## 1. Subirlo a GitHub (5 minutos)

1. Entra en [github.com/new](https://github.com/new) y crea un repositorio público llamado `torrujuegos`.
2. En el repositorio recién creado, pulsa **«uploading an existing file»**.
3. Arrastra **todo el contenido** de esta carpeta (no la carpeta en sí): `index.html`, `privacidad.html`, `manifest.webmanifest`, `sw.js`, `README.md` y las carpetas `css`, `js`, `iconos` y `supabase`. Pulsa **Commit changes**.
4. Ve a **Settings → Pages**. En *Build and deployment*, elige **Deploy from a branch**, rama **main** y carpeta **/ (root)**. Guarda.
5. En uno o dos minutos el juego estará en:
   **https://davidgpicazo.github.io/torrujuegos/**

Con esto ya funciona, pero cada dispositivo guarda sus propios datos. Para compartir el progreso entre dispositivos, sigue el paso 2.

## 2. Activar la sincronización entre dispositivos (Supabase, gratis)

1. Crea una cuenta en [supabase.com](https://supabase.com) y un proyecto nuevo (plan gratuito). Elige la región **Europe (Frankfurt o París)**, que mantiene los datos en la UE.
2. En el menú del proyecto abre **SQL Editor**, pega todo el contenido de `supabase/esquema.sql` y pulsa **Run**. Debe terminar sin errores.
3. Ve a **Project Settings → API** (o **Data API**) y copia:
   - la **Project URL** (algo como `https://abcdefghijkl.supabase.co`);
   - la clave pública **anon** o **publishable**. *No uses nunca la clave `service_role` ni la `secret`.*
4. En GitHub, abre `js/config.js`, pulsa el lápiz para editar y pega los dos valores:
   ```js
   window.CONFIG = {
     supabaseUrl: 'https://abcdefghijkl.supabase.co',
     supabaseClave: 'eyJhbGciOi...'
   };
   ```
   Guarda con **Commit changes**.
5. Abre `sw.js`, cambia `torrujuegos-v1` por `torrujuegos-v2` y guarda (ver «Actualizar el juego»).

A partir de aquí, la primera pantalla ofrece **«Crear familia»** o **«Ya tengo un código de familia»**.

> **¿Es segura la clave pública en el código?** Sí, es pública por diseño. La tabla no se puede leer directamente; solo se accede a través de tres funciones y siempre conociendo el código de familia, que tiene 15 caracteres aleatorios (imposible de adivinar probando). En la base de datos se guarda la huella SHA-256 del código, no el código.

> **Pausa del plan gratuito:** Supabase pausa los proyectos gratuitos tras una semana sin ninguna actividad. Si nadie juega en una semana, entra en el panel de Supabase y pulsa *Restore* (se puede restaurar hasta un año después, sin perder datos). Con que se juegue algún día cada semana no pasa. Mientras tanto el juego sigue funcionando con los datos guardados en cada dispositivo y sincroniza al volver.

## 3. Pasárselo a otras familias

Envíales el enlace. Cada familia:

1. Abre el enlace en el móvil y lo **instala en la pantalla de inicio**:
   - **Android (Chrome):** menú ⋮ → *Instalar aplicación* (o el botón «Instalar» que aparece en el juego).
   - **iPhone/iPad (Safari):** botón Compartir ⬆️ → *Añadir a pantalla de inicio*.

   Es importante: en iPhone, Safari puede borrar los datos de una web que no se visita en 7 días si no está instalada.
2. Pulsa **«Crear familia»**, añade a sus hijos y guarda el **código de familia**.
3. En cada dispositivo adicional (tablet, móvil de la tía…) pulsa **«Ya tengo un código de familia»** y lo escribe.

Cada familia solo ve a sus propios niños.

## 4. Actualizar el juego

Cada vez que cambies algún archivo, abre `sw.js` y sube el número de `VERSION` (`torrujuegos-v2`, `-v3`…). Si no, los móviles que ya lo tienen instalado seguirán usando la versión guardada.

## 5. Privacidad

Al usar la sincronización guardas datos de menores de otras familias (apodo, mes y año de nacimiento y progreso), así que eres responsable de ese tratamiento.

- Edita `privacidad.html` y pon **tu nombre y un email de contacto** donde pone `EDITAR`.
- El juego pide el consentimiento del padre, madre o tutor al crear la familia y permite borrar los datos de internet desde *Padres → Familia*.
- No se piden emails ni otros datos, y se recomienda usar apodos.

Esto no es asesoramiento legal. Si el proyecto crece, conviene revisarlo con alguien que conozca el RGPD.

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
