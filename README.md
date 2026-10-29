# El Estante (versión estática)

Sitio 100 % HTML + CSS + JavaScript. No necesita PHP, MySQL ni servidor propio: sirve para GitHub Pages.

## Estructura
- `index.html` – la página.
- `css/style.css`, `js/app.js` – estilos y lógica.
- `data/stories.js` – **aquí viven las historias** (antes estaban en MySQL).
- `img/covers/` y `img/backgrounds/` – portadas y fondos de lectura.

## Publicar en GitHub Pages
1. Sube el contenido de esta carpeta a un repositorio (el `index.html` en la raíz).
2. En *Settings → Pages* elige la rama `main` y la carpeta `/ (root)`.
3. Si usas dominio propio, añade un archivo `CNAME` con el dominio.

## Añadir o editar una historia (a mano)
1. Copia la portada a `img/covers/` y el fondo a `img/backgrounds/`.
2. En `data/stories.js` añade un objeto al arreglo con estos campos:

```js
{
  id: 14,                       // número único
  title: "Título",
  author: "Autor",
  genre: "Terror",
  color: "#75472e",             // color de la pasta
  description: "Sinopsis breve",
  cover: "img/covers/mi-portada.jpeg",       // o null
  background: "img/backgrounds/mi-fondo.jpeg", // o null
  soundtrack: "https://open.spotify.com/track/...", // Spotify/YouTube, o null
  created_at: "2026-10-30 12:00:00",         // define el orden del índice (más nuevo primero)
  content: "Texto completo de la historia…"  // los saltos de línea se respetan
}
```

Para abrir una historia directamente: `https://tu-dominio/#/historia/14`
