// src/hooks/useQueryEvaluator.js
// Evaluates player queries using Mingo (real MongoDB query engine in JS)

import { useCallback } from "react";
import mingo from "mingo";

/**
 * Safely parse a MongoDB-style query string into a JS object.
 * Supports both find({...}) style and raw object {...} style.
 * Also supports aggregate([...]) style.
 */
function parseQuery(raw) {
  let str = raw.trim();

  // Strip db.collection.find(...) wrapper
  const findMatch = str.match(/^db\.\w+\.find\s*\(([\s\S]*)\)\s*$/i);
  if (findMatch) str = findMatch[1].trim();

  // Strip db.collection.aggregate(...) wrapper
  const aggMatch = str.match(/^db\.\w+\.aggregate\s*\(([\s\S]*)\)\s*$/i);
  if (aggMatch) str = aggMatch[1].trim();

  // Replace JS-style keys (unquoted) with quoted keys for JSON.parse
  // e.g. { role: "x" } -> { "role": "x" }
  const jsonified = str
    .replace(/([{,]\s*)(\$?[a-zA-Z_][a-zA-Z0-9_.]*)\s*:/g, '$1"$2":')
    .replace(/:\s*'([^']*)'/g, ': "$1"'); // single quotes -> double

  return JSON.parse(jsonified);
}

/**
 * Run a find query with Mingo against a dataset.
 * Returns { results, error }
 */
function runFind(queryObj, data) {
  const cursor = mingo.find(data, queryObj);
  return cursor.all();
}

/**
 * Run a basic aggregation pipeline with Mingo.
 * Supports $match, $group, $lookup (simulated), $project, $sort, $limit.
 */
function runAggregate(pipeline, data, extraData = null, extraName = null) {
  // Mingo's aggregate
  const result = mingo.aggregate(data, pipeline);
  return result;
}

/**
 * Compare two arrays of documents by _id
 */
function compareById(results, expectedIds) {
  if (!expectedIds) return null; // aggregation — different check
  const resultIds = results.map((d) => d._id).sort();
  const expected = [...expectedIds].sort();
  return JSON.stringify(resultIds) === JSON.stringify(expected);
}

/**
 * For aggregation nodes, check that all expected group keys appear
 */
function compareGroups(results, expectedGroups) {
  if (!expectedGroups) return null;
  const found = results.map((r) => r._id);
  return expectedGroups.every((g) => found.includes(g));
}

/**
 * Generate a cryptic error message based on what went wrong
 */
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

/**
 * Main hook
 */
export function useQueryEvaluator() {
  const evaluate = useCallback((rawInput, node) => {
    try {
      const parsed = parseQuery(rawInput);
      const isArray = Array.isArray(parsed);

      let results;
      if (isArray) {
        // Aggregation pipeline
        results = runAggregate(parsed, node.data, node.extraData, node.extraCollection);
      } else {
        // Find query
        results = runFind(parsed, node.data);
      }

      if (results.length === 0) {
        return { ok: false, message: crypticError("empty"), results: [] };
      }

      // Check correctness
      let correct = false;
      if (node.expectedIds) {
        correct = compareById(results, node.expectedIds);
      } else if (node.expectedGroups) {
        correct = compareGroups(results, node.expectedGroups);
      }

      if (correct) {
        return {
          ok: true,
          message: `▸ ACCESO CONCEDIDO — Clave extraída: ${node.accessCode}`,
          results,
        };
      } else {
        return { ok: false, message: crypticError("wrong_results"), results };
      }
    } catch (err) {
      return { ok: false, message: crypticError("syntax"), results: [] };
    }
  }, []);

  return { evaluate };
}
