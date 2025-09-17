import { useState } from "react";
import { Brain, Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  console.log(user);
  

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-black/20 backdrop-blur-lg">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                Interview-IQ
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              {user && (
                <Link
                  to={`/profile/${user.id}`}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Profile
                </Link>
              )}
              <Link
                to="/explore"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Explore
              </Link>
              <Link
                to="/contest"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contest
              </Link>
              <Link
                to="/discuss"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Discuss
              </Link>
              <Link
                to="/premium"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Premium
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 hover:text-red-300 transition-all border border-red-500/30"
              >
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-white"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-black/90 backdrop-blur-lg">
            <div className="px-4 pt-2 pb-4 space-y-2">
              {user && (
                <Link
                  to={`/profile/${user._id}`}
                  className="block py-2 text-gray-300 hover:text-white transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
              )}
              <Link
                to="/explore"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Explore
              </Link>
              <Link
                to="/contest"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contest
              </Link>
              <Link
                to="/discuss"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Discuss
              </Link>
              <Link
                to="/premium"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Premium
              </Link>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  handleLogout();
                }}
                className="block w-full text-left py-2 text-red-400 hover:text-red-300 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
