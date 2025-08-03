import React from "react";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral to-gray-100 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-4">
            Secure File-Sharing Platform with E2EE
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            A web-based platform ensuring end-to-end encryption for confidential
            file sharing. Built with React, Node.js, and AWS, it prioritizes
            privacy, usability, and performance while mitigating vulnerabilities
            like XSS and session hijacking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Project Aim */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Project Aim
            </h2>
            <p className="text-gray-600">
              Design and develop a secure web-based file-sharing platform
              implementing end-to-end encryption to protect against unauthorized
              access, balancing security with usability and performance.
            </p>
          </div>

          {/* Card 2: Key Features */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Key Features
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Client-side E2EE using WebCrypto API (AES-GCM & RSA-OAEP)</li>
              <li>User authentication with JWT and key management</li>
              <li>File upload, sharing, and download with AWS S3 storage</li>
              <li>
                Security mitigations: XSS prevention, session timeout, CSRF
                tokens
              </li>
              <li>Responsive UI for cross-device access</li>
            </ul>
          </div>

          {/* Card 3: Tech Stack */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Tech Stack
            </h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Frontend: React (Vite + TS), Tailwind CSS, React Query</li>
              <li>Backend: Node.js (Express + TS), MongoDB, AWS S3</li>
              <li>Security: WebCrypto, JWT, React Idle Timer</li>
              <li>Routing: React Router</li>
            </ul>
          </div>

          {/* Card 4: Objectives Overview */}
          <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 md:col-span-2 lg:col-span-3">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">
              Project Objectives
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p className="text-gray-600">
                Investigate current file-sharing models and vulnerabilities.
              </p>
              <p className="text-gray-600">
                Develop web app with client-side E2EE.
              </p>
              <p className="text-gray-600">
                Implement user-friendly key management.
              </p>
              <p className="text-gray-600">
                Conduct security analysis (XSS, session hijacking).
              </p>
              <p className="text-gray-600">
                Evaluate performance across browsers.
              </p>
            </div>
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-white py-4 text-center">
        <p>&copy; 2025 Isaac Ayodeji Ogunleye. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
