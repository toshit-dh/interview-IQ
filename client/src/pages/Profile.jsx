// src/pages/Profile.jsx
import React from "react";

export default function Profile() {
  const user = {
    name: "Toshit",
    email: "toshit@example.com",
    bio: "Aspiring Software Engineer | DSA & System Design Enthusiast 🚀",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded-2xl p-6 w-80 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{user.name}</h2>
        <p className="text-gray-600 mb-1">{user.email}</p>
        <p className="text-gray-500">{user.bio}</p>
      </div>
    </div>
  );
}
