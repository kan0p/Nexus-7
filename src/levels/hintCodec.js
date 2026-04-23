// src/levels/hintCodec.js
// Light-weight obfuscation so hint text doesn't appear as plain Spanish
// strings when someone views the bundle source. Not encryption — anyone
// determined will decode trivially — but it raises the bar above
// "Ctrl+F for the solution" and keeps the source free of spoilers.

const KEY = 0x5A;

/** Build-time helper: run once in a script to produce the encoded form.
 *  export const _e = (plain) => btoa(unescape(encodeURIComponent(
 *    [...plain].map(c => String.fromCharCode(c.charCodeAt(0) ^ KEY)).join("")
 *  )));
 */

// Runtime decoder. Accepts the obfuscated string stored in level files
// and returns the original hint text.
export function decodeHint(obfuscated) {
  try {
    const xored = decodeURIComponent(escape(atob(obfuscated)));
    return [...xored].map((c) => String.fromCharCode(c.charCodeAt(0) ^ KEY)).join("");
  } catch (_) {
    return "";
  }
}

// Helper used by level files to encode at module-eval time. We still
// ship the plain text in the bundle this way — so levels use the
// pre-encoded string constants below instead of calling this.
// Kept here for documentation / dev use.
export function encodeHint(plain) {
  const xored = [...plain].map((c) => String.fromCharCode(c.charCodeAt(0) ^ KEY)).join("");
  // btoa + utf-8 safe
  return btoa(unescape(encodeURIComponent(xored)));
}
