export default function InterviewCancelledModal() {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl p-8 max-w-md mx-4 border border-purple-500/20 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">
          Interview Cancelled
        </h2>
        <p className="text-gray-300 mb-6">
          You have exited full screen. The interview is cancelled. No progress
          will be saved. You will be navigated to home screen now.
        </p>
      </div>
    </div>
  );
}