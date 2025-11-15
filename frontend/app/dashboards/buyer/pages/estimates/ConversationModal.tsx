import React, { useState } from "react";

type ConversationModalProps = {
  onClose: () => void;
  recipientId: number;
  recipientName: string;
};

export default function ConversationModal({ onClose, recipientId, recipientName }: ConversationModalProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

const handleSendMessage = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Token manquant, reconnectez-vous.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        recipient_id: recipientId,
        message,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Erreur API ${res.status}: ${errText}`);
    }

    setMessage("");
    setTimeout(() => {
      onClose();
    }, 1000);
  } catch (err) {
    console.error("Erreur lors de la création de la conversation", err);
    setError("Erreur lors de l’envoi du message. Réessayez.");
  } finally {
    setIsLoading(false);
  }
};




  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Nouveau Message</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            &times;
          </button>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Destinataire</label>
          <div className="bg-gray-100 p-3 rounded-lg">
            <span className="font-medium">{recipientName}</span>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tapez votre message ici..."
            rows={6}
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#1221ca] resize-none"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg text-sm">
            Message envoyé avec succès !
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Annuler
          </button>
          <button
            onClick={handleSendMessage}
            disabled={isLoading || success}
            className="flex-1 bg-[#1221ca] text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Envoi..." : success ? "Envoyé !" : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}