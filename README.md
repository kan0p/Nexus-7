# NEXUS-7 // MongoDB Escape Room

Juego educativo tipo escape room para practicar MongoDB queries. Ambientación cyberpunk, 5 nodos de dificultad progresiva, sistema de vidas y trampas.

## Stack

- React 18
- [Mingo](https://github.com/kofrasa/mingo) — motor de queries MongoDB real en JS (sin backend)
- [Xterm.js](https://xtermjs.org/) — terminal interactiva auténtica
- Web Audio API — todos los sonidos generados programáticamente

## Instalación local

```bash
npm install
npm start
```

## Build y deploy en GitHub Pages

1. En `package.json`, cambia `"homepage": "."` por tu URL de GitHub Pages:
   ```json
   "homepage": "https://tu-usuario.github.io/nexus7"
   ```

2. Instala gh-pages (ya incluido en devDependencies):
   ```bash
   npm install
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

Esto hace el build y lo sube automáticamente a la rama `gh-pages` de tu repo.

## Estructura del proyecto

```
src/
├── components/
│   ├── HUD.jsx            — Barra superior: vidas, errores, progreso
│   ├── NarrativePanel.jsx — Historia del nodo + botones de pista
│   ├── DataPanel.jsx      — Colección de documentos con syntax highlighting
│   ├── Terminal.jsx       — Terminal xterm.js con historial de comandos
│   ├── TrapOverlay.jsx    — Animación de trampa fullscreen
│   ├── IntroScreen.jsx    — Pantalla de introducción cinemática
│   └── EndScreens.jsx     — Game Over y Victory screens
├── data/
│   └── nodes.js           — Los 5 nodos: narrativa, datos, soluciones, trampas
├── hooks/
│   └── useQueryEvaluator.js — Evaluador de queries con Mingo
├── sounds/
│   └── audioEngine.js     — Todos los sonidos via Web Audio API
└── styles/
    └── global.css         — Estilos cyberpunk: scanlines, glitch, neón
```

## Cómo agregar más nodos

Edita `src/data/nodes.js` y agrega un objeto al array `NODES` siguiendo el mismo esquema. Para nodos de tipo `find`, define `expectedIds`. Para nodos de `aggregate`, define `expectedGroups`.

## Mecánicas

- **3 errores en un nodo** → se activa la trampa → pierdes 1 vida
- **0 vidas** → Game Over
- **5 nodos completados** → Victoria
- **Pistas**: escribe `hint1` o `hint2` en la terminal, o usa los botones del panel
- **Historial**: flechas ↑↓ en la terminal para navegar comandos anteriores
