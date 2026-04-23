// src/levels/level5.js
// THE CORE — $group + $sum aggregation over reactors.

import { matchAggregationGroups } from "./matchers";
import { pick } from "./rng";

const REACTOR_TYPE_SETS = [
  ["FUSION", "FISSION", "DARK"],
  ["FUSION", "ANTIMATTER", "PLASMA"],
  ["FISSION", "DARK", "PLASMA", "ZERO-POINT"],
];

export const level5 = {
  id: 5,
  codename: "THE CORE",
  build(carryIn, rng) {
    const types = pick(rng, REACTOR_TYPE_SETS);

    // 2 reactors per type, random energy values
    const reactors = [];
    let idSeq = 1;
    for (const t of types) {
      for (let k = 0; k < 2; k++) {
        reactors.push({
          _id: idSeq++,
          name: `R-${t.slice(0, 3)}-${k + 1}`,
          type: t,
          energyTW: Math.round((1 + rng() * 9) * 10) / 10,
          status: rng() > 0.3 ? "ONLINE" : "CRITICAL",
        });
      }
    }
    // Shuffle display order
    reactors.sort(() => rng() - 0.5);

    const scenario = {
      id: 5,
      codename: "THE CORE",
      subtitle: "Núcleo Central — NEXUS-7",
      narrative: `Estás en el corazón de NEXUS-7.
La IA maestra "OMEGA-CORE" controla los reactores.
${carryIn?.projectCode ? `El proyecto comprometido ${carryIn.projectCode} desviaba potencia desde aquí.` : ""}
Para apagarla necesitas calcular el consumo total de energía
agrupado por tipo de reactor.
Si los números no cuadran, el sistema activa la autodestrucción.`,
      objective: `Agrupa los reactores por "type" y calcula la suma total de "energyTW" para cada tipo.`,
      collection: "reactors",
      data: reactors,
      hints: {
        hint1: "DynCu3o7PT0oPz07Lj96OTU0en49KDUvKmB6Oz0oLyrCu3oqNSh6fX4uIyo/fXojeikvN8K7en0/ND8oPSMODX10",
        hint2: "HDUoNztgej44dCg/OzkuNSgpdDs9PSg/PTsuP3IBIXp+PSg1LypgeiF6BTM+YHp9fi4jKj99dnouNS47NmB6IXp+KS83YHp9fj80Pyg9Iw4NfXoneid6JwdzdA==",
      },
      trap: {
        name: "AUTODESTRUCCIÓN",
        msg: "💥 SECUENCIA DE AUTODESTRUCCIÓN INICIADA",
        type: "selfdestruct",
      },
      accessCode: "OMEGA-0001-CORE",
      evaluate: matchAggregationGroups(types),
    };

    const carryOut = { ...carryIn, core: "SHUTDOWN" };
    return { scenario, carryOut };
  },
};
