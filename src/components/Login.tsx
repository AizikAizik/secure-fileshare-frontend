import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [needsRestore, setNeedsRestore] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);

      // Check if private key exists
      const privKey = localStorage.getItem("privateKey");
      if (!privKey) {
        setNeedsRestore(true); // ask user to restore from backup
      } else {
        navigate("/dashboard", { replace: true });
      }
    },
  });

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    localStorage.setItem("privateKey", text);

    alert("Private key restored successfully!");
    navigate("/dashboard", { replace: true });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (needsRestore) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-4">
            Restore Private Key
          </h2>
          <p className="text-gray-700 mb-6">
            We couldn’t find your private key locally. Please upload your backup
            file to continue.
          </p>
          <input type="file" accept=".txt" onChange={handleRestore} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg p-8 bg-white rounded-lg shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-blue-700 text-center">
          Login
        </h2>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        />
        <button
          type="submit"
          className="w-full bg-blue-700 text-white p-2 rounded hover:bg-blue-500 transition-colors cursor-pointer"
        >
          Login
        </button>
        {mutation.isError && (
          <p className="text-red-500 mt-2 text-center">
            Error: {mutation.error.message}
          </p>
        )}
        <p className="mt-4 text-center text-gray-600">
          New user?{" "}
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="text-blue-700 hover:underline"
          >
            Register
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
