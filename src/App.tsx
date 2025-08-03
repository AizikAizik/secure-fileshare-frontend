import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useIdleTimer } from "react-idle-timer";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import Register from "./components/Register";

const App: React.FC = () => {
  const navigate = useNavigate();
  const timeout = 10 * 60 * 1000; // 10 minutes

  const onIdle = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("privateKey"); // Clear sensitive data
    navigate("/login", { replace: true }); // Redirect to login, replace history
  };

  useIdleTimer({
    timeout,
    onIdle,
    debounce: 500,
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      navigate("/login", { replace: true });
    };
    window.addEventListener("unauthorized", handleUnauthorized);
    return () => window.removeEventListener("unauthorized", handleUnauthorized);
  }, [navigate]);

  return (
    <div className="min-h-screen min-w-screen bg-gray-100 flex items-center justify-center">
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<div>Login Placeholder</div>} />{" "}
        {/* Add Login.tsx later */}
        <Route
          path="/dashboard"
          element={<div>Dashboard Placeholder</div>}
        />{" "}
        {/* Add Dashboard.tsx later */}
        <Route path="/" element={<div>Home Placeholder</div>} />
      </Routes>
    </div>
  );
};

// Wrap with BrowserRouter and QueryClientProvider
const AppWrapper: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </QueryClientProvider>
);

export default AppWrapper;
