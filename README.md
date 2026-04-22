# NEXUS-7

**Escape room cyberpunk para aprender MongoDB.** Infiltrás la corporación NEXUS-7 resolviendo 5 nodos de queries, cada uno custodiado por una IA. Los nodos están encadenados — lo que descubrís en uno se usa en el siguiente — y las variantes cambian entre partidas.

Hecho con React + Mingo (motor de queries MongoDB en el navegador) + Xterm.js. Ranking persistido en SQLite vía un backend Node chico.

---

## Jugar

### Opción A — Docker (todo incluido, con ranking)

Requiere Docker Desktop.

```bash
docker compose up --build
```

Abrí http://localhost:8080. Los puntajes se guardan en un volumen de Docker y persisten entre reinicios.

### Opción B — Online (solo juego, sin ranking)

Si hay deploy estático activo: https://kan0p.github.io/Nexus-7

---

## Cómo se juega

- **3 vidas.** 3 errores seguidos en un nodo disparan una trampa y descuentan una vida.
- **6 nodos.** Cada uno exige un operador MongoDB distinto:

  | # | Nombre        | Operador principal         |
  | - | ------------- | -------------------------- |
  | 1 | THE ENTRYWAY  | equality (match por campos)|
  | 2 | DATA VAULT    | `$gt` + `$in`              |
  | 3 | THE ARCHIVES  | dot notation + `$in`       |
  | 4 | NEURAL LINK   | `$lookup` + `$match`       |
  | 5 | THE CORE      | `$group` + `$sum`          |
  | 6 | DEAD DROP     | `$regex` + equality        |

- **Encadenado.** Lo que descubrís en un nodo se usa narrativamente en el siguiente: el empleado del N1 determina el sector del N2, su id deriva el lab del N3, lidera el proyecto comprometido del N4, y ese proyecto reaparece en N5 y N6.
- **Variantes.** Cada partida baraja datos y elige una variante distinta por nodo. No memorizás — tenés que resolver de nuevo.
- **Ranking.** Al ganar o perder se registra tu puntaje con tu handle y se muestra el top 10. También accesible desde la intro con `[ RANKING ]`.

## Sistema de puntaje

El puntaje es **independiente de las vidas** — podés perder y aun así terminar con score alto, y podés ganar con score bajo si tardaste mucho o usaste muchas pistas. Valores definidos en [`src/scoring.js`](src/scoring.js):

| Evento                                   | Delta al score |
| ---------------------------------------- | -------------- |
| Nodo resuelto                            | **+1000**      |
| Bonus por velocidad (solución ≤ 20 s)    | **+500**       |
| Bonus por velocidad (20 s → 2 min)       | +500 → 0 (lineal) |
| Bonus por velocidad (> 2 min)            | 0              |
| Query incorrecta                         | **−75**        |
| Cada click a pista 1 o pista 2           | **−50**        |
| Trampa activada (cada vez que perdés vida) | **−300**    |

El score se _clampea_ a 0 como piso (nunca negativo). Penalizaciones acumulan: si pedís 10 pistas en un mismo nodo, son −500.

