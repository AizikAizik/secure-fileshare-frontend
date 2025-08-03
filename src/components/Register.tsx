import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { generateKeyPair } from "../services/cryptoService";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const { publicKey, privateKey } = await generateKeyPair();
      localStorage.setItem(
        "privateKey",
        JSON.stringify(await crypto.subtle.exportKey("pkcs8", privateKey))
      );
      const { data } = await api.post("/auth/register", {
        email,
        password,
        publicKey,
      });
      localStorage.setItem("token", data.token);
      navigate("/dashboard", { replace: true }); // Navigate to dashboard
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-bold mb-4 text-primary">Register</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full p-2 mb-4 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <button
        type="submit"
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 cursor-pointer transition-colors"
      >
        Register
      </button>
      {mutation.isError && (
        <p className="text-red-500 mt-2">Error: {mutation.error.message}</p>
      )}
    </form>
  );
};

export default Register;
