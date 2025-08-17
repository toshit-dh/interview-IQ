import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserApi } from "../../api/UserApi";

export default function VerifyEmail() {
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying your email...");
  const [type, setType] = useState("loading"); // "loading" | "success" | "error"
  const navigate = useNavigate();

  useEffect(() => {
    async function verify() {
      try {
        const res = await UserApi.verifyEmail(token);
        setStatus(res.data.message || "Email verified successfully!");
        setType("success");
      } catch (err) {
        setStatus(err.response?.data?.message || "Verification failed.");
        setType("error");
      }
    }

    if (token) verify();
  }, [token]);

  const statusColors = {
    loading: "text-blue-500",
    success: "text-green-600",
    error: "text-red-600",
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-blue-100">
      <div className="bg-white p-12 rounded-2xl shadow-xl max-w-md w-full text-center">
        <h1 className={`text-3xl font-extrabold mb-6 ${statusColors[type]}`}>
          {status}
        </h1>

        {type === "loading" && (
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 border-4 border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
        )}

        {type === "success" && (
          <button
            onClick={() => navigate("/login")}
            className="mt-4 px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition"
          >
            Go to Login
          </button>
        )}

        {type === "error" && (
          <button
            onClick={() => navigate("/signup")}
            className="mt-4 px-8 py-3 bg-red-600 text-white font-semibold rounded-lg shadow hover:bg-red-700 transition"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
