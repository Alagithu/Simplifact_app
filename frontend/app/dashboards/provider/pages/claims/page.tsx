"use client";
import { useEffect, useState } from "react";
import AddClaimModal from "./AddClaimModal";
import ViewClaimModal from "./ViewClaimModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FileText,
  FileSignature,
  MessageSquare,
  AlertCircle,
  LogOut,
  Menu,
  PlusCircle,
  Eye,
  Trash2,
} from "lucide-react";

const Claims = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Déconnexion
  const handleLogout = async () => {
    try {
      if (!token) {
        router.push("/");
        return;
      }

      await fetch("/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).catch(() => {});

      localStorage.clear();
      router.push("/");
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    }
  };

  //Charger les réclamations
  useEffect(() => {
    if (!token) return;
    const fetchClaims = async () => {
      try {
        const res = await fetch("/api/reclamation", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Erreur lors du chargement");
        const data = await res.json();
        setClaims(data);
      } catch (err) {
        console.error("Erreur chargement réclamations:", err);
      }
    };
    fetchClaims();
  }, [token]);

  // Actions
  const handleSaveClaim = (newClaim: any) => setClaims((prev) => [...prev, newClaim]);
  const handleViewClaim = (id: number) => {
    const claim = claims.find((c) => c.id === id);
    setSelectedClaim(claim);
    setIsViewModalOpen(true);
  };
  const handleDeleteClaim = async (id: number) => {
    try {
      const res = await fetch(`/api/reclamation/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setClaims(claims.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
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
            <Link href="/dashboards/provider" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <LayoutDashboard size={18} /> <span>Dashboard</span>
            </Link>
            <Link href="/dashboards/provider/pages/messages" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <MessageSquare size={18} /> <span>Messages</span>
            </Link>
            <Link href="/dashboards/provider/pages/estimates" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <FileSignature size={18} /> <span>Estimates</span>
            </Link>
            <Link href="/dashboards/provider/pages/products" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <Package size={18} /> <span>Products</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-[#1221ca] hover:bg-blue-700 transition">
              <AlertCircle size={18} /> <span>Claims</span>
            </Link>
          </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main*/}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full">
        
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} className="text-[#1221ca]" />
          </button>
          <h2 className="text-xl font-semibold text-[#1221ca]">Claims</h2>
        </div>

        <h2 className="hidden md:block text-2xl font-semibold mb-6 text-[#1221ca]">
          Claims Management
        </h2>

        <div className="flex justify-end mb-4">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#1221ca] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusCircle size={18} /> Add Claim
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.length > 0 ? claims.map((c) => (
                  <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                    <td className="px-4 py-2">{c.id}</td>
                    <td className="px-4 py-2 font-medium">{c.title}</td>
                    <td className="px-4 py-2 truncate max-w-[200px]">{c.description}</td>
                    <td className="px-4 py-2">{new Date(c.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewClaim(c.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center gap-1"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClaim(c.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-gray-500 italic">
                      No claims found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modals */}
      {isAddModalOpen && <AddClaimModal onClose={() => setIsAddModalOpen(false)} onSave={handleSaveClaim} />}
      {isViewModalOpen && selectedClaim && <ViewClaimModal onClose={() => setIsViewModalOpen(false)} claimData={selectedClaim} />}
    </div>
  );
};

export default Claims;
