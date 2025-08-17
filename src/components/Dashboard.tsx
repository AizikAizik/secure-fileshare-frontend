import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../services/api";
import FileUpload from "./FileUpload";
import { decryptFile, decryptSymmetricKey } from "../services/cryptoService";

interface Owner {
  _id: string;
  name: string; // Populated name
}

interface FileItem {
  _id: string;
  filename: string;
  owner: Owner; // Now an object
  s3Key: string;
}

const Dashboard: React.FC = () => {
  const {
    data: files,
    isLoading,
    error,
  } = useQuery<FileItem[]>({
    queryKey: ["files"],
    queryFn: async () => {
      const { data } = await api.get("/files/list");
      return data;
    },
  });

  const handleDownload = async (fileId: string, filename: string) => {
    try {
      // Fetch presigned URL and encrypted key from backend
      const { data } = await api.get(`/files/download/${fileId}`);
      const { downloadUrl, encryptedKey } = data;

      // Fetch the encrypted file
      // Fetch the encrypted file with CORS mode
      const response = await fetch(downloadUrl, { mode: "cors" });
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const encryptedBlob = await response.blob();

      // Get private key from localStorage (assumes it's stored as JSON stringified pkcs8)
      const privateKeyJson = localStorage.getItem("privateKey");
      if (!privateKeyJson) throw new Error("Private key not found");
      const privateKeyArray = JSON.parse(privateKeyJson);
      const privateKeyBuffer = new Uint8Array(privateKeyArray).buffer; // ArrayBuffer

      const privateKey = await window.crypto.subtle.importKey(
        "pkcs8",
        privateKeyBuffer,
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["decrypt"]
      );

      // Decrypt symmetric key
      const symmetricKey = await decryptSymmetricKey(encryptedKey, privateKey);

      // Decrypt file
      const decryptedBlob = await decryptFile(encryptedBlob, symmetricKey);

      // Trigger download
      const url = URL.createObjectURL(decryptedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
      // Handle error (e.g., show toast/message)
    }
  };

  const handleShare = (fileId: string) => {
    console.log(`Sharing file ${fileId}`);
  };

  if (isLoading)
    return (
      <div className="text-center py-10 text-blue-700">Loading files...</div>
    );
  if (error)
    return (
      <div className="text-center py-10 text-red-500">
        Error loading files: {error.message}
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <FileUpload />
        <h1 className="text-3xl font-bold text-blue-700 mb-6">Your Files</h1>
        {files?.length === 0 ? (
          <p className="text-gray-600 text-center">
            No files yet. Upload one to get started!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
              <thead className="bg-blue-700 text-white">
                <tr>
                  <th className="p-4 text-left">Filename</th>
                  <th className="p-4 text-left">Owner</th>
                  <th className="p-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {files?.map((file) => (
                  <tr
                    key={file._id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">{file.filename}</td>
                    <td className="p-4">
                      {file.owner.name || file.owner._id}
                    </td>{" "}
                    {/* Display name or fallback to ID */}
                    <td className="p-4 flex space-x-2">
                      <button
                        onClick={() => handleDownload(file._id, file.filename)}
                        className="bg-emerald-500 text-white px-4 py-2 rounded hover:bg-green-600"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => handleShare(file._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                      >
                        Share
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
