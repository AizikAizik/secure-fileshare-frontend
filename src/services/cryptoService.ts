import { arrayBufferToBase64, base64ToArrayBuffer } from "./helpers";

export async function generateKeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
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

  // Export public key
  const exportedPub = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );
  const publicKey = btoa(String.fromCharCode(...new Uint8Array(exportedPub)));

  // Export private key (base64 instead of array)
  const exportedPriv = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );
  const privBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPriv)));

  // Store in localStorage for now
  localStorage.setItem("privateKey", privBase64);

  return { publicKey, privateKey: privBase64 };
}

//
// --- Retrieve Private Key ---
//
export async function getPrivateKey(): Promise<CryptoKey> {
  const privateKeyB64 = localStorage.getItem("privateKey");
  if (!privateKeyB64) {
    throw new Error("Private key not found in localStorage");
  }

  const privateKeyBuffer = base64ToArrayBuffer(privateKeyB64);
  return await window.crypto.subtle.importKey(
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
    base64ToArrayBuffer(publicKeyStr),
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

  return arrayBufferToBase64(encrypted);
}

//
// --- Symmetric Key Decryption (uses getPrivateKey internally) ---
//
export async function decryptSymmetricKey(
  encryptedKey: string
): Promise<CryptoKey> {
  const privateKey = await getPrivateKey();

  const encryptedBuffer = base64ToArrayBuffer(encryptedKey);

  console.log("Encrypted key size:", encryptedBuffer.byteLength);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedBuffer
  );

  console.log("Decrypted symmetric key size (bytes):", decrypted.byteLength);
  // should be 32 if you exported a 256-bit AES key

  return window.crypto.subtle.importKey(
    "raw",
    decrypted,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
}

// export async function decryptSymmetricKey(
//   encryptedKey: string
// ): Promise<CryptoKey> {
//   const encryptedBuffer = Uint8Array.from(atob(encryptedKey), (c) =>
//     c.charCodeAt(0)
//   );

//   const privateKey = await getPrivateKey();

//   const decrypted = await window.crypto.subtle.decrypt(
//     { name: "RSA-OAEP" },
//     privateKey,
//     encryptedBuffer
//   );
//   console.log("Decrypted symmetric key size (bytes):", decrypted.byteLength);
//   // should be 32 if you exported a 256-bit AES key

//   return window.crypto.subtle.importKey(
//     "raw",
//     decrypted,
//     { name: "AES-GCM" },
//     true,
//     ["encrypt", "decrypt"]
//   );
// }

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
