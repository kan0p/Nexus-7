// src/hooks/useQueryEvaluator.js
// Parses the player's MongoDB-shell-style input, runs it with Mingo against
// the scenario's dataset, then asks the scenario to decide correctness.
// The correctness rule lives on each scenario (Strategy pattern) so adding a
// level only means writing its evaluate() — no changes here.
import { useCallback } from "react";
import mingo from "mingo";
// Mingo 6 is modular and ships WITHOUT pipeline/accumulator operators
// registered. Without this side-effect import, $group, $lookup, $sum, etc.
// throw "unregistered pipeline operator". Level 4 ($lookup) and level 5
// ($group + $sum) depend on this.
import "mingo/init/system";

// Accepts db.<col>.find(...), db.<col>.findOne(...), or db.<col>.aggregate(...)
// and returns the parsed query object / pipeline.
function parseQuery(raw) {
  let str = raw.trim();

  // findOne behaves like find for our matcher (we already compare by _id set).
  const findMatch = str.match(/^db\.\w+\.find(?:One)?\s*\(([\s\S]*)\)\s*$/i);
  if (findMatch) str = findMatch[1].trim();
  const aggMatch = str.match(/^db\.\w+\.aggregate\s*\(([\s\S]*)\)\s*$/i);
  if (aggMatch) str = aggMatch[1].trim();

  // Shell-style → JSON:
  //   {role: "X"}  →  {"role":"X"}
  //   {$gt: 5}     →  {"$gt":5}
  //   {'x':1}      →  {"x":1}
  const jsonified = str
    .replace(/([{,]\s*)(\$?[a-zA-Z_][a-zA-Z0-9_.]*)\s*:/g, '$1"$2":')
    .replace(/:\s*'([^']*)'/g, ': "$1"');
  return JSON.parse(jsonified);
}

function runFind(queryObj, data) {
  return mingo.find(data, queryObj).all();
}

/**
 * Runs an aggregation pipeline with optional cross-collection support ($lookup).
 *
 * Mingo doesn't natively support $lookup (it requires a second collection),
 * so we pre-process the pipeline: if a $lookup stage is found, we perform the
 * join manually and replace the stage with a $addFields that injects the
 * already-resolved "as" array. The rest of the pipeline continues normally.
 *
 * @param {Array}  pipeline         - MongoDB aggregation pipeline stages.
 * @param {Array}  data             - Primary collection documents.
 * @param {Object} extraCollections - Map of collection name → documents array.
 */
function runAggregate(pipeline, data, extraCollections = {}) {
  // Resolve $lookup stages manually before handing off to mingo
  const resolvedPipeline = [];
  let workingData = data;

  for (const stage of pipeline) {
    if (stage.$lookup) {
      const { from, localField, foreignField, as } = stage.$lookup;
      const foreignDocs = extraCollections[from] ?? [];
      // Perform the join: inject the matched foreign docs into each document
      workingData = workingData.map((doc) => ({
        ...doc,
        [as]: foreignDocs.filter(
          (foreign) => foreign[foreignField] === doc[localField]
        ),
      }));
      // Stage already applied manually — skip adding it to resolvedPipeline
    } else {
      resolvedPipeline.push(stage);
    }
  }

  if (resolvedPipeline.length === 0) return workingData;
  return mingo.aggregate(workingData, resolvedPipeline);
}

function crypticError(type) {
  const messages = {
    syntax: [
      "▸ ERROR DE SINTAXIS — La máquina no reconoce tu lenguaje. Revisa los operadores.",
      "▸ PARSE FAILURE — NEXUS-7 rechaza comandos malformados. Revisa llaves y comillas.",
      "▸ COMANDO INVÁLIDO — La IA Guardiana no procesa ruido. Estructura tu query.",
    ],
    wrong_results: [
      "▸ RESULTADO INCORRECTO — Obtuviste documentos, pero no los que el sistema necesita.",
      "▸ FILTRO FALLIDO — Tu query ejecuta, pero apunta al objetivo equivocado.",
      "▸ ACCESO DENEGADO — Los datos que extraes no coinciden con la clave requerida.",
    ],
    empty: [
      "▸ CONJUNTO VACÍO — Tu filtro no encuentra nada. ¿Revisaste los valores exactos?",
      "▸ NULL RETURN — El sistema devuelve silencio. Ajusta las condiciones.",
    ],
  };
  const arr = messages[type] || messages.syntax;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useQueryEvaluator() {
  const evaluate = useCallback((rawInput, scenario) => {
    try {
      const parsed = parseQuery(rawInput);

      // Build the extra-collections map from scenario metadata (e.g. level 4's
      // "employees" collection used by $lookup). Falls back to empty object so
      // all other levels are unaffected.
      const extraCollections =
        scenario.extraData && scenario.extraCollection
          ? { [scenario.extraCollection]: scenario.extraData }
          : {};

      const results = Array.isArray(parsed)
        ? runAggregate(parsed, scenario.data, extraCollections)
        : runFind(parsed, scenario.data);

      if (results.length === 0) {
        return { ok: false, message: crypticError("empty"), results: [] };
      }
      const correct = scenario.evaluate(results);
      if (correct) {
        return {
          ok: true,
          message: `▸ ACCESO CONCEDIDO — Clave extraída: ${scenario.accessCode}`,
          results,
        };
      }
      return { ok: false, message: crypticError("wrong_results"), results };
    } catch (_err) {
      return { ok: false, message: crypticError("syntax"), results: [] };
    }
  }, []);
  return { evaluate };
}
