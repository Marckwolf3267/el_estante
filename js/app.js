// El Estante · versión estática. Los datos viven en data/stories.js (window.STORIES).
let stories = [], featured = [], featuredIndex = 0, currentStory = null;
const $ = id => document.getElementById(id);
function esc(s = "") { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function showStatus(s) { $("status").textContent = s; $("status").classList.remove("hidden"); setTimeout(() => $("status").classList.add("hidden"), 3000); }
function stopSoundtrack() { const pop = $("soundtrackModal"); const player = $("soundtrackModalPlayer"); if (player) player.innerHTML = ""; pop.classList.add("hidden"); pop.classList.remove("minimized"); $("minimizeSoundtrack").textContent = "—"; }

// Navegación: el hash de la URL permite enlazar y usar "atrás" del navegador.
// #/ (mostrador) · #/indice · #/historia/ID
function go(route) { if (location.hash === "#" + route) route$(); else location.hash = route; }
function route$() {
  const h = location.hash.replace(/^#/, "");
  const m = h.match(/^\/historia\/(\d+)$/);
  if (m && stories.some(s => s.id === Number(m[1]))) return openReader(Number(m[1]));
  showView(h === "/indice" ? "index" : "home");
}
function showView(view) {
  if (view !== "reader") { stopSoundtrack(); document.title = "El Estante · Biblioteca de historias"; }
  ["homeView", "indexView", "readerView"].forEach(id => $(id).classList.toggle("hidden", id !== view + "View"));
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (view === "index") renderIndex();
}

function bookMarkup(s) { let img = s.cover ? `<img class="cover-img" src="${esc(s.cover)}" alt="" loading="lazy">` : ""; return `<div class="book" style="--cover:${esc(s.color || "#75472e")}"><div class="book-spine"></div><div class="book-cover">${img}<div class="cover-shade"></div><div class="cover-top">EL ESTANTE · ${esc(s.genre || "HISTORIA")}</div><div class="cover-title">${esc(s.title)}</div><div class="cover-author">${esc(s.author || "Autor desconocido")}</div></div></div>`; }
function tile(s) { return `<button class="tile" data-read="${Number(s.id)}">${bookMarkup(s)}<span class="tile-title">${esc(s.title)}</span><span class="tile-meta">${esc(s.author || "Autor desconocido")} · ${esc(s.genre || "Historia")}</span></button>`; }
function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { let j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function chooseFeatured() { featured = shuffle(stories); featuredIndex = 0; renderFeatured(); }
function renderFeatured() {
  if (!featured.length) { $("featured").innerHTML = '<div class="empty">Aún no hay historias.</div>'; $("featureDesc").textContent = ""; return; }
  const offsets = [-1, 0, 1].filter(offset => featured.length > 1 || offset === 0);
  $("featured").innerHTML = offsets.map(offset => { const idx = (featuredIndex + offset + featured.length) % featured.length, s = featured[idx], active = offset === 0; return `<button class="stage-item ${active ? 'active' : 'side'}" data-feature="${idx}" data-read="${Number(s.id)}" aria-label="${active ? 'Leer' : 'Seleccionar'} ${esc(s.title)}">${bookMarkup(s)}</button>`; }).join("");
  const s = featured[featuredIndex]; $("featureDesc").textContent = `${s.title} · ${s.genre || "Historia"}${s.description ? " — " + s.description : ""}`;
}
function renderIndex() {
  const q = $("search").value.toLowerCase(), g = $("genre").value;
  const list = stories.filter(s => (`${s.title} ${s.author || ""} ${s.genre || ""}`.toLowerCase().includes(q)) && (!g || s.genre === g));
  $("indexGrid").innerHTML = list.length ? list.map(tile).join("") : '<div class="empty">No se encontraron historias.</div>';
  const genres = [...new Set(stories.map(s => s.genre).filter(Boolean))].sort(), old = g;
  $("genre").innerHTML = '<option value="">Todos los géneros</option>' + genres.map(x => `<option>${esc(x)}</option>`).join("");
  $("genre").value = genres.includes(old) ? old : "";
}
function renderAll() { $("previewGrid").innerHTML = stories.length ? shuffle(stories).slice(0, 4).map(tile).join("") : '<div class="empty">Tu estante está vacío.</div>'; renderIndex(); chooseFeatured(); }

function soundtrackEmbed(raw) {
  if (!raw) return null;
  try {
    const u = new URL(raw); let host = u.hostname.toLowerCase();
    if (host === "youtu.be") { const id = u.pathname.split("/").filter(Boolean)[0]; return id ? { src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&loop=1&playlist=${encodeURIComponent(id)}&rel=0`, kind: "youtube", original: u.href } : null; }
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "www.youtube-nocookie.com"].includes(host)) {
      let id = u.searchParams.get("v");
      const path = u.pathname.split("/").filter(Boolean);
      if (!id && ["shorts", "embed", "live"].includes(path[0])) id = path[1];
      if (id) return { src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&loop=1&playlist=${encodeURIComponent(id)}&rel=0`, kind: "youtube", original: u.href };
    }
    if (host === "open.spotify.com" || host === "www.open.spotify.com") {
      // Spotify comparte enlaces localizados como /intl-es/track/ID.
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] && /^intl-[a-z]{2}$/i.test(parts[0])) parts.shift();
      if (parts[0] === "embed") parts.shift();
      if (parts.length >= 2 && ["track", "album", "playlist", "episode", "show", "artist"].includes(parts[0])) return { src: `https://open.spotify.com/embed/${parts[0]}/${encodeURIComponent(parts[1])}?utm_source=generator`, kind: "spotify", original: u.href };
    }
  } catch (e) { }
  return null;
}

function openReader(id) {
  const s = stories.find(x => x.id === Number(id));
  if (!s) { showView("home"); return; }
  stopSoundtrack(); currentStory = s;
  $("readerGenre").textContent = s.genre || "Historia";
  $("readerTitle").textContent = s.title;
  $("readerByline").textContent = (s.author ? "Por " + s.author : "Autor desconocido") + (s.description ? " · " + s.description : "");
  $("readerBody").textContent = s.content || "No se encontró texto.";
  $("reader").style.setProperty("--reader-bg", s.background ? `url("${new URL(s.background, document.baseURI).href}")` : "none"); // absoluta: las url() de variables CSS se resuelven respecto a css/
  document.title = s.title + " · El Estante";
  const embed = soundtrackEmbed(s.soundtrack);
  if (embed) {
    $("soundtrackBox").classList.remove("hidden");
    $("soundtrackPlayer").innerHTML = `<p class="note">♪ La banda sonora está en el reproductor flotante de la esquina.</p>`;
    $("soundtrackModalTitle").textContent = s.title + " · Banda sonora";
    $("soundtrackModalPlayer").innerHTML = `<iframe src="${esc(embed.src)}" title="Banda sonora de ${esc(s.title)}" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
    $("openSoundtrackExternal").onclick = () => window.open(embed.original, "_blank", "noopener,noreferrer");
    $("startSoundtrack").onclick = () => { const frame = $("soundtrackModalPlayer").querySelector("iframe"); if (frame) { const src = frame.src; frame.src = src; } };
    $("soundtrackModal").classList.remove("hidden"); $("soundtrackModal").classList.remove("minimized");
  } else {
    $("soundtrackBox").classList.add("hidden"); $("soundtrackPlayer").innerHTML = ""; $("soundtrackModal").classList.add("hidden");
    if (s.soundtrack) showStatus("No reconocí el enlace de la banda sonora.");
  }
  showView("reader");
}

$("homeBtn").onclick = () => go("/"); $("indexBtn").onclick = () => go("/indice"); $("openIndex").onclick = () => go("/indice"); $("seeAll").onclick = () => go("/indice");
$("prevBtn").onclick = () => { if (featured.length) { featuredIndex = (featuredIndex - 1 + featured.length) % featured.length; renderFeatured(); } };
$("nextBtn").onclick = () => { if (featured.length) { featuredIndex = (featuredIndex + 1) % featured.length; renderFeatured(); } };
$("randomBtn").onclick = chooseFeatured; $("search").oninput = renderIndex; $("genre").onchange = renderIndex;
$("readerBack").onclick = () => go("/indice"); $("readerHome").onclick = () => go("/");
$("closeSoundtrack").onclick = stopSoundtrack;
$("minimizeSoundtrack").onclick = () => { const pop = $("soundtrackModal"); if (pop.classList.contains("minimized")) { pop.classList.remove("minimized"); $("minimizeSoundtrack").textContent = "—"; } else { pop.classList.add("minimized"); $("minimizeSoundtrack").textContent = "□"; } };
document.addEventListener("keydown", e => { if (e.key === "Escape" && currentStory && !$("readerView").classList.contains("hidden")) $("soundtrackModal").classList.add("minimized"); });
document.addEventListener("click", e => {
  const f = e.target.closest("[data-feature]");
  if (f) { const idx = Number(f.dataset.feature); if (idx !== featuredIndex) { featuredIndex = idx; renderFeatured(); return; } }
  const b = e.target.closest("[data-read]"); if (b) go("/historia/" + Number(b.dataset.read));
});
window.addEventListener("hashchange", route$);

stories = (window.STORIES || []).slice().sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "") || b.id - a.id);
renderAll();
route$();

// Giro automático y pausado del carrusel del mostrador.
// Se detiene temporalmente al pasar el cursor, usar teclado o salir del mostrador.
setInterval(() => {
  const stage = document.querySelector('.stage');
  const home = $('homeView');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!stage || !home || home.classList.contains('hidden') || stage.matches(':hover') || stage.contains(document.activeElement) || reduced || featured.length < 2) return;
  featuredIndex = (featuredIndex + 1) % featured.length;
  renderFeatured();
}, 6500);
