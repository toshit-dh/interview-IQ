import { useState } from "react";
import {
  Brain,
  Menu,
  X
} from "lucide-react";
export default function Navbar() {

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-black/20 backdrop-blur-lg">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
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
              <a
                href="#profile"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Profile
              </a>
              <a
                href="#explore"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Explore
              </a>
              <a
                href="#contest"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Contest
              </a>
              <a
                href="#contest"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Discuss
              </a>
              <a
                href="#premium"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Premium
              </a>
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
              <a
                href="#features"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
              >
                Features
              </a>
              <a
                href="#pricing"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
              >
                Pricing
              </a>
              <a
                href="#testimonials"
                className="block py-2 text-gray-300 hover:text-white transition-colors"
              >
                Reviews
              </a>
              <button className="block w-full text-left py-2 text-purple-400 hover:text-purple-300 transition-colors">
                Sign In
              </button>
              <button className="w-full mt-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all">
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
