import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = () => {
    // Dummy login
    login({ name: "Toshit", email: "toshit@example.com" });
    navigate("/dashboard"); // redirect after login
  };

  return (
    <div className="bg-white p-6 rounded shadow w-80">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <button
        onClick={handleLogin}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Login as Demo User
      </button>
    </div>
  );
}
