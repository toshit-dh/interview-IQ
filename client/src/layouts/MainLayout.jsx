import Navbar from "../components/Navbar";
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  return (
    <div>
      <Navbar />
      <div className="p-4">
        <Outlet /> 
      </div>
    </div>
  );
}
