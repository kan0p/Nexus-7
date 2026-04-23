// src/levels/level1.js
// THE ENTRYWAY — find + equality on two fields.
// Produces an `employee` carry (id + department + clearance) used by N2/N3.

import { matchByIds } from "./matchers";
import { pick } from "./rng";

// Roster of possible targets + fillers. Each variant picks ONE target
// (the employee with the specific role+access the player must find)
// and shuffles fillers around.
const TARGETS = [
  { name: "Lyra Osei",    role: "Security Chief", access: "RED", dept: "Security" },
  { name: "Arca Delvis",  role: "Administrator",  access: "RED", dept: "Core" },
  { name: "Ines Korr",    role: "Cryptographer",  access: "RED", dept: "Crypto" },
];

const FILLERS = [
  { name: "Marcus Venn",  role: "Data Analyst",   access: "GREEN", dept: "Analytics" },
  { name: "Tomas Reiz",   role: "Engineer",       access: "BLUE",  dept: "Core" },
  { name: "Saya Nkrumah", role: "Operator",       access: "GREEN", dept: "Ops" },
  { name: "Jin Park",     role: "Security Chief", access: "GREEN", dept: "Security" },
  { name: "Rhea Voss",    role: "Administrator",  access: "BLUE",  dept: "Core" },
  { name: "Keo Masur",    role: "Data Analyst",   access: "BLUE",  dept: "Analytics" },
  { name: "Nara Pell",    role: "Cryptographer",  access: "GREEN", dept: "Crypto" },
];

export const level1 = {
  id: 1,
  codename: "THE ENTRYWAY",
  build(_carryIn, rng) {
    const target = pick(rng, TARGETS);

    // 5 fillers, none matching the target (role, access) pair
    const fillerPool = FILLERS.filter(
      (f) => !(f.role === target.role && f.access === target.access)
    );
    const fillers = [...fillerPool].sort(() => rng() - 0.5).slice(0, 5);

    // Insert target at a random position, assign _ids
    const docs = [...fillers];
    const insertAt = Math.floor(rng() * (docs.length + 1));
    docs.splice(insertAt, 0, target);
    const data = docs.map((d, i) => ({ _id: i + 1, ...d }));
    const targetDoc = data.find((d) => d.name === target.name);

    const scenario = {
      id: 1,
      codename: "THE ENTRYWAY",
      subtitle: "Capa de Seguridad Alpha",
      narrative: `Año 2099. Te conectas al servidor perimetral de NEXUS-7.
La IA Guardiana "ALPHA-1" custodia la primera puerta.
Solo un operario específico tiene acceso de nivel ${target.access}.
Encuéntralo en la base de datos de empleados.`,
      objective: `Encuentra al empleado cuyo cargo sea "${target.role}" y nivel de acceso sea "${target.access}".`,
      collection: "employees",
      data,
      hints: {
        hint1: "DynCu3o+OHQ/Nyo2NSM/Pyl0PDM0PnJzeio7KTs0PjV6LzR6NTgwPy41ejk1NHo+NSl6OTs3KjUpYHo7Nzg1KXo+Pzg/NHo5NTM0OTM+Myh6OTU0ej82ej41OS83PzQuNXQ=",
        hint2: "HDUoNztgej44dD83KjY1Iz8/KXQ8MzQ+ciF6KDU2P2B6fXR0dH12ejs5OT8pKWB6fXR0dH16J3N6OTU0ejY1KXosOzY1KD8pej8iOzkuNSl6Pj82ejU4MD8uMyw1dA==",
      },
      trap: {
        name: "DESCARGA ELÉCTRICA",
        msg: "⚡ SOBRECARGA DETECTADA — SISTEMA CONTRAATACA",
        type: "electric",
      },
      accessCode: `ALPHA-7734-${target.name.split(" ")[0].toUpperCase()}`,
      evaluate: matchByIds([targetDoc._id]),
    };

    const carryOut = {
      employee: {
        id: targetDoc._id,
        name: targetDoc.name,
        department: targetDoc.dept,
        access: targetDoc.access,
      },
    };

    return { scenario, carryOut };
  },
};
