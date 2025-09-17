import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full bg-gray-100">
      <Outlet /> 
    </div>
  );
}
