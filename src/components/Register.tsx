import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { generateKeyPair } from "../services/cryptoService";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [backupKey, setBackupKey] = useState<string | null>(null);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const { publicKey, privateKey } = await generateKeyPair();

      // Save private key temporarily in state so user can download it
      setBackupKey(privateKey);

      const { data } = await api.post("/auth/register", {
        email,
        name,
        password,
        publicKey,
      });

      localStorage.setItem("token", data.token);
      // don’t navigate immediately — wait until backup is downloaded
    },
  });

  const handleDownloadBackup = () => {
    if (!backupKey) return;
    const blob = new Blob([backupKey], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "private-key-backup.txt";
    link.click();
    URL.revokeObjectURL(url);

    alert("Backup downloaded. Keep it safe!");
    navigate("/dashboard", { replace: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
      {!backupKey ? (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-blue-700 text-center">
            Register
          </h2>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full Name"
            className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-700"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-3 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-700"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-3 mb-6 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg text-gray-700"
          />
          <button
            type="submit"
            className="w-full bg-blue-700 text-white p-3 rounded hover:bg-blue-500 text-lg font-semibold cursor-pointer"
          >
            Register
          </button>
          {mutation.isError && (
            <p className="text-red-500 mt-4 text-center">
              Error: {mutation.error.message}
            </p>
          )}
          <p className="mt-4 text-center text-gray-600 text-lg">
            Already a user?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-blue-700 hover:underline"
            >
              Login
            </button>
          </p>
        </form>
      ) : (
        <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-green-700 mb-4">
            Registration Successful
          </h2>
          <p className="text-gray-700 mb-6">
            Please download and securely store your private key. Without it, you
            cannot decrypt your files if you lose local storage.
          </p>
          <button
            onClick={handleDownloadBackup}
            className="w-full bg-green-600 text-white p-3 rounded hover:bg-green-500 font-semibold"
          >
            Download Private Key Backup
          </button>
        </div>
      )}
    </div>
  );
};

export default Register;
