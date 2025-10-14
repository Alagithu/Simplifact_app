"use client";

export default function ViewClaimModal({ onClose, claimData }) {
  if (!claimData) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Détails Claim</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="space-y-3">
          <h3 className="text-2xl font-semibold text-gray-800">Claim</h3>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Title:</span> {claimData.title}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Description:</span> {claimData.description}
          </p>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Date:</span>{" "}
            {new Date(claimData.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
