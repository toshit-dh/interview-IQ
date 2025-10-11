export default function InterviewInfoPanel({ duration, questionCount, path, interviewConfig }) {
  const { difficulty, llm, interviewType, persona } = interviewConfig || {};
  
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
        
        {/* Interview Configuration */}
        {interviewConfig && (
          <>
            <div className="border-t border-gray-600/30 my-2"></div>
            <div className="text-xs text-gray-400 font-semibold mb-1">Interview Config:</div>
            
            {difficulty && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-gray-300">Difficulty: {difficulty}</span>
              </div>
            )}
            
            {llm && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span className="text-gray-300">AI Model: {llm}</span>
              </div>
            )}
            
            {interviewType && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span className="text-gray-300">Type: {interviewType}</span>
              </div>
            )}
            
            {persona && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-gray-300">Persona: {persona.replace('_', ' ')}</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
