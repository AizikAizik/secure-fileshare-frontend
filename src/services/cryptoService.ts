export async function generateKeyPair(): Promise<{ publicKey: string }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  // Export public key → Base64
  const exportedPub = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );
  const publicKey = btoa(String.fromCharCode(...new Uint8Array(exportedPub)));

  // Export private key → JSON array of bytes
  const exportedPriv = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );
  const privArray = Array.from(new Uint8Array(exportedPriv));
  localStorage.setItem("privateKey", JSON.stringify(privArray));

  return { publicKey };
}

//
// --- Retrieve Private Key ---
//
export async function getPrivateKey(): Promise<CryptoKey> {
  const privateKeyJson = localStorage.getItem("privateKey");
  if (!privateKeyJson) {
    throw new Error("Private key not found in localStorage");
  }

  const privateKeyArray: number[] = JSON.parse(privateKeyJson);
  const privateKeyBuffer = new Uint8Array(privateKeyArray).buffer;

  return window.crypto.subtle.importKey(
    "pkcs8",
    privateKeyBuffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"]
  );
}

export async function generateSymmetricKey(): Promise<CryptoKey> {
  return window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptFile(
  file: File,
  symmetricKey: CryptoKey
): Promise<Blob> {
  const fileData = await file.arrayBuffer();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    symmetricKey,
    fileData
  );
  return new Blob([iv, new Uint8Array(encryptedData)]);
}

//
// --- Symmetric Key Encryption ---
//
export async function encryptSymmetricKey(
  symmetricKey: CryptoKey,
  publicKeyStr: string
): Promise<string> {
  const pubKey = await window.crypto.subtle.importKey(
    "spki",
    Uint8Array.from(atob(publicKeyStr), (c) => c.charCodeAt(0)).buffer,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"]
  );

  const exportedSym = await window.crypto.subtle.exportKey("raw", symmetricKey);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    pubKey,
    exportedSym
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

//
// --- Symmetric Key Decryption (uses getPrivateKey internally) ---
//
export async function decryptSymmetricKey(
  encryptedKey: string
): Promise<CryptoKey> {
  const privateKey = await getPrivateKey();

  const encryptedBuffer = Uint8Array.from(atob(encryptedKey), (c) =>
    c.charCodeAt(0)
  ).buffer;

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedBuffer
  );

  return window.crypto.subtle.importKey(
    "raw",
    decrypted,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function decryptFile(
  encryptedBlob: Blob,
  symmetricKey: CryptoKey
): Promise<Blob> {
  const encryptedArray = await encryptedBlob.arrayBuffer();
  const iv = new Uint8Array(encryptedArray.slice(0, 12));
  const data = encryptedArray.slice(12);

  const decryptedData = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    symmetricKey,
    data
  );

  return new Blob([decryptedData]);
}
