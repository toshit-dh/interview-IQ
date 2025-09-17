import { useState } from "react";
import { Brain, Mail, Lock, User, ArrowRight, Eye, EyeOff, UserPlus, Sparkles } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { UserApi } from "../../api/UserApi";
import toast, { Toaster } from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await UserApi.register(form);
      toast.success(res.message || "Registered successfully! Check your email.", {
        duration: 4000,
        position: 'bottom-left',
        style: {
          background: '#10B981',
          color: '#ffffff',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
        },
        iconTheme: {
          primary: '#ffffff',
          secondary: '#10B981',
        },
      });

      setLoading(false);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed.",
        {
          duration: 4000,
          position: 'bottom-left',
          style: {
            background: '#EF4444',
            color: '#ffffff',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
          },
          iconTheme: {
            primary: '#ffffff',
            secondary: '#EF4444',
          },
        }
      );
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-4 relative overflow-hidden min-h-screen">
      <Toaster
        position="bottom-left"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: '',
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 4000,
            theme: {
              primary: '#10B981',
              secondary: '#ffffff',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: '#EF4444',
              secondary: '#ffffff',
            },
          },
        }}
      />
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-60 h-60 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-32 w-60 h-60 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-500"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-15 animate-pulse delay-700"></div>
      </div>
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-8 items-center w-full">
          <div className="hidden lg:block">
            <div className="text-center lg:text-left mb-6">
              <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Interview-IQ</span>
              </div>
              
              <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                Start Your Journey to
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block">
                  Career Success
                </span>
              </h1>
              
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Join thousands of professionals who have transformed their interview skills with our AI-powered platform.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-purple-400">10K+</div>
                  <div className="text-xs text-gray-300">Users Trained</div>
                </div>
                <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 text-center">
                  <div className="text-2xl font-bold text-pink-400">95%</div>
                  <div className="text-xs text-gray-300">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-white/10 p-4 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop" 
                  alt="Team Collaboration"
                  className="w-full rounded-xl shadow-lg"
                />
                <div className="absolute top-3 right-3 bg-purple-500 rounded-full w-2 h-2 animate-pulse"></div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-lg rounded-lg px-2 py-1 text-white text-xs">
                  🚀 Career Growth Ahead
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-green-400 to-blue-500 rounded-full p-2 shadow-lg animate-bounce">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <div className="absolute -bottom-4 -left-4 bg-pink-500 rounded-lg p-2 shadow-lg animate-bounce delay-300">
                <UserPlus className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <div className="w-full lg:mx-0">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl border border-white/20 p-6 lg:p-8 shadow-2xl">
              
              <div className="lg:hidden text-center mb-6">
                <div className="flex items-center justify-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-white">Interview-IQ</span>
                </div>
              </div>

              <div className="text-center mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  Create Account
                </h2>
                <p className="text-gray-300 text-sm">Join the community of successful professionals</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center mb-2 font-medium text-gray-300 text-sm">
                    <User className="w-4 h-4 mr-2 text-purple-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="flex items-center mb-2 font-medium text-gray-300 text-sm">
                    <Mail className="w-4 h-4 mr-2 text-purple-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="john@company.com"
                    className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="flex items-center mb-2 font-medium text-gray-300 text-sm">
                    <Lock className="w-4 h-4 mr-2 text-purple-400" />
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Create a strong password"
                      className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>Password should contain:</p>
                  <ul className="ml-4 space-y-1">
                    <li className={`flex items-center ${form.password.length >= 8 ? 'text-green-400' : 'text-gray-500'}`}>
                      <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                      At least 8 characters
                    </li>
                    <li className={`flex items-center ${form.password.trim() === form.password ? 'text-green-400' : 'text-gray-500'}`}>
                      <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                      No spaces at start or end
                    </li>
                    <li className={`flex items-center ${/[0-9]/.test(form.password) ? 'text-green-400' : 'text-gray-500'}`}>
                      <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                      One number
                    </li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Create Account
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </form>
              <div className="text-center mt-4">
                <p className="text-xs text-gray-400">
                  By creating an account, you agree to our{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-purple-400 hover:text-purple-300 underline">
                    Privacy Policy
                  </a>
                </p>
              </div>
              <div className="text-center mt-6 pt-4 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-purple-400 font-semibold hover:text-purple-300 transition-colors duration-200 hover:underline"
                  >
                    Sign In
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}