**Cálculo del bonus de velocidad** ([scoring.js:23](src/scoring.js#L23)):

```
bonus = 500                                   si elapsed ≤ 20 s
bonus = 0                                     si elapsed ≥ 120 s
bonus = 500 * (120 - elapsed) / 100           en el rango intermedio
```

**Atajos de la terminal**

- `hint1` / `hint2` — revela pistas (penaliza igual que los botones).
- `clear` — limpia la pantalla.
- Flechas `↑` `↓` — historial de queries.

---

## Stack

- **Frontend:** React 18, [Mingo](https://github.com/kofrasa/mingo) (motor de queries MongoDB en el navegador), [Xterm.js](https://xtermjs.org/), Web Audio API + `<audio>` MP3 para los sonidos.
- **Backend:** Node 24, Express, [better-sqlite3](https://github.com/WiseLibs/better-sqlite3).
- **Infra:** Docker Compose (web + server + volumen SQLite), nginx sirve el build y proxyea `/api/` al backend.
- **CI:** GitHub Actions con Node 24, deploy automático del frontend estático a GitHub Pages.

---

## Desarrollo

### Requisitos

- Node 24 (recomendado, es la versión usada por CI y los contenedores).
- Docker (opcional, para probar el stack completo con backend + SQLite).

### Frontend

```bash
npm install
npm start        # http://localhost:3000
```

### Backend

```bash
cd server
npm install
npm start        # http://localhost:3001
```

Para que el frontend use el backend local, creá un `.env.local` en la raíz:

```
REACT_APP_RANKING_BASE=http://localhost:3001
```

Si no hay backend, el juego funciona igual — los endpoints fallan en silencio y no aparece ranking.

---

## Agregar un nivel

La arquitectura está pensada para extenderse sin tocar el motor. Cada nivel es un archivo en [`src/levels/`](src/levels/) que exporta un `LevelDefinition`:

```js
// src/levels/level6.js
import { matchByIds } from "./matchers";

export const level6 = {
  id: 6,
  codename: "MI NIVEL",
  build(carryIn, rng) {
    const scenario = {
      id: 6,
      codename: "MI NIVEL",
      subtitle: "...",
      narrative: "...",
      objective: "Encuentra X.",
      collection: "foo",
      data: [ /* documentos */ ],
      hints: { hint1: "...", hint2: "..." },
      trap: { name: "X", msg: "...", type: "electric" },
      accessCode: "XYZ-000",
      evaluate: matchByIds([/* _ids esperados */]),
    };
    return { scenario, carryOut: { ...carryIn, algoNuevo: 42 } };
  },
};
```

Importalo y pushealo al array `LEVELS` en [`src/levels/registry.js`](src/levels/registry.js). No hay que tocar el evaluator, el HUD ni `App.jsx`.

El objeto `carryIn` son los datos que produjo el nivel anterior. Úsalos para variar tu nivel (por ejemplo, dejar que el dept del empleado encontrado en el N1 determine el sector de las transacciones del N2).

Matchers disponibles en [`src/levels/matchers.js`](src/levels/matchers.js):

- `matchByIds(ids)` — find queries.
- `matchAggregationGroups(keys)` — `$group` aggregations.
- `allOf(...matchers)` — composición AND.

---

## API del ranking

| Método | Ruta                     | Descripción                                   |
| ------ | ------------------------ | --------------------------------------------- |
| GET    | `/api/health`            | Healthcheck                                   |
| GET    | `/api/ranking?limit=10`  | Top N runs por score descendente              |
| GET    | `/api/ranking/best`      | Mejor run único                               |
| POST   | `/api/ranking`           | Registra un run                               |

El `POST` espera:

```json
{
  "name": "HANDLE",
  "score": 4500,
  "outcome": "victory",
  "nodesCompleted": 5,
  "errors": 3,
  "hints": 1,
  "durationMs": 182000
}
```

---

## Estructura

```
├── Dockerfile              — Frontend (build + nginx)
├── nginx.conf              — SPA fallback + proxy /api/
├── docker-compose.yml      — web + server + volumen SQLite
├── server/                 — Backend Node + better-sqlite3
│   ├── Dockerfile
│   ├── package.json
│   └── index.js
└── src/
    ├── App.jsx             — Máquina de estados + scoring + timing
    ├── scoring.js          — Reglas de puntaje
    ├── components/         — HUD, paneles, terminal, intro, endings, ranking
    ├── levels/             — Registro, matchers, un archivo por nivel
    ├── hooks/              — useQueryEvaluator
    ├── ranking/            — Cliente fetch del ranking
    ├── sounds/             — Motor de Web Audio
    └── styles/             — Scanlines, glitch, neón
```

---

## Créditos

Hecho por [kan0p](https://github.com/kan0p).
