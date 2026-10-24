# IBB Villa Pueyrredón

Sistema de la Iglesia Bautista Villa Pueyrredón:

- **Sitio para la congregación** (solo lectura): video de YouTube de cada reunión, de qué se habló, canciones con letra para practicar, versículos y anuncios.
- **Panel del equipo** con usuarios y áreas: pastor, alabanza, multimedia, transmisión y anuncios.
- **Proyector**: una pantalla a pantalla completa para la PC conectada al proyector y un control remoto (desde otra PC, tablet o celular) para pasar letras y versículos en vivo.
- **Biblia**: búsqueda por cita (`Juan 3:16`) o por palabras.

Stack: **Next.js 16** (TypeScript) y **Supabase** (PostgreSQL, login, archivos y tiempo real).

---

## Publicarlo gratis (unos 15 minutos)

Se usan dos servicios con plan gratuito: **Supabase** para la base de datos y **Vercel** para la web.

### 1. Base de datos en Supabase

1. Entrá a <https://supabase.com>, creá una cuenta y tocá **New project**.
   - Región: **South America (São Paulo)**.
   - Guardá la contraseña de la base.
2. En el proyecto, andá a **SQL Editor → New query**, pegá **todo** el archivo [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) y tocá **Run**.
3. Andá a **Project Settings → API Keys** y copiá:
   - **Project URL**, que va en `NEXT_PUBLIC_SUPABASE_URL`.
   - **Publishable key**, que va en `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Si tu proyecto muestra la *anon key*, sirve igual.

### 2. Web en Vercel

1. Entrá a <https://vercel.com/new> e ingresá con tu cuenta de GitHub.
2. Importá el repositorio **`luiscornejocornejo/ibb`**.
3. En **Environment Variables** cargá las dos variables del paso anterior.
4. Tocá **Deploy**. Te queda una URL tipo `https://ibb-xxxx.vercel.app`, que después podés cambiar por un dominio propio.

> Vercel publica la rama `main`. Mientras el código esté en otra rama, Vercel genera una URL de *preview* de esa rama.

### 3. Conectar el login con la URL

En Supabase, andá a **Authentication → URL Configuration** y poné la URL de Vercel en **Site URL**. Así los emails de confirmación llevan al sitio correcto.

### 4. Crear al pastor (administrador)

1. Entrá a `https://TU-URL/login`, tocá **Registrate** y confirmá el email.
2. En Supabase, en el **SQL Editor**, corré:

   ```sql
   update perfiles set roles = '{pastor}' where email = 'email-del-pastor@ejemplo.com';
   ```

3. Desde ahí, el pastor asigna áreas a los demás en **Panel → Usuarios y áreas**. Cada encargado se registra solo en `/login`.

### 5. Cargar la Biblia

La tabla `biblia` arranca vacía. Hay que cargar un JSON con el texto:

```bash
cp .env.example .env.local   # completar URL y SUPABASE_SECRET_KEY (Project Settings → API Keys → Secret key)
npm install
node --env-file=.env.local scripts/cargar-biblia.mjs biblia.json RV1909
```

Los formatos de JSON aceptados están explicados al principio de [`scripts/cargar-biblia.mjs`](scripts/cargar-biblia.mjs).

> **Licencia:** la **Reina-Valera 1909** es de dominio público. La **RVR 1960** tiene derechos de las Sociedades Bíblicas Unidas; para publicarla en el sitio hace falta su permiso.

---

## Cómo se usa

| Quién | Dónde | Qué hace |
|---|---|---|
| Congregación | `/`, `/reuniones`, `/biblia` | Ve el video, el tema, las canciones, los versículos y los anuncios |
| Multimedia / Transmisión | Panel → Reuniones | Crea la reunión del domingo: fecha, tema, predicador, URL de YouTube y portada |
| Alabanza | Panel → Canciones y Reuniones | Carga las letras (estrofas separadas por una línea en blanco) y arma la lista del domingo |
| Multimedia | Panel → Reuniones | Agrega los versículos que va a usar el pastor |
| Anuncios | Panel → Anuncios | Publica anuncios con fecha desde y hasta, y con imagen |
| Pastor | Panel → Usuarios y áreas | Asigna áreas. Puede hacer todo lo anterior |

### Proyector el domingo

1. En la PC conectada al proyector, abrí `https://TU-URL/proyector` en el navegador, movelo a la pantalla del proyector y hacé **doble clic** para ponerlo en pantalla completa.
2. En otra PC, tablet o celular, abrí `https://TU-URL/proyector/control` con tu usuario.
3. Tocá una estrofa o un versículo y aparece al instante en el proyector.
   - Las flechas **← →** o la **barra espaciadora** pasan a la siguiente.
   - **Esc** deja la pantalla en negro.
   - Si el pastor pide un versículo en el momento, escribilo en el buscador (por ejemplo `Romanos 8:28`) y se agrega a la lista.

### Transmisión en vivo

La cámara y el audio se transmiten con **OBS Studio** (<https://obsproject.com>, gratis), conectado a YouTube con la clave de transmisión del canal. El encargado de transmisión pega la URL del vivo en la reunión del domingo y así aparece en la página principal.

---

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con los datos de Supabase
npm run dev                  # http://localhost:3000
```

### Estructura

```
supabase/migrations/   Esquema de la base de datos, roles y permisos (RLS)
scripts/               Carga de la Biblia
src/app/(sitio)/       Páginas públicas: inicio, reuniones, biblia
src/app/admin/         Panel del equipo y acciones del servidor
src/app/proyector/     Pantalla del proyector y control en vivo
src/app/login/         Ingreso y registro
src/lib/               Clientes de Supabase, permisos, Biblia y utilidades
```

Los permisos se aplican en la base de datos con Row Level Security. Aunque alguien llame a la API directamente, solo puede editar lo que le corresponde a su área.

## Próximos pasos

- Preguntas sobre la Biblia con IA, con respuestas que citan versículos.
- Crear el evento de YouTube desde el panel usando la API de YouTube.
- Controlar OBS desde el panel con obs-websocket.
- Mostrar anuncios en el proyector antes de que empiece la reunión.
