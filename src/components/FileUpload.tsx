import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import {
  generateSymmetricKey,
  encryptFile,
  encryptSymmetricKey,
} from "../services/cryptoService";

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filename, setFilename] = useState("");
  const queryClient = useQueryClient();

  const { data: userData, isLoading: keyLoading } = useQuery<{
    publicKey: string;
  }>({
    queryKey: ["userPublicKey"],
    queryFn: async () => {
      const { data } = await api.get("/auth/my-public-key");
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("No file selected");
      if (!userData?.publicKey) throw new Error("Public key not available");

      const symmetricKey = await generateSymmetricKey();
      const encryptedFileBlob = await encryptFile(file, symmetricKey);
      const encryptedKey = await encryptSymmetricKey(
        symmetricKey,
        userData.publicKey
      );

      const formData = new FormData();
      formData.append("file", encryptedFileBlob, filename || file.name);
      formData.append("filename", filename || file.name);
      formData.append("encryptedKey", encryptedKey);

      await api.post("/files/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
      setFilename(e.target.files[0].name);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (keyLoading)
    return (
      <div className="text-center py-10 text-blue-700">
        Loading public key...
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
          Upload File
        </h2>
        <input
          type="file"
          onChange={handleFileChange}
          className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-700 text-lg text-gray-700"
        />
        <input
          type="text"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          placeholder="Filename (optional)"
          className="w-full p-3 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-blue-700 text-lg"
        />
        <button
          type="submit"
          className="w-full bg-blue-700 text-white p-3 rounded hover:bg-blue-500 text-lg font-semibold cursor-pointer"
          disabled={!file || mutation.isPending || keyLoading}
        >
          {mutation.isPending ? "Uploading..." : "Upload"}
        </button>
        {mutation.isError && (
          <p className="text-red-500 mt-4 text-center">
            Error: {mutation.error.message}
          </p>
        )}
        {mutation.isSuccess && (
          <p className="text-accent mt-4 text-center">
            File uploaded successfully!
          </p>
        )}
      </form>
    </div>
  );
};

export default FileUpload;
