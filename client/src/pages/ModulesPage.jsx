// pages/ModulePage.js
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { Clock, Target, Play } from "lucide-react";
import InterviewApi from "../../api/InterviewApi";
import InterviewOptionsDialog from "../components/InterviewOptionsDialog";
import { LoadingPage } from "../components/Loader";
export default function ModulePage() {
  const { pathId } = useParams();
  const navigate = useNavigate();

  const [showDialog, setShowDialog] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null); // ✅ track selected module
  const [path, setPath] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  async function fetchModules() {
    try {
      setLoading(true);

      // Start fetching and a 2s minimum timer simultaneously
      const [res] = await Promise.all([
        InterviewApi.getModuleOfPath(pathId),
        new Promise((resolve) => setTimeout(resolve, 2000)) // 2s delay
      ]);

      console.log(res);
      setPath(res.path); 
      setModules(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false); // Stops loader after at least 2s
    }
  }

  fetchModules();
}, [pathId]);

  if (loading) {
    return (
      <LoadingPage text={`Fetching modules .... `}/>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Path not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
          >
            <Icons.ArrowLeft className="w-4 h-4" />
            <span>Back to Paths</span>
          </button>
        </div>

        {/* Modules Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Icons.Layers className="w-6 h-6 mr-3 text-purple-400" />
            Learning Modules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <ModuleCard
                key={module._id}
                module={module}
                onClick={(mod) => {
                  setSelectedModule(mod);
                  setShowDialog(true);
                }}
              />
            ))}
          </div>
        </div>

        {/* Render dialog at page level */}
        {showDialog && selectedModule && (
          <InterviewOptionsDialog
            module={selectedModule}
            path={path}
            onClose={() => setShowDialog(false)}
          />
        )}
      </div>
    </div>
  );
}

function ModuleCard({ module, onClick }) {
  const Icon = Icons[module.icon];

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center ${module.bgColor}`}
        >
          {Icon ? <Icon className={`w-6 h-6 ${module.textColor}`} /> : null}
        </div>
      </div>

      <h3 className={`text-lg font-bold mb-2 ${module.textColor}`}>
        {module.name}
      </h3>

      <p className="text-gray-400 text-sm mb-4">{module.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-1 bg-gray-700 rounded-full overflow-hidden">
            <div className="w-1/3 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
          </div>
          <span className="text-xs text-gray-400">Progress: 33%</span>
        </div>

        <button
          className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 bg-gradient-to-r ${module.color} text-white hover:shadow-md flex items-center space-x-2`}
          onClick={() => onClick(module)} // ✅ pass module
        >
          <Play className="w-4 h-4" />
          <span>Start</span>
        </button>
      </div>
    </div>
  );
}