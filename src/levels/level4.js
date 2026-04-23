// src/levels/level4.js
// NEURAL LINK — $lookup + $match. The compromised project in this level
// is led by the employee carried from N1.

import { matchByIds } from "./matchers";

const PROJECT_NAMES = [
  "Project Lazarus",
  "Project Phantom",
  "Project Aurora",
  "Project Obelisk",
  "Project Chimera",
];

export const level4 = {
  id: 4,
  codename: "NEURAL LINK",
  build(carryIn, rng) {
    const leaderId = carryIn?.employee?.id ?? 1;
    const leaderName = carryIn?.employee?.name ?? "Operario Desconocido";
    const leaderDept = carryIn?.employee?.department ?? "Core";

    const shuffledNames = [...PROJECT_NAMES].sort(() => rng() - 0.5);
    const compromisedName = shuffledNames[0];
    const otherNames = shuffledNames.slice(1, 3);

    // Employees collection: the leader + 2 decoys
    const decoyEmployees = [
      { _id: 11, name: "Marcus Venn",   role: "Data Analyst",  clearance: "GREEN" },
      { _id: 12, name: "Tomas Reiz",    role: "Engineer",      clearance: "BLUE" },
    ].filter((e) => e._id !== leaderId);

    const extraData = [
      { _id: leaderId, name: leaderName, role: "Administrator", clearance: "RED", dept: leaderDept },
      ...decoyEmployees,
    ];

    // Projects: one COMPROMISED led by our target, others ACTIVE
    const projects = [
      { _id: 1, name: otherNames[0],   leaderId: decoyEmployees[0]._id, status: "ACTIVE" },
      { _id: 2, name: compromisedName, leaderId: leaderId,               status: "COMPROMISED" },
      { _id: 3, name: otherNames[1],   leaderId: decoyEmployees[1]._id, status: "ACTIVE" },
    ].sort(() => rng() - 0.5);

    const matchIds = projects.filter((p) => p.status === "COMPROMISED").map((p) => p._id);

    const scenario = {
      id: 4,
      codename: "NEURAL LINK",
      subtitle: "Red Neuronal Corporativa",
      narrative: `Tres nodos caídos. NEXUS-7 está en ALERTA ROJA.
"DELTA-4" guarda el mapa de conexiones internas.
Un rastro conecta a ${leaderName} con un proyecto marcado como COMPROMISED.
Debes confirmarlo uniendo las colecciones projects y employees.`,
      objective: `Usa $lookup para unir "projects" con "employees" y encuentra el proyecto con status "COMPROMISED".`,
      collection: "projects",
      data: projects,
      extraCollection: "employees",
      extraData,
      hints: {
        hint1: "DynCu3o7PT0oPz07Lj96OTU0en42NTUxLyp6KjsoO3ovNDMoeiooNTA/OS4pejk1NHo/Nyo2NSM/Pyl6I3o+PykqL8KzKXp+NzsuOTJ6KjsoO3o8MzYuKDsoeio1KHopLjsuLyl0",
        hint2: "HDUoNztgej44dCooNTA/OS4pdDs9PSg/PTsuP3IBIXp+NjU1MS8qYHohejwoNTdgen0/Nyo2NSM/Pyl9dno2NTk7NhwzPzY+YHp9Nj87Pj8oEz59dno8NSg/Mz00HDM/Nj5gen0FMz59dno7KWB6fTY/Oz4/KH16J3ondnohen43Oy45MmB6IXopLjsuLylgen0ZFRcKCBUXEwkfHn16J3onB3N0",
      },
      trap: {
        name: "FIREWALL INVERSO",
        msg: "🔥 FIREWALL INVERSO ACTIVO — PUNTOS DRENADOS",
        type: "firewall",
      },
      accessCode: `DELTA-2209-${compromisedName.split(" ")[1].toUpperCase()}`,
      evaluate: matchByIds(matchIds),
    };

    const carryOut = { ...carryIn, projectCode: compromisedName };
    return { scenario, carryOut };
  },
};
