import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import InterviewApi from "../../api/InterviewApi";
import { Globe, Search } from "lucide-react";

export function ExplorePage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getPaths() {
      try {
        setLoading(true);
        const res = await InterviewApi.getPaths();
        setPaths(res.data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    getPaths();
  }, []);

  const filteredPaths = paths.filter(
    (path) =>
      path.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PathCard = ({ path }) => {
    const Icon = Icons[path.icon];
    return (
      <div
        className={`relative rounded-xl shadow-lg border transition-all duration-300 cursor-pointer transform hover:scale-105 bg-gradient-to-br from-slate-800 to-slate-900 ${path.borderColor} hover:border-opacity-60`}
        onClick={() => navigate(`/modules/${path._id}`)} // Navigate to module page
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${path.bgColor}`}
            >
              {Icon ? <Icon className={`w-7 h-7 ${path.textColor}`} /> : null}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${path.bgColor} ${path.textColor}`}
            >
              {path.category}
            </span>
          </div>

          <h3 className={`text-xl font-bold mb-3 ${path.textColor}`}>
            {path.name}
          </h3>

          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {path.description}
          </p>

          <button
            className={`w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 bg-gradient-to-r ${path.color} text-white hover:shadow-lg`}
          >
            Explore Path
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center">
            <Globe className="w-8 h-8 mr-3 text-purple-400" />
            Explore Learning Paths
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Discover structured learning journeys tailored to your career goals
          </p>
          <p className="text-gray-400">
            Choose from our comprehensive paths and start your interview
            preparation
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search learning paths..."
              className="w-full pl-12 pr-6 py-4 bg-slate-800 border border-gray-700 rounded-xl text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {[
            "All",
            "Technical",
            "Career",
            "Government",
            "Finance",
            "Marketing",
          ].map((category) => (
            <button
              key={category}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                category === "All"
                  ? "bg-purple-500 text-white"
                  : "bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPaths.map((path, index) => (
            <PathCard key={index} path={path} />
          ))}
        </div>

        {/* No results */}
        {filteredPaths.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              No paths found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms or browse all available paths
            </p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Popular Paths */}
        {!searchTerm && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-white mb-8 text-center">
              🔥 Most Popular Paths
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paths.slice(0, 3).map((path, index) => (
                <div key={index} className="relative">
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      🔥 HOT
                    </div>
                  </div>
                  <PathCard path={path} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
