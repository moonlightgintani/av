/**
 * Cryptographic helpers for passcode encryption and verification
 * Uses standard Web Crypto API (SHA-256)
 */

export async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim());
  
  if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  
  // Fallback simple hash for non-crypto environments
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

// Known default hash for "1596"
export const DEFAULT_PASSCODE_HASH =
  "a19fbf8bf0530ca46179b803a8234f56276f21c0e7dc2f84c682924b95de5801";

/**
 * Verifies entered passcode against either a SHA-256 hash or legacy plaintext
 */
export async function verifyPasscode(
  entered: string,
  storedHashOrPlain: string | undefined
): Promise<boolean> {
  const cleanEntered = entered.trim();
  if (!cleanEntered) return false;

  const target = (storedHashOrPlain || DEFAULT_PASSCODE_HASH).trim();

  // If target is already a SHA-256 hex string (64 hex characters)
  if (/^[a-f0-9]{64}$/i.test(target)) {
    const enteredHash = await sha256(cleanEntered);
    return enteredHash.toLowerCase() === target.toLowerCase();
  }

  // Otherwise, fallback comparison with plaintext or hash of target
  if (cleanEntered === target) return true;
  const [enteredHash, targetHash] = await Promise.all([
    sha256(cleanEntered),
    sha256(target)
  ]);
  return enteredHash === targetHash;
}
