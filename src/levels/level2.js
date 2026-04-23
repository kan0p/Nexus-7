// src/levels/level2.js
// DATA VAULT — $gt + $in over transactions.
// Uses carry.employee.department as ONE of the sectors the player must match,
// so solving N1 narrows the options in N2 narratively.

import { matchByIds } from "./matchers";
import { pick } from "./rng";

const SECTOR_POOL = ["ARMS", "BIOTECH", "ENERGY", "CRYPTO", "LOGISTICS"];

// Variant thresholds — always round numbers the player can see in the data
const THRESHOLDS = [300000, 500000, 700000];

export const level2 = {
  id: 2,
  codename: "DATA VAULT",
  build(carryIn, rng) {
    // Tie sector set to the employee's department when possible
    const deptAsSector = (carryIn?.employee?.department || "").toUpperCase();
    const primarySector = SECTOR_POOL.includes(deptAsSector)
      ? deptAsSector
      : pick(rng, SECTOR_POOL);
    const secondarySector = pick(
      rng,
      SECTOR_POOL.filter((s) => s !== primarySector)
    );
    const targetSectors = [primarySector, secondarySector];

    const threshold = pick(rng, THRESHOLDS);

    // Build 6 transactions: 3 must match, 3 must not
    const matches = [
      { amount: threshold + 200000, sector: primarySector,   status: "CLEARED" },
      { amount: threshold + 370000, sector: secondarySector, status: "CLEARED" },
      { amount: threshold + 60000,  sector: primarySector,   status: "CLEARED" },
    ];
    const nonMatches = [
      { amount: threshold - 160000, sector: secondarySector, status: "PENDING" },
      { amount: threshold + 120000, sector: pick(rng, SECTOR_POOL.filter(s => !targetSectors.includes(s))), status: "CLEARED" },
      { amount: threshold - 405000, sector: primarySector,   status: "FLAGGED" },
    ];

    const all = [...matches, ...nonMatches].sort(() => rng() - 0.5);
    const data = all.map((t, i) => ({
      _id: i + 1,
      ref: `TX-${String(i + 1).padStart(3, "0")}`,
      ...t,
    }));
    const matchIds = data.filter((d) => matches.some((m) =>
      m.amount === d.amount && m.sector === d.sector && m.status === d.status
    )).map((d) => d._id);

    const employeeName = carryIn?.employee?.name || "el operario infiltrado";

    const scenario = {
      id: 2,
      codename: "DATA VAULT",
      subtitle: "Bóveda Financiera Sector 7",
      narrative: `Acceso concedido al primer nodo. Con las credenciales de ${employeeName} avanzas hacia el Vault.
La IA "SIGMA-2" protege registros financieros clasificados.
Los auditores internos sospechan de transacciones anómalas.
Debes localizar todas las transferencias mayores a ${threshold.toLocaleString("en-US")} créditos
que pertenezcan a los sectores "${primarySector}" o "${secondarySector}".`,
      objective: `Filtra las transacciones con amount > ${threshold} Y cuyo sector sea "${primarySector}" o "${secondarySector}".`,
      collection: "transactions",
      data,
      hints: {
        hint1: "Dym7ei80ejUqPyg7PjUoej4/ejk1Nyo7KDs5M6k0eio7KDt6PzZ6NzU0LjV6I3o1Lig1eio7KDt6LzQ7ejYzKS47ej4/ejUqOTM1ND8pdHoMOzR6Pj80Lig1ej4/NnosOzY1KHZ6NDV6OTU3NXoxPyN6KigzNDkzKjs2dA==",
        hint2: "HDUoNzt6PT80sygzOTtgeiF6OTs3KjVgeiF6fjUqPyg7PjUoYHosOzY1KHoneid0ego7KDt6NjMpLjspei8pu3ovNHo7KCg7I3Q=",
      },
      trap: {
        name: "VIRUS DE CORRUPCIÓN",
        msg: "☣ VIRUS INYECTADO — DATOS CORROMPIDOS",
        type: "virus",
      },
      accessCode: `SIGMA-4491-${primarySector}`,
      evaluate: matchByIds(matchIds),
    };

    const carryOut = {
      ...carryIn,
      sector: primarySector,
      cleared: matchIds,
    };

    return { scenario, carryOut };
  },
};
