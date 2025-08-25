import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../services/api";
import {
  decryptSymmetricKey,
  encryptSymmetricKey,
} from "../services/cryptoService";

interface FileShareProps {
  fileId: string;
  onClose: () => void; // For modal close if used as modal
}

const FileShare: React.FC<FileShareProps> = ({ fileId, onClose }) => {
  const [recipientEmail, setRecipientEmail] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      // Step 1: Fetch sender's encrypted symmetric key and presigned URL (but we only need encryptedKey)
      const { data: downloadData } = await api.get(`/files/download/${fileId}`);
      const { encryptedKey: senderEncryptedKey } = downloadData;

      // Step 2: Decrypt the symmetric key using sender's private key
      const symmetricKey = await decryptSymmetricKey(senderEncryptedKey);

      // Step 3: Fetch recipient's public key
      const { data: recipientData } = await api.get("/auth/public-key", {
        params: { email: recipientEmail },
      });
      const recipientPublicKey = recipientData.publicKey;

      // Step 4: Encrypt the symmetric key with recipient's public key
      const encryptedKeyForRecipient = await encryptSymmetricKey(
        symmetricKey,
        recipientPublicKey
      );

      // Step 6: Call share endpoint
      await api.post("/files/share", {
        fileId,
        recipientEmail,
        encryptedKeyForRecipient,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["files"] }); // Refresh file list
      onClose(); // Close modal or UI
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-6 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">
          Share File
        </h2>
        <input
          type="email"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
          placeholder="Recipient Email"
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-700"
          required
        />
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 bg-blue-700 text-white p-2 rounded hover:bg-blue-500"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Sharing..." : "Share"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
        {mutation.isError && (
          <p className="text-red-500 mt-2 text-center">
            Error: {mutation.error.message}
          </p>
        )}
        {mutation.isSuccess && (
          <p className="text-emerald-500 mt-2 text-center">
            File shared successfully!
          </p>
        )}
      </form>
    </div>
  );
};

export default FileShare;
