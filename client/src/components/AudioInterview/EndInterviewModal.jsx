export default function EndConfirmModal({ onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-xl p-8 max-w-md mx-4 border border-purple-500/20 shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-4">End Interview?</h2>
        <p className="text-gray-300 mb-6">
          Are you sure you want to end this interview? Your progress will be
          saved and analyzed.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all"
          >
            End Interview
          </button>
        </div>
      </div>
    </div>
  );
}