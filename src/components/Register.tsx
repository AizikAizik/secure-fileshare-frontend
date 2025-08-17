import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { generateKeyPair } from "../services/cryptoService";

const Register: React.FC = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async () => {
      const { publicKey, privateKey } = await generateKeyPair();

      const exportedPriv = await crypto.subtle.exportKey("pkcs8", privateKey);
      const privArray = Array.from(new Uint8Array(exportedPriv));
      localStorage.setItem("privateKey", JSON.stringify(privArray));

      const { data } = await api.post("/auth/register", {
        email,
        name,
        password,
        publicKey,
      });

      localStorage.setItem("token", data.token);
      navigate("/dashboard", { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral p-4">
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
          className="w-full bg-blue-700 text-white p-3 rounded hover:bg-secondary text-lg font-semibold"
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
    </div>
  );
};

export default Register;
