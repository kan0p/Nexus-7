// src/levels/level3.js
// THE ARCHIVES — dot notation + $in.
// Lab id is derived from employee.id carried from N1 so the "trail" feels linked.

import { matchByIds } from "./matchers";
import { pick } from "./rng";

const STATUS_PAIRS = [
  ["FAILED", "TERMINATED"],
  ["FAILED", "ACTIVE"],
  ["TERMINATED", "COMPROMISED"],
];

export const level3 = {
  id: 3,
  codename: "THE ARCHIVES",
  build(carryIn, rng) {
    const labNum = carryIn?.employee?.id
      ? ((carryIn.employee.id * 7) % 12) + 1
      : Math.floor(rng() * 12) + 1;
    const labId = `LAB-${labNum}`;
    const [statusA, statusB] = pick(rng, STATUS_PAIRS);

    // 6 experiments: 2 match, 4 don't
    const matches = [
      { code: "EXP-α", lab: { id: labId,           floor: 3 }, status: statusA,     clearance: 5 },
      { code: "EXP-δ", lab: { id: labId,           floor: 2 }, status: statusB,     clearance: 5 },
    ];
    const nonMatches = [
      { code: "EXP-β", lab: { id: `LAB-${((labNum + 3) % 12) + 1}`, floor: 1 }, status: statusA,     clearance: 3 },
      { code: "EXP-γ", lab: { id: labId,                         floor: 3 }, status: "ACTIVE",     clearance: 5 },
      { code: "EXP-ε", lab: { id: `LAB-${((labNum + 7) % 12) + 1}`, floor: 1 }, status: statusB,     clearance: 2 },
      { code: "EXP-ζ", lab: { id: labId,                         floor: 3 }, status: "COMPLETED",  clearance: 4 },
    ];
    // Filter out accidental matches in the "non-match" bucket
    const cleanNonMatches = nonMatches.filter(
      (n) => !(n.lab.id === labId && (n.status === statusA || n.status === statusB))
    );

    const all = [...matches, ...cleanNonMatches].sort(() => rng() - 0.5);
    const data = all.map((d, i) => ({ _id: i + 1, ...d }));
    const matchIds = data
      .filter((d) => d.lab.id === labId && (d.status === statusA || d.status === statusB))
      .map((d) => d._id);

    const scenario = {
      id: 3,
      codename: "THE ARCHIVES",
      subtitle: "Archivos Históricos Clasificados",
      narrative: `Dos nodos caídos. NEXUS-7 eleva su alerta a NARANJA.
"OMICRON-3" controla los archivos de experimentos.
Los registros que buscas están en documentos con campos anidados.
Necesitas los experimentos del laboratorio "${labId}"
que hayan sido marcados como ${statusA} o ${statusB}.`,
      objective: `Encuentra experimentos donde lab.id sea "${labId}" Y cuyo status sea "${statusA}" o "${statusB}".`,
      collection: "experiments",
      data,
      hints: {
        hint1: "Gzk5Pz7Cs3o7ejk7Nyo1KXo7NDM+Oz41KXo5NTR6NDUuOzkzwqk0eio1KHoqLzQuNSlgen02Ozh0Mz59dHoZNTc4MzQ7NjV6OTU0en4zNHopNTgoP3opLjsuLyl0",
        hint2: "HDUoNztgej44dD8iKj8oMzc/NC4pdDwzND5yIXp9Njs4dDM+fWB6fRYbGHcCfXZ6KS47Li8pYHohen4zNGB6AX0Ja312fQlofQd6J3onc3Q=",
      },
      trap: {
        name: "PULSO EMP",
        msg: "💀 PULSO EMP DETECTADO — APAGANDO SISTEMAS",
        type: "emp",
      },
      accessCode: `OMICRON-8823-${labId}`,
      evaluate: matchByIds(matchIds),
    };

    const carryOut = { ...carryIn, labId };
    return { scenario, carryOut };
  },
};
