# Para mi Pricesa 🌻

Un regalo web para Andrea: **21 de septiembre, Día de las Flores Amarillas**.
Un campo de girasoles brillantes que se tocan uno a uno, cada uno con un mensaje
de amor, hasta llegar a un final con sorpresa (partículas doradas, lluvia de
flores y música).

## Lo que incluye

- 🌻 **Pantalla de carga** con girasol gigante y barra de progreso
- 💛 **Explicación** de qué significa regalar flores amarillas el 21 de septiembre
- 🌷 **Campo de girasoles** que brillan, se mecen y lanzan destellos al tocarlos
- 💌 **15 mensajes** de amor (edítalos en `js/main.js`)
- 🎵 **Música de fondo** estilo cajita musical + soniditos al tocar (botón 🔊)
- ✨ **Final sorpresa**: "Te amo, Andrea" con confeti dorado y pétalos cayendo

## Cómo hostearlo GRATIS

Solo necesitas subir la carpeta (HTML/CSS/JS, no requiere servidor).

### Opción 1 · Netlify (más fácil, arrastrar y soltar)
1. Entra a https://app.netlify.com/drop
2. Arrastra la carpeta `sunflowers-gift/` sobre la página
3. ¡Listo! Te da un enlace tipo `https://nombre.netlify.app` que puedes compartir con Andrea

### Opción 2 · Vercel
1. Entra a https://vercel.com → *New Project*
2. Sube/importa la carpeta y pulsa **Deploy**
3. Copia el enlace `https://...vercel.app`

### Opción 3 · GitHub Pages
1. Crea un repo y sube estos archivos
2. Configuración → Pages → selecciona la rama `main` y carpeta `/ (root)`
3. Se publica en `https://tuusuario.github.io/nombre-repo`

> Cada plan tiene re-buildeo gratis; para esta ocasión, la **Opción 1 (Netlify Drop)**
> es la más rápida si ya tienes el regalo listo hoy.

## Cómo personalizarlo

Abre `js/main.js` al inicio del archivo:

```js
// LISTA "MSG": cambia o agrega frases (una por girasol)
// SUSTITUYE "Andrea" por su nombre real en index.html (aparece en el campo y en el final)
```

- Edita las **frases** dentro de `MSG` (cada una = un girasol; se pueden agregar o quitar).
- Cambia los apodos (pricesa, amor, mi niña) ahí mismo o en `index.html`.
- El nombre se cambia en `index.html` (título "Andrea 💛" y "Te amo, Andrea").
- Los colores se ajustan en `css/style.css` (variables al inicio del archivo).

## Probar en local

```bash
cd sunflowers-gift
python3 -m http.server 8000
# abre http://localhost:8000
```