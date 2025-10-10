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
import Welcome from "./pages/Welcome";
import { PremiumInfo } from "./pages/PremiumInfo";
import { DiscussPage } from "./pages/DiscussPage";
import { ExplorePage } from "./pages/Explore";
import { AudioInterview } from "./pages/AudioInterview";
import ModulePage from "./pages/ModulesPage";
import { InterviewSetup } from "./pages/InterviewSetup";

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
              path="/audio/interview/:pathId/:moduleId"
              element={
                <ProtectedRoute allowedRoles={["user", "admin"]}>
                  <AudioInterview />
                </ProtectedRoute>
              }
            />
            <Route path="/interview-setup" element={<InterviewSetup/>}/>
            <Route path="/premium" element={<PremiumInfo />} />
            <Route path="/discuss" element={<DiscussPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/modules/:pathId" element={<ModulePage />} />
          </Route>

          {/* Auth routes without Navbar */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email/:token" element={<VerifyEmail />} />
            <Route path="/welcome" element={<Welcome />} />
          </Route>
          <Route path="/home" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
