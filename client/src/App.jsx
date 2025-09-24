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
import { InterviewOPtions } from "./pages/InterviewOptions";
import { PremiumInfo } from "./pages/PremiumInfo";
import { DiscussPage } from "./pages/DiscussPage";
import { ExplorePage } from "./pages/Explore";

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
            <Route
              path="/interview"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <InterviewOPtions />
                </ProtectedRoute>
              }
            />
            <Route path="/premium" element={<PremiumInfo />} />
            <Route path="/discuss" element={<DiscussPage />} />
            <Route path="/explore" element={<ExplorePage />} />
          </Route>

          {/* Auth routes without Navbar */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
          </Route>
          <Route path="/home" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
