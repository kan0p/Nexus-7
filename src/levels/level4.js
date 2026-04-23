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
        hint1: "Oz09KD89Oy4/cnN6KD85Mzg/ei80ejsoKDsjej4/eikuOz0/KXR6HzZ6KigzNz8oeikuOz0/ej4/OD96LzQzKHozNDw1KDc7OTOpNHo+P3o1Lig7ejk1Nj85OTOpNHQ=",
        hint2: "HzZ6KS47PT96Pj96LzQzqTR6LjU3O3puejk7Nyo1KWB6NSgzPT80enI8KDU3c3Z6OTs3KjV6NjU5OzZ2ejk7Nyo1eig/NzUuNXZ6I3o7NjM7KXo+P3opOzYzPjt6cjspc3R6Hj8pKi+zKXo8MzYuKLspejk1NHovNHopLjs9P3o+P3o3Oy45MnQ=",
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
