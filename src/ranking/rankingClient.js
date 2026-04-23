// src/ranking/rankingClient.js
// Firebase Realtime Database + Anonymous Auth (REST API).
// Using the REST API keeps the bundle small and avoids SDK execution policy issues.

const API_KEY = "AIzaSyC0Un0N_ezCCYA-oP7NDi0pqFL6iCy0USY";
const DB_NAME = "nexus-7-29cf5-default-rtdb";
const FIREBASE_URL = `https://${DB_NAME}.firebaseio.com/ranking.json`;
const AUTH_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`;

let cachedToken = null;

/**
 * Signs in anonymously via REST and returns an ID token.
 * Cache the token for the session.
 */
async function getAuthToken() {
  if (cachedToken) return cachedToken;
  try {
    const r = await fetch(AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ returnSecureToken: true }),
    });
    if (!r.ok) throw new Error("Auth failed");
    const data = await r.json();
    cachedToken = data.idToken;
    return cachedToken;
  } catch (err) {
    console.error("[nexus7] Anonymous auth failed:", err);
    return null;
  }
}

export async function fetchTop(limit = 10) {
  try {
    // Reading usually doesn't require auth in these settings, but we can pass
    // it if we secure the read rules later.
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
    const token = await getAuthToken();
    if (!token) {
      console.error("[nexus7] No auth token available for submission");
      return null;
    }

    const r = await fetch(`${FIREBASE_URL}?auth=${token}`, {
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

