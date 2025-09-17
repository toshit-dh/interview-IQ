/* eslint-disable no-unused-vars */
import { useState } from "react";
import { Brain, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { UserApi } from "../../api/UserApi";
import { useAuth } from "../context/AuthContext";
import toast, { Toaster } from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ role: "user", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };


 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await UserApi.login(form);
      toast.success(res.message || "Login successful!", {
        duration: 3000,
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
      //setMessage(res.message || "Login successful!");
      setLoading(false);

      login(res.user);
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      setTimeout(() => navigate("/"), 1000);
    } catch (err) {
      console.error(err);
      //setMessage(
        //err.response?.data?.message ||
          //"Login failed. Please check your credentials."
      //);
       toast.error(
        err.response?.data?.message || "Login failed. Please check your credentials.",
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
            duration: 3000,
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
                Welcome Back to 
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent block">
                  Your Success
                </span>
              </h1>
              
              <p className="text-lg text-gray-300 mb-6 leading-relaxed">
                Continue your journey to mastering interviews with our AI-powered platform.
              </p>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-white/10 p-4 shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=250&fit=crop" 
                  alt="Professional Interview"
                  className="w-full rounded-xl shadow-lg"
                />
                <div className="absolute top-3 right-3 bg-green-500 rounded-full w-2 h-2 animate-pulse"></div>
                <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-lg rounded-lg px-2 py-1 text-white text-xs">
                  🚀 Ready to excel
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-2 shadow-lg animate-bounce">
                <span className="text-white font-bold text-xs">98%</span>
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
                  Welcome Back
                </h2>
                <p className="text-gray-300 text-sm">Sign in to continue your interview preparation</p>
              </div>
              {message && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm text-center font-medium border ${
                    message.toLowerCase().includes("success")
                      ? "bg-green-500/20 border-green-500/30 text-green-300"
                      : "bg-red-500/20 border-red-500/30 text-red-300"
                  } backdrop-blur-lg`}
                >
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="flex items-center mb-2 font-medium text-gray-300 text-sm">
                    <User className="w-4 h-4 mr-2 text-purple-400" />
                    Role
                  </label>
                  <div className="relative">
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer"
                    >
                      <option value="user" className="bg-slate-800 text-white">User</option>
                      <option value="admin" className="bg-slate-800 text-white">Admin</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
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
                    placeholder="name@company.com"
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
                      placeholder="••••••••"
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
                <button
                  type="submit"
                  disabled={loading}
                  className="group w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      Sign In
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </button>
              </form>
              <div className="text-center mt-6 pt-4 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{" "}
                  <button
                    onClick={() => { navigate("/signup") }}
                    className="text-purple-400 font-semibold hover:text-purple-300 transition-colors duration-200 hover:underline"
                  >
                    Create Account
                  </button>
                </p>
              </div>
              <div className="text-center mt-3">
                <a href="#" className="text-gray-500 hover:text-gray-400 text-xs transition-colors duration-200">
                  Forgot your password?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}