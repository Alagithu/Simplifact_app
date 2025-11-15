"use client";

import { useState } from "react";

export default function AddClaimModal({ onClose, onSave }) {
  const [claimData, setClaimData] = useState({
    title: "",
    description: "",
  });

  const handleClaimChange = (e) => {
    setClaimData({ ...claimData, [e.target.name]: e.target.value });
  };

  const handleSaveClaim = async (e) => {
    e.preventDefault();
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      console.error("Token manquant, impossible d'ajouter la réclamation.");
      return;
    }

    try {
      const res = await fetch("/api/reclamation/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(claimData),
      });

      if (!res.ok) throw new Error(`Erreur serveur: ${res.status}`);

      const result = await res.json();
      console.log("Réclamation ajoutée:", result);

      onSave(result);
      onClose();
    } catch (error) {
      console.error("Erreur lors de l'ajout de la réclamation:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Claim</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl font-bold">
            &times;
          </button>
        </div>

        <form onSubmit={handleSaveClaim}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Title</label>
              <input
                type="text"
                name="title"
                value={claimData.title}
                onChange={handleClaimChange}
                className="w-full border rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                name="description"
                value={claimData.description}
                onChange={handleClaimChange}
                className="w-full border rounded-md p-2 h-32"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
