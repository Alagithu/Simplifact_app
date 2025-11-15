"use client";
import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, PlusCircle, Eye, Trash2, LogOut, LayoutDashboard, MessageSquare, FileSignature, Package, AlertCircle } from "lucide-react";
import AddEstimateModal from "./AddEstimateModal";
import ViewEstimateModal from "./ViewEstimateModal";

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

export default function EstimateList() {
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const ITEMS_PER_PAGE = 6;

  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  //Déconnexion
  const handleLogout = async () => {
    if (!token) return router.push("/");
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.clear();
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  // Récupérer les estimates
  useEffect(() => {
    if (!token) return;
    const fetchEstimates = async () => {
      try {
        const res = await fetch("/api/devis/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Estimate[] = await res.json();
        setEstimates(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchEstimates();
  }, [token]);

  // Filtrage et pagination
  const filteredEstimates = useMemo(() => {
    const filtered = filterDate
      ? estimates.filter((e) => e.created_at.startsWith(filterDate))
      : estimates;
    return [...filtered].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [estimates, filterDate]);

  const totalPages = Math.ceil(filteredEstimates.length / ITEMS_PER_PAGE);
  const paginatedEstimates = filteredEstimates.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  // Actions
  const handleViewEstimate = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/devis/${id}`, {
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
    if (!token) return;
    try {
      const res = await fetch(`/api/devis/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setEstimates(estimates.filter((e) => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEstimate = (newEstimate: Estimate) => {
    setEstimates((prev) => [...prev, newEstimate]);
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 font-inter">
      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 h-full w-64 bg-[#0f172a] text-gray-100 flex flex-col justify-between p-6 shadow-lg transform transition-transform duration-300 z-50 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" width={45} height={45} className="rounded-full" />
              <h1 className="text-lg font-semibold">Provider</h1>
            </div>
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}>✕</button>
          </div>

          <nav className="space-y-3">
            <Link href="/dashboards/provider" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800">
              <LayoutDashboard size={18} /> <span>Dashboard</span>
            </Link>
            <Link href="/dashboards/provider/pages/messages" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800">
              <MessageSquare size={18} /> <span>Messages</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-[#1221ca] hover:bg-blue-700 transition">
              <FileSignature size={18} /> <span>Estimates</span>
            </Link>
            <Link href="/dashboards/provider/pages/products" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800">
              <Package size={18} /> <span>Products</span>
            </Link>
            <Link href="/dashboards/provider/pages/claims" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800">
              <AlertCircle size={18} /> <span>Claims</span>
            </Link>
          </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">

        <div className="flex items-center justify-between mb-6 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} className="text-[#1221ca]" />
          </button>
          <h2 className="text-xl font-semibold text-[#1221ca]">Estimates</h2>
        </div>

        <h2 className="hidden md:block text-2xl font-semibold mb-6 text-[#1221ca]">Estimates Management</h2>

        {/* Filters & Add */}
        <div className="flex justify-between items-center mb-4">
          <input
            type="date"
            className="border px-2 py-1 rounded text-sm"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setCurrentPage(0);
            }}
          />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#1221ca] text-white p-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <PlusCircle size={18} /> Add Estimate
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-5 gap-4 font-semibold bg-gray-100 py-3 px-4 text-sm text-gray-600">
            <div>Ref</div>
            <div>Category</div>
            <div>Date</div>
            <div>Amount</div>
            <div>Actions</div>
          </div>

          {paginatedEstimates.length ? (
            paginatedEstimates.map((estimate) => (
              <div key={estimate.id} className="grid grid-cols-5 gap-4 items-center py-3 px-4 border-b text-sm">
                <div>{estimate.ref_devis}</div>
                <div>{estimate.categorie ?? "-"}</div>
                <div>{new Date(estimate.created_at).toLocaleDateString()}</div>
                              <div className="font-semibold">
                  ${Number(estimate.total ?? 0).toFixed(2)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewEstimate(estimate.id)}
                    className="bg-green-500 hover:bg-green-600 text-white p-1.5 rounded"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteEstimate(estimate.id)}
                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-gray-500">No estimates found.</div>
          )}

          {/* Pagination */}
          <div className="flex justify-between mt-4 items-center text-sm">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
              disabled={currentPage === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span>
              Page {currentPage + 1} / {totalPages || 1}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
              disabled={currentPage + 1 >= totalPages}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      {isAddModalOpen && <AddEstimateModal onClose={() => setIsAddModalOpen(false)} onSave={handleSaveEstimate} />}
      {isViewModalOpen && selectedEstimate && <ViewEstimateModal onClose={() => setIsViewModalOpen(false)} estimateData={selectedEstimate} />}
    </div>
  );
}
