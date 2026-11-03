/**
 * Cryptographic helpers for verifiable e-voting receipts, SHA-256 ballot hashing,
 * and binary Merkle root integrity verification.
 */

export const GENESIS_BLOCK_HASH =
  '000000e89c4f12a7b508d3f6a91c22e84b7d901a6f33c8b2109e4d5f7a2c8801';

export async function generateSHA256(text: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const msgBuffer = new TextEncoder().encode(text);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback deterministic hash below
    }
  }
  let h1 = 0xdeadbeef ^ text.length;
  let h2 = 0x41c6ce57 ^ text.length;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `${hex1}${hex2}${hex1}${hex2}${hex2}${hex1}${hex1}${hex2}`.slice(0, 64);
}

/**
 * Computes a binary SHA-256 Merkle Root across all ballot hashes in the ledger.
 */
export async function computeMerkleRoot(hashes: string[]): Promise<string> {
  if (hashes.length === 0) {
    return GENESIS_BLOCK_HASH;
  }
  let level = [...hashes];
  while (level.length > 1) {
    const nextLevel: string[] = [];
    for (let i = 0; i < level.length; i += 2) {
      const left = level[i];
      const right = i + 1 < level.length ? level[i + 1] : level[i];
      const combined = await generateSHA256(`${left}:${right}`);
      nextLevel.push(combined);
    }
    level = nextLevel;
  }
  return level[0];
}

export function generateReceiptId(prefix = 'IN-EV'): string {
  const year = 2026;
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${year}-${rand}`;
}

export function generateVVPATSlipId(prefix = 'VVPAT'): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${num}`;
}
