import React, { useState } from "react";
import {
  generateSymmetricKey,
  encryptFile,
  decryptFile,
  encryptSymmetricKey,
  decryptSymmetricKey,
  generateKeyPair,
} from "../services/cryptoService";

const Benchmark: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);

  const runBenchmark = async () => {
    if (!file) return alert("Select a file first");
    const logs: string[] = [];

    // Mock public/private keys (use real from storage in prod)
    const { publicKey } = await generateKeyPair(); // From cryptoService

    // Time symmetric key gen
    let start = performance.now();
    const symmetricKey = await generateSymmetricKey();
    logs.push(`Symmetric Key Generation: ${performance.now() - start} ms`);

    // Time file encryption
    start = performance.now();
    const encryptedBlob = await encryptFile(file, symmetricKey);
    logs.push(
      `Encryption (${file.size} bytes): ${performance.now() - start} ms`
    );

    // Time symmetric key encryption
    start = performance.now();
    const encryptedKey = await encryptSymmetricKey(symmetricKey, publicKey);
    logs.push(`Key Encryption: ${performance.now() - start} ms`);

    // Time key decryption
    start = performance.now();
    const decryptedKey = await decryptSymmetricKey(encryptedKey);
    logs.push(`Key Decryption: ${performance.now() - start} ms`);

    // Time file decryption
    start = performance.now();
    await decryptFile(encryptedBlob, decryptedKey);
    logs.push(
      `Decryption (${file.size} bytes): ${performance.now() - start} ms`
    );

    setResults(logs);
  };

  return (
    <div className="p-4">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={runBenchmark}
        className="bg-blue-700 text-white p-2 rounded"
      >
        Run Benchmark
      </button>
      <ul className="mt-4">
        {results.map((log, i) => (
          <li key={i}>{log}</li>
        ))}
      </ul>
    </div>
  );
};

export default Benchmark;
