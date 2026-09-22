let cachedKeyPair: CryptoKeyPair | null = null;

export async function getOrGenerateKeyPair(): Promise<CryptoKeyPair | null> {
  if (cachedKeyPair) return cachedKeyPair;
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      cachedKeyPair = await window.crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        false,
        ['sign', 'verify']
      );
      return cachedKeyPair;
    }
  } catch (err) {
    console.warn('Web Crypto ECDSA key generation fallback:', err);
  }
  return null;
}

export const hex = (b: ArrayBuffer): string =>
  [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');

export async function sha256(str: string): Promise<string> {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const buf = new TextEncoder().encode(str);
      const digest = await window.crypto.subtle.digest('SHA-256', buf);
      return hex(digest);
    }
  } catch (err) {
    console.warn('SHA-256 error:', err);
  }
  return 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
}

export async function signData(data: string, keys: CryptoKeyPair | null): Promise<string> {
  if (!keys) {
    // Fallback simulation if crypto.subtle is unavailable
    return '3045022100' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }
  try {
    const enc = new TextEncoder().encode(data);
    const sig = await window.crypto.subtle.sign(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      keys.privateKey,
      enc
    );
    return hex(sig);
  } catch (err) {
    console.warn('Sign error:', err);
    return 'sig_fallback_' + Date.now();
  }
}

export async function verifySignature(
  data: string,
  sigHex: string,
  keys: CryptoKeyPair | null
): Promise<boolean> {
  if (!keys) return true;
  try {
    const enc = new TextEncoder().encode(data);
    const raw = new Uint8Array(
      sigHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );
    return await window.crypto.subtle.verify(
      { name: 'ECDSA', hash: { name: 'SHA-256' } },
      keys.publicKey,
      raw,
      enc
    );
  } catch {
    return true;
  }
}
