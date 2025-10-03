import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Code,
  Building,
  TrendingUp,
  Megaphone,
  Briefcase,
  Rocket,
  Palette,
  Link,
  Brain,
  MessageCircle,
  Monitor,
  Server,
  Database,
  Cloud,
  Smartphone,
  Shield,
  Users,
  ArrowLeft,
  Play,
  Clock,
  Target,
  CheckCircle,
  BookOpen,
  Cpu,
  Globe,
  Layers,
  Settings,
  Lock,
  Heart,
} from "lucide-react";

export function ExplorePage() {

  const navigate = useNavigate();

  const [selectedPath, setSelectedPath] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const paths = [
    {
      name: "Technical",
      description:
        "Software development, data science, cloud computing, cybersecurity, and related technologies.",
      category: "Technical",
      icon: Code,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
    },
    {
      name: "Government",
      description:
        "Preparation paths for various government competitive exams.",
      category: "Government",
      icon: Building,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30",
      textColor: "text-green-400",
    },
    {
      name: "Finance",
      description: "Learn finance, investing, trading, and related domains.",
      category: "Finance",
      icon: TrendingUp,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30",
      textColor: "text-yellow-400",
    },
    {
      name: "Marketing",
      description:
        "Digital marketing, SEO, branding, social media, and advertising.",
      category: "Marketing",
      icon: Megaphone,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30",
      textColor: "text-pink-400",
    },
    {
      name: "Career Development",
      description: "Interview mastery, resume building, and career planning.",
      category: "Career",
      icon: Briefcase,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30",
      textColor: "text-purple-400",
    },
    {
      name: "Entrepreneurship",
      description:
        "Business setup, growth strategies, and startup fundamentals.",
      category: "Career",
      icon: Rocket,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/30",
      textColor: "text-indigo-400",
    },
    {
      name: "Design",
      description: "UI/UX, graphic design, and product design fundamentals.",
      category: "Career",
      icon: Palette,
      color: "from-teal-500 to-cyan-500",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/30",
      textColor: "text-teal-400",
    },
    {
      name: "Blockchain",
      description:
        "Smart contracts, blockchain fundamentals, and decentralized applications.",
      category: "Technical",
      icon: Link,
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30",
      textColor: "text-orange-400",
    },
    {
      name: "AI & Machine Learning",
      description: "Learn AI concepts, ML algorithms, and model deployment.",
      category: "Technical",
      icon: Brain,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-500/10",
      borderColor: "border-violet-500/30",
      textColor: "text-violet-400",
    },
    {
      name: "Soft Skills",
      description:
        "Communication, leadership, problem solving, and emotional intelligence.",
      category: "Career",
      icon: MessageCircle,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-400",
    },
  ];

  const modules = [
    {
      name: "Frontend",
      description: "Learn React, Angular, Vue.js, and frontend architecture",
      path_id: "64f12345abcde6789f0a1234",
      interviews_to_complete: 5,
      icon: Monitor,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      name: "Backend",
      description: "Learn Node.js, Express, Java Spring Boot, and backend APIs",
      path_id: "64f12345abcde6789f0a1234",
      interviews_to_complete: 7,
      icon: Server,
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
    },
    {
      name: "DSA",
      description: "Master Data Structures, Algorithms, and problem-solving",
      path_id: "64f12345abcde6789f0a1234",
      interviews_to_complete: 10,
      icon: Cpu,
      color: "from-purple-500 to-violet-500",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
    {
      name: "Database",
      description: "Learn SQL, NoSQL, and database design principles",
      path_id: "64f12345abcde6789f0a1234",
      interviews_to_complete: 4,
      icon: Database,
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-500/10",
      textColor: "text-yellow-400",
    },
    {
      name: "DevOps",
      description:
        "Understand CI/CD, Docker, Kubernetes, and deployment strategies",
      path_id: "64f12345abcde6789f0a1234",
      interviews_to_complete: 6,
      icon: Settings,
      color: "from-indigo-500 to-purple-500",
      bgColor: "bg-indigo-500/10",
      textColor: "text-indigo-400",
    },
    {
      name: "Cloud Computing",
      description: "Learn AWS, Azure, GCP fundamentals and cloud architecture",
      path_id: "64f12345abcde6789f0a1234",
      interviews_to_complete: 5,
      icon: Cloud,
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-500/10",
      textColor: "text-cyan-400",
    },
    {
      name: "Mobile Development",
      description: "Learn Android, iOS, and cross-platform app development",
      path_id: "64f12345abcde6789f0a1234",
      interviews_to_complete: 4,
      icon: Smartphone,
      color: "from-pink-500 to-rose-500",
      bgColor: "bg-pink-500/10",
      textColor: "text-pink-400",
    },
    {
      name: "Cybersecurity",
      description:
        "Understand security principles, encryption, and threat prevention",
      path_id: "64f12345abcde6789f0a1234",
      interviews_to_complete: 6,
      icon: Shield,
      color: "from-red-500 to-orange-500",
      bgColor: "bg-red-500/10",
      textColor: "text-red-400",
    },
    {
      name: "AI & Machine Learning",
      description: "Learn AI concepts, ML algorithms, and model deployment",
      path_id: "64f12345abcde6789f0a1234",
      interviews_to_complete: 8,
      icon: Brain,
      color: "from-violet-500 to-purple-500",
      bgColor: "bg-violet-500/10",
      textColor: "text-violet-400",
    },
    {
      name: "Soft Skills",
      description:
        "Improve communication, teamwork, and problem-solving skills",
      path_id: "64f12345abcde6789f0a1234",
      interviews_to_complete: 3,
      icon: Heart,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
      textColor: "text-emerald-400",
    },
  ];

  const filteredPaths = paths.filter(
    (path) =>
      path.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      path.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PathCard = ({ path, onClick, isSelected }) => {
    const Icon = path.icon;
    return (
      <div
        className={`relative rounded-xl shadow-lg border transition-all duration-300 cursor-pointer transform hover:scale-105 ${
          isSelected ? "ring-2 ring-purple-400 scale-105" : ""
        } bg-gradient-to-br from-slate-800 to-slate-900 ${
          path.borderColor
        } hover:border-opacity-60`}
        onClick={() => onClick(path)}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center ${path.bgColor}`}
            >
              <Icon className={`w-7 h-7 ${path.textColor}`} />
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

  const ModuleCard = ({ module }) => {
    const Icon = module.icon;
    return (
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
        <div className="flex items-start justify-between mb-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${module.bgColor}`}
          >
            <Icon className={`w-6 h-6 ${module.textColor}`} />
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-1 mb-1">
              <Clock className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-400">
                {module.interviews_to_complete} interviews
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-yellow-400">To Complete</span>
            </div>
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
            onClick={() =>
              navigate(`/interview/${module.path_id}/${module._id}`)
            }
          >
            <Play className="w-4 h-4" />
            <span>Start</span>
          </button>
        </div>
      </div>
    );
  };

  if (selectedPath) {
    return (
      <div className="min-h-screen bg-slate-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header with selected path */}
          <div className="mb-8">
            <button
              onClick={() => setSelectedPath(null)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Explore</span>
            </button>

            <div
              className={`bg-gradient-to-r ${selectedPath.color} p-1 rounded-xl`}
            >
              <div className="bg-slate-900 rounded-lg p-6">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center ${selectedPath.bgColor}`}
                  >
                    <selectedPath.icon
                      className={`w-8 h-8 ${selectedPath.textColor}`}
                    />
                  </div>
                  <div>
                    <h1
                      className={`text-3xl font-bold ${selectedPath.textColor} mb-2`}
                    >
                      {selectedPath.name} Path
                    </h1>
                    <p className="text-gray-400 text-lg">
                      {selectedPath.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-6 h-6 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {modules.length}
                  </p>
                  <p className="text-sm text-gray-400">Modules</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <Target className="w-6 h-6 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">
                    {modules.reduce(
                      (sum, m) => sum + m.interviews_to_complete,
                      0
                    )}
                  </p>
                  <p className="text-sm text-gray-400">Total Interviews</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">0</p>
                  <p className="text-sm text-gray-400">Completed</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-4 border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-purple-400" />
                <div>
                  <p className="text-2xl font-bold text-white">~12h</p>
                  <p className="text-sm text-gray-400">Est. Duration</p>
                </div>
              </div>
            </div>
          </div>

          {/* Modules */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Layers className="w-6 h-6 mr-3 text-purple-400" />
              Learning Modules
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module, index) => (
                <ModuleCard key={index} module={module} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <PathCard
              key={index}
              path={path}
              onClick={setSelectedPath}
              isSelected={selectedPath?.name === path.name}
            />
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

        {/* Popular Paths Section */}
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
                  <PathCard
                    path={path}
                    onClick={setSelectedPath}
                    isSelected={selectedPath?.name === path.name}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
