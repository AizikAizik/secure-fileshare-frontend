import React from "react";
import { useNavigate } from "react-router-dom";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;

  const handleLogout = () => {
    localStorage.removeItem("token");
    // localStorage.removeItem("privateKey");
    navigate("/", { replace: true });
  };

  return (
    <nav className="bg-blue-700 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Secure File Share</h1>
        <div className="space-x-4">
          <button
            onClick={() => navigate("/", { replace: true })}
            className="hover:underline"
          >
            Home
          </button>
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => navigate("/login", { replace: true })}
                className="bg-emerald-500 px-4 py-2 rounded hover:bg-green-600"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/register", { replace: true })}
                className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
              >
                Register
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
