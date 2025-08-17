import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import MainLayout from "./layouts/MainLayout";
import AuthLayout from "./layouts/AuthLayout";

import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyEmail from "./pages/VerifyEmail";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Routes with Navbar */}
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* Protected routes */}
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <Profile />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Auth routes without Navbar */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
