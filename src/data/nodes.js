// src/data/nodes.js
// All game nodes: narrative, collections, queries, traps

export const NODES = [
  {
    id: 1,
    codename: "THE ENTRYWAY",
    subtitle: "Capa de Seguridad Alpha",
    narrative: `Año 2099. Te conectas al servidor perimetral de NEXUS-7.
La IA Guardiana "ALPHA-1" custodia la primera puerta.
Solo un operario específico tiene acceso de nivel ROJO.
Encuéntralo en la base de datos de empleados.`,
    objective: `Encuentra al empleado cuyo cargo sea "Security Chief" y nivel de acceso sea "RED".`,
    collection: "employees",
    data: [
      { _id: 1, name: "Marcus Venn",    role: "Data Analyst",   access: "GREEN", dept: "Analytics" },
      { _id: 2, name: "Lyra Osei",      role: "Security Chief", access: "RED",   dept: "Security"  },
      { _id: 3, name: "Tomas Reiz",     role: "Engineer",       access: "BLUE",  dept: "Core"      },
      { _id: 4, name: "Saya Nkrumah",   role: "Operator",       access: "GREEN", dept: "Ops"       },
      { _id: 5, name: "Jin Park",        role: "Security Chief", access: "GREEN", dept: "Security"  },
      { _id: 6, name: "Arca Delvis",    role: "Administrator",  access: "RED",   dept: "Core"      },
    ],
    solution: { role: "Security Chief", access: "RED" },
    expectedIds: [2],
    hint1: "Necesitas dos condiciones simultáneas. MongoDB las acepta en el mismo objeto.",
    hint2: 'db.employees.find({ role: "...", access: "..." })',
    trapName: "DESCARGA ELÉCTRICA",
    trapMsg: "⚡ SOBRECARGA DETECTADA — SISTEMA CONTRAATACA",
    trapType: "electric",
    accessCode: "ALPHA-7734-LYRA",
  },
  {
    id: 2,
    codename: "DATA VAULT",
    subtitle: "Bóveda Financiera Sector 7",
    narrative: `Acceso concedido al primer nodo. Avanzas hacia el Vault.
La IA "SIGMA-2" protege registros financieros clasificados.
Los auditores internos sospechan de transacciones anómalas.
Debes localizar todas las transferencias mayores a 500,000 créditos
que pertenezcan a los sectores "ARMS" o "BIOTECH".`,
    objective: `Filtra las transacciones con amount > 500000 Y cuyo sector sea "ARMS" o "BIOTECH".`,
    collection: "transactions",
    data: [
      { _id: 1, ref: "TX-001", amount: 1200000, sector: "ARMS",     status: "CLEARED"  },
      { _id: 2, ref: "TX-002", amount: 340000,  sector: "BIOTECH",  status: "PENDING"  },
      { _id: 3, ref: "TX-003", amount: 870000,  sector: "BIOTECH",  status: "CLEARED"  },
      { _id: 4, ref: "TX-004", amount: 620000,  sector: "ENERGY",   status: "CLEARED"  },
      { _id: 5, ref: "TX-005", amount: 95000,   sector: "ARMS",     status: "FLAGGED"  },
      { _id: 6, ref: "TX-006", amount: 760000,  sector: "ARMS",     status: "CLEARED"  },
    ],
    solution: { amount: { $gt: 500000 }, sector: { $in: ["ARMS", "BIOTECH"] } },
    expectedIds: [1, 3, 6],
    hint1: "Usa $gt para mayor que, y $in para una lista de valores posibles.",
    hint2: 'db.transactions.find({ amount: { $gt: N }, sector: { $in: [...] } })',
    trapName: "VIRUS DE CORRUPCIÓN",
    trapMsg: "☣ VIRUS INYECTADO — DATOS CORROMPIDOS",
    trapType: "virus",
    accessCode: "SIGMA-4491-VAULT",
  },
  {
    id: 3,
    codename: "THE ARCHIVES",
    subtitle: "Archivos Históricos Clasificados",
    narrative: `Dos nodos caídos. NEXUS-7 eleva su alerta a NARANJA.
"OMICRON-3" controla los archivos de experimentos.
Los registros que buscas están en documentos con campos anidados.
Necesitas los experimentos del laboratorio "LAB-9"
que hayan sido marcados como FAILED o TERMINATED.`,
    objective: `Encuentra experimentos donde lab.id sea "LAB-9" Y cuyo status sea "FAILED" o "TERMINATED".`,
    collection: "experiments",
    data: [
      { _id: 1, code: "EXP-α", lab: { id: "LAB-9", floor: 3 }, status: "FAILED",     clearance: 5 },
      { _id: 2, code: "EXP-β", lab: { id: "LAB-4", floor: 1 }, status: "FAILED",     clearance: 3 },
      { _id: 3, code: "EXP-γ", lab: { id: "LAB-9", floor: 3 }, status: "ACTIVE",     clearance: 5 },
      { _id: 4, code: "EXP-δ", lab: { id: "LAB-9", floor: 2 }, status: "TERMINATED", clearance: 5 },
      { _id: 5, code: "EXP-ε", lab: { id: "LAB-2", floor: 1 }, status: "TERMINATED", clearance: 2 },
      { _id: 6, code: "EXP-ζ", lab: { id: "LAB-9", floor: 3 }, status: "COMPLETED",  clearance: 4 },
    ],
    solution: { "lab.id": "LAB-9", status: { $in: ["FAILED", "TERMINATED"] } },
    expectedIds: [1, 4],
    hint1: 'Para campos anidados usa "dot notation": "objeto.campo".',
    hint2: 'db.experiments.find({ "lab.id": "LAB-9", status: { $in: [...] } })',
    trapName: "PULSO EMP",
    trapMsg: "💀 PULSO EMP DETECTADO — APAGANDO SISTEMAS",
    trapType: "emp",
    accessCode: "OMICRON-8823-ARCH",
  },
  {
    id: 4,
    codename: "NEURAL LINK",
    subtitle: "Red Neuronal Corporativa",
    narrative: `Tres nodos caídos. NEXUS-7 está en ALERTA ROJA.
"DELTA-4" guarda el mapa de conexiones internas.
Hay un proyecto marcado como COMPROMISED.
Debes encontrar qué empleado lidera ese proyecto
usando los datos de ambas colecciones.`,
    objective: `Usa $lookup para unir "projects" con "employees" y encuentra el líder del proyecto con status "COMPROMISED".`,
    collection: "projects",
    data: [
      { _id: 1, name: "Project Lazarus", leaderId: 3, status: "ACTIVE"      },
      { _id: 2, name: "Project Phantom",  leaderId: 6, status: "COMPROMISED" },
      { _id: 3, name: "Project Aurora",   leaderId: 1, status: "ACTIVE"      },
    ],
    extraCollection: "employees",
    extraData: [
      { _id: 1, name: "Marcus Venn",  role: "Data Analyst",   clearance: "GREEN" },
      { _id: 3, name: "Tomas Reiz",   role: "Engineer",       clearance: "BLUE"  },
      { _id: 6, name: "Arca Delvis",  role: "Administrator",  clearance: "RED"   },
    ],
    solution: [
      { $lookup: { from: "employees", localField: "leaderId", foreignField: "_id", as: "leader" } },
      { $match: { status: "COMPROMISED" } }
    ],
    expectedIds: [2],
    hint1: "aggregate() recibe un array de stages. Primero $lookup, luego $match.",
    hint2: 'db.projects.aggregate([{ $lookup: { from: "employees", localField: "leaderId", foreignField: "_id", as: "leader" } }, { $match: { status: "COMPROMISED" } }])',
    trapName: "FIREWALL INVERSO",
    trapMsg: "🔥 FIREWALL INVERSO ACTIVO — PUNTOS DRENADOS",
    trapType: "firewall",
    accessCode: "DELTA-2209-NEURAL",
  },
  {
    id: 5,
    codename: "THE CORE",
    subtitle: "Núcleo Central — NEXUS-7",
    narrative: `ÚLTIMO NODO. Estás en el corazón de NEXUS-7.
La IA maestra "OMEGA-CORE" controla los reactores.
Para apagarla necesitas calcular el consumo total de energía
agrupado por tipo de reactor.
Si los números no cuadran, el sistema activa la autodestrucción.`,
    objective: `Agrupa los reactores por "type" y calcula la suma total de "energyTW" para cada tipo.`,
    collection: "reactors",
    data: [
      { _id: 1, name: "R-Alpha-1", type: "FUSION",   energyTW: 4.2, status: "ONLINE"  },
      { _id: 2, name: "R-Beta-1",  type: "FISSION",  energyTW: 2.8, status: "ONLINE"  },
      { _id: 3, name: "R-Alpha-2", type: "FUSION",   energyTW: 3.9, status: "ONLINE"  },
      { _id: 4, name: "R-Gamma-1", type: "DARK",     energyTW: 9.1, status: "HIDDEN"  },
      { _id: 5, name: "R-Beta-2",  type: "FISSION",  energyTW: 2.5, status: "ONLINE"  },
      { _id: 6, name: "R-Alpha-3", type: "FUSION",   energyTW: 4.8, status: "CRITICAL"},
    ],
    solution: [
      { $group: { _id: "$type", totalEnergy: { $sum: "$energyTW" } } }
    ],
    expectedIds: null, // aggregation — check by group keys
    expectedGroups: ["FUSION", "FISSION", "DARK"],
    hint1: "Usa aggregate con $group. El _id del grupo será el campo por el que agrupas.",
    hint2: 'db.reactors.aggregate([{ $group: { _id: "$type", totalEnergy: { $sum: "$energyTW" } } }])',
    trapName: "AUTODESTRUCCIÓN",
    trapMsg: "💥 SECUENCIA DE AUTODESTRUCCIÓN INICIADA",
    trapType: "selfdestruct",
    accessCode: "OMEGA-0001-CORE",
  },
];

export const MAX_LIVES = 3;
export const ERRORS_PER_TRAP = 3;
