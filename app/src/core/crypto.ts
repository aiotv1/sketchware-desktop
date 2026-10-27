// Sketchware stores project files AES/CBC/PKCS5-encrypted with key = IV = "sketchwaresecure".
const KEY_BYTES = new TextEncoder().encode('sketchwaresecure');
let keyPromise: Promise<CryptoKey> | null = null;

function key(): Promise<CryptoKey> {
  if (!keyPromise) {
    keyPromise = crypto.subtle.importKey('raw', KEY_BYTES, { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']);
  }
  return keyPromise;
}

export async function decryptBytes(data: Uint8Array): Promise<Uint8Array> {
  const out = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: KEY_BYTES }, await key(), data);
  return new Uint8Array(out);
}

export async function encryptBytes(data: Uint8Array): Promise<Uint8Array> {
  const out = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: KEY_BYTES }, await key(), data);
  return new Uint8Array(out);
}

const dec = new TextDecoder('utf-8');
const enc = new TextEncoder();

/** Decrypts a Sketchware data file; falls back to plain text for unencrypted files. */
export async function decryptText(data: Uint8Array): Promise<string> {
  if (data.length > 0 && data.length % 16 === 0) {
    try {
      return dec.decode(await decryptBytes(data));
    } catch {
      /* not encrypted */
    }
  }
  return dec.decode(data);
}

export async function encryptText(text: string): Promise<Uint8Array> {
  return encryptBytes(enc.encode(text.trim()));
}
