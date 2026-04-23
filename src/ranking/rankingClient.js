// src/ranking/rankingClient.js
// Firebase Realtime Database REST API integration.
// No SDK required, works via standard fetch.

const FIREBASE_URL = "https://nexus-7-29cf5-default-rtdb.firebaseio.com/ranking.json";

export async function fetchTop(limit = 10) {
  try {
    // We fetch everything and sort/limit on client side for simplicity
    // unless we want to deal with Firebase's specific query syntax & indexing.
    const r = await fetch(FIREBASE_URL);
    if (!r.ok) return [];
    const data = await r.json();
    if (!data) return [];

    return Object.entries(data)
      .map(([id, val]) => ({ id, ...val }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch (err) {
    console.error("[nexus7] fetchTop error:", err);
    return [];
  }
}

export async function fetchBest() {
  try {
    const list = await fetchTop(1);
    return list.length > 0 ? list[0] : null;
  } catch (_) {
    return null;
  }
}

export async function submitRun(run) {
  try {
    const r = await fetch(FIREBASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...run,
        timestamp: Date.now()
      }),
    });
    if (!r.ok) {
      console.error("[nexus7] submitRun failed:", r.status);
      return null;
    }
    const res = await r.json();
    return { id: res.name, ...run };
  } catch (err) {

    console.error("[nexus7] submitRun network error:", err);
    return null;
  }
}

