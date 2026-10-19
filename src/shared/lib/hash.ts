export async function sha256HexOfBlob(blob: Blob): Promise<string> {
  const subtle = globalThis.crypto?.subtle;
  if (subtle === undefined) {
    throw new Error("CRYPTO_SUBTLE_UNAVAILABLE");
  }
  const buffer = await blob.arrayBuffer();
  const digest = await subtle.digest("SHA-256", buffer);
  const bytes = new Uint8Array(digest);
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
}
