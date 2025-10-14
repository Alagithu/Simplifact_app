"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ViewClaimModal from "./ViewClaimModal";

export default function Claims() {
  const [claims, setClaims] = useState<any[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");

      await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Nettoyer le storage
      localStorage.removeItem("token");
      localStorage.removeItem("role");

      // Rediriger vers la page d'accueil
      router.push("/");
    } catch (error) {
      console.error("Erreur de déconnexion", error);
    }
  };

  const handleSaveClaim = (newClaim: any) => {
    setClaims([...claims, newClaim]);
  };

  const handleViewClaim = (id: number) => {
    const claim = claims.find((c) => c.id === id);
    setSelectedClaim(claim);
    setIsViewModalOpen(true);
  };

  // Supprimer une réclamation
  const handleDeleteClaim = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/api/reclamation/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setClaims(claims.filter((claim) => claim.id !== id));
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  // Charger toutes les réclamations
  useEffect(() => {
    const fetchClaims = async () => {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;

      if (!token) {
        console.error("Token manquant, impossible de récupérer les réclamations.");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:8000/api/reclamation", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setClaims(data);
      } catch (error) {
        console.error("Erreur lors du chargement des réclamations:", error);
      }
    };

    fetchClaims();
  }, []);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-6 flex flex-col justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-10">Logo</h1>
          <nav>
            <ul>
              <li className="mb-4">
                <Link
                  href="/dashboards/admin"
                  className="flex items-center p-3 rounded-md hover:bg-gray-800"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 11.5a1.5 1.5 0 113 0v4a1.5 1.5 0 11-3 0v-4zM10 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                    Dashboard
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="/dashboards/admin/user"
                  className="flex items-center p-3 rounded-md hover:bg-gray-800"
                >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM4 15a4 4 0 014-4h4a4 4 0 014 4v1H4v-1z" />
                </svg>
                  Users
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="#"
                  className="flex items-center p-3 rounded-md hover:bg-gray-800"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 11a1 1 0 012 0v2a1 1 0 11-2 0v-2z"></path>
                  </svg> 
                    Products
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="#"
                  className="flex items-center p-3 rounded-md  bg-[#1221ca]"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M17.707 2.293a1 1 0 00-1.414 0L12 6.586 7.707 2.293a1 1 0 10-1.414 1.414L10.586 8 6.293 12.293a1 1 0 101.414 1.414L12 9.414l4.293 4.293a1 1 0 001.414-1.414L13.414 8l4.293-4.293a1 1 0 000-1.414z"></path>
                  </svg> 
                    Claims
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center p-3 rounded-md hover:bg-gray-800 w-full text-left"
          >
          <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 11a1 1 0 112 0v2a1 1 0 11-2 0v-2zM10 7a1 1 0 110 2 1 1 0 010-2z"></path>
          </svg> 
            Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="bg-[#1221ca] text-white p-4 rounded mb-6">
          <h2 className="text-xl font-semibold">Admin</h2>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-lg mb-4">Claims</h3>
          <div className="grid grid-cols-5 gap-4 font-bold border-b pb-2">
            <div>Claim ID</div>
            <div>Title</div>
            <div>Description</div>
            <div>Date</div>
            <div>Actions</div>
          </div>
          {claims.length ? (
            claims.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-5 gap-4 items-center border-b py-3 min-h-[50px]"
              >
                <div>{c.id}</div>
                <div>{c.title}</div>
                <div className="truncate max-w-[200px]">{c.description}</div>
                <div>{new Date(c.created_at).toLocaleDateString()}</div>
                <div className="flex gap-2">
                  <button onClick={() => handleViewClaim(c.id)} className="bg-green-500 text-white px-2 rounded">
                    View
                  </button>
                  <button
                    onClick={() => handleDeleteClaim(c.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="mt-4 text-gray-500">No claims found.</p>
          )}
        </div>
      </main>
      {isViewModalOpen && selectedClaim && (
              <ViewClaimModal onClose={() => setIsViewModalOpen(false)} claimData={selectedClaim} />
            )}
    </div>
  );
}
