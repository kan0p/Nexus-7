// src/levels/level6.js
// DEAD DROP — $regex + equality. After the core falls, NEXUS-7's comms
// archive is exposed. The player recovers encrypted dead-drop messages
// mentioning the compromised project before auto-wipe kicks in.

import { matchByIds } from "./matchers";
import { pick } from "./rng";

const KEYWORDS_FALLBACK = ["PHANTOM", "LAZARUS", "AURORA", "OBELISK", "CHIMERA"];

export const level6 = {
  id: 6,
  codename: "DEAD DROP",
  build(carryIn, rng) {
    // Keyword is the second word of the compromised project from N4,
    // uppercased (e.g. "Project Phantom" -> "PHANTOM"). Fall back to a
    // random option if carry is missing so the level works standalone.
    const projectCode = carryIn?.projectCode;
    const keyword = projectCode
      ? projectCode.split(" ").pop().toUpperCase()
      : pick(rng, KEYWORDS_FALLBACK);

    const leaderName = carryIn?.employee?.name ?? "Arca Delvis";

    // 2 correct rows: keyword appears in message AND flags === "ENCRYPTED"
    const matches = [
      { from: leaderName, to: "DEAD-DROP-7",
        message: `Transfer ${keyword} assets to sector 12`, flags: "ENCRYPTED" },
      { from: leaderName, to: "DEAD-DROP-9",
        message: `${keyword} cache active, backup pending`, flags: "ENCRYPTED" },
    ];
    // 4 decoys: each breaks exactly one of the two conditions
    const nonMatches = [
      { from: "AUTO",       to: "ALL",          message: `${keyword} daily log`,        flags: "PUBLIC"    },
      { from: leaderName,   to: "DEAD-DROP-3",  message: "Routine checkin",             flags: "ENCRYPTED" },
      { from: "AUTO",       to: "LOG",          message: "System heartbeat OK",         flags: "PUBLIC"    },
      { from: leaderName,   to: "DEAD-DROP-5",  message: "Delete all trace footprints", flags: "ENCRYPTED" },
    ];

    const all = [...matches, ...nonMatches].sort(() => rng() - 0.5);
    const data = all.map((m, i) => ({ _id: i + 1, ...m }));
    const matchIds = data
      .filter((d) => d.message.includes(keyword) && d.flags === "ENCRYPTED")
      .map((d) => d._id);

    const scenario = {
      id: 6,
      codename: "DEAD DROP",
      subtitle: "Archivo de Comunicaciones Expuesto",
      narrative: `El núcleo cayó. Mientras NEXUS-7 colapsa,
su archivo de comunicaciones queda expuesto por unos segundos.
${leaderName} usó este canal como dead drop encriptado.
Recuperá los mensajes que mencionen "${keyword}"
antes de que el backup automático los borre.`,
      objective: `Encuentra mensajes cuyo message contenga "${keyword}" (usa $regex) Y cuyo flags sea "ENCRYPTED".`,
      collection: "comms",
      data,
      hints: {
        hint1: "DynCu3p+KD89PyJ6KTU4KD96Nz8pKTs9P3oqOyg7ejgvKTk7KHo2O3oqOzY7OCg7ejk2Oyw/dnojei80O3ozPS87Nj47PnopMzcqNj96PzR6PDY7PSl0",
        hint2: "HDUoNztgej44dDk1NzcpdDwzND5yIXo3PykpOz0/YHohen4oPz0/ImB6fQobFhsYCBt9eid2ejw2Oz0pYHp9HxQZCAMKDh8efXonc3Q=",
      },
      trap: {
        name: "AUTO-WIPE",
        msg: "🗑 BACKUP ACTIVADO — ARCHIVO BORRADO",
        type: "virus",
      },
      accessCode: `NEMESIS-9999-${keyword}`,
      evaluate: matchByIds(matchIds),
    };

    const carryOut = { ...carryIn, dead_drop: "RECOVERED", keyword };
    return { scenario, carryOut };
  },
};
