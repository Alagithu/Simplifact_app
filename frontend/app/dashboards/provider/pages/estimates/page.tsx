"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import AddEstimateModal from "./AddEstimateModal";
import ViewEstimateModal from "./ViewEstimateModal";
import { useRouter } from "next/navigation"

type EstimateLine = {
  id: number;
  ref_produit: string;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
};

type Estimate = {
  id: number;
  ref_devis: string;
  categorie?: string;
  created_at: string;
  total?: number;
  lines?: EstimateLine[];
};

type User = {
  id: number;
  name?: string;
  email?: string;
  categorie?: string;
};

export default function EstimateList() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);


  const router = useRouter()

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token")

      await fetch("http://127.0.0.1:8000/api/logout", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Nettoyer le storage
      localStorage.removeItem("token")
      localStorage.removeItem("role")

      // Rediriger vers la page d'accueil
      router.push("/")
    } catch (error) {
      console.error("Erreur de déconnexion", error)
    }
  }
  // Filtrage et pagination
  const [filterDate, setFilterDate] = useState<string | "">("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const ITEMS_PER_PAGE = 6;

  // Récupérer user et estimates
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchAll = async () => {
      try {
        const userRes = await fetch("http://127.0.0.1:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) setUser(await userRes.json());

        const res = await fetch("http://127.0.0.1:8000/api/devis/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Estimate[] = await res.json();
        setEstimates(data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAll();
  }, []);

  // Estimates filtrées par date et triées (du plus récent au plus ancien)
  const filteredEstimates = estimates
    .filter((e) => (filterDate ? e.created_at.startsWith(filterDate) : true))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Pagination
  const totalPages = Math.ceil(filteredEstimates.length / ITEMS_PER_PAGE);
  const paginatedEstimates = filteredEstimates.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  const handleSaveEstimate = async (newEstimateData: any) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("http://127.0.0.1:8000/api/devis/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEstimateData),
      });

      const text = await res.text();
      const payload = JSON.parse(text);
      const createdEstimate: Estimate = payload.data ?? payload;
      setEstimates((prev) => [...prev, createdEstimate]);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Erreur lors de l'ajout du devis:", error);
    }
  };

  const handleViewEstimate = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/devis/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      setSelectedEstimate(await res.json());
      setIsViewModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEstimate = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/devis/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setEstimates((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
        <div className="w-64 bg-black text-white p-6 flex flex-col justify-between">
         <div>
           <h1 className="text-3xl font-bold mb-10">Logo</h1>
            <nav>
               <ul>
                 <li className="mb-4">
                   <Link href="/dashboards/provider" className="flex items-center p-3 rounded-md  hover:bg-gray-800">
                     <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 11.5a1.5 1.5 0 113 0v4a1.5 1.5 0 11-3 0v-4zM10 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" fillRule="evenodd"></path>
                      </svg>
                         Dashboard 
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link href="#" className="flex items-center p-3 rounded-md hover:bg-gray-800">
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                      </svg>
                       Messages
                    </Link> 
                  </li>
                  <li className="mb-4">
                    <Link href="#" className="flex items-center p-3 rounded-md bg-[#1221ca]">
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM15 8.114a1 1 0 011-1h2.5L12 1.5 3.5 7.114H6a1 1 0 011 1v7.5A1.5 1.5 0 008.5 17h3a1.5 1.5 0 001.5-1.5V8.114z"></path>
                      </svg> 
                        Estimates 
                    </Link> 
                  </li> 
                  <li className="mb-4">
                    <Link href="/dashboards/provider/pages/products" className="flex items-center p-3 rounded-md hover:bg-gray-800">
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 11a1 1 0 012 0v2a1 1 0 11-2 0v-2z"></path>
                      </svg> 
                        Products
                    </Link> 
                  </li>
                  <li className="mb-4"> 
                    <Link href="/dashboards/provider/pages/claims" className="flex items-center p-3 rounded-md hover:bg-gray-800"> 
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
                    <svg
                      className="w-5 h-5 mr-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 11a1 1 0 112 0v2a1 1 0 11-2 0v-2zM10 7a1 1 0 110 2 1 1 0 010-2z"></path>
                    </svg>
                    Logout
                  </button>
              </div>
        </div>
      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-[#1221ca] text-white p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold">Provider</h2>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-lg">Estimates</div>
            <div className="flex gap-2">
              <input
                type="date"
                className="border px-2 py-1 rounded"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setCurrentPage(0); 
                }}
              />
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Add Estimate
              </button>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 font-bold border-b pb-2">
            <div>Ref_Estimate</div>
            <div>Category</div>
            <div>Date</div>
            <div>Amount</div>
            <div>Actions</div>
          </div>

          {paginatedEstimates.length ? (
            paginatedEstimates.map((estimate) => (
              <div key={estimate.id} className="border-b">
                <div className="grid grid-cols-5 gap-4 py-2">
                  <div>{estimate.ref_devis}</div>
                  <div>{user?.categorie ?? estimate.categorie ?? "-"}</div>
                  <div>{new Date(estimate.created_at).toLocaleDateString()}</div>
                  <div>${estimate.total}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewEstimate(estimate.id)}
                      className="bg-green-500 w-1/2 text-white px-3 py-1 rounded"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteEstimate(estimate.id)}
                      className="bg-red-500 w-1/2 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-gray-500">No estimates found.</div>
          )}

          {/* Pagination */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {currentPage + 1} / {totalPages || 1}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage + 1 >= totalPages}
              className="bg-gray-300 px-3 py-1 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {isAddModalOpen && <AddEstimateModal onClose={() => setIsAddModalOpen(false)} onSave={handleSaveEstimate} />}
      {isViewModalOpen && selectedEstimate && (
        <ViewEstimateModal onClose={() => setIsViewModalOpen(false)} estimateData={selectedEstimate} />
      )}
    </div>
  );
}
