export default function InterviewInfoPanel({ duration, questionCount, path , module }) {
  return (
    <div className="absolute top-20 left-8 bg-slate-800/50 backdrop-blur-sm rounded-lg p-4 border border-purple-500/20">
      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-gray-300">Duration: {duration}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          <span className="text-gray-300">Questions: {questionCount}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span className="text-gray-300">Path: {path}</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
          <span className="text-gray-300">Module: {module}</span>
        </div>
      </div>
    </div>
  );
}
