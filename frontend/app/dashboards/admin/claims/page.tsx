"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ViewClaimModal from "./ViewClaimModal";
import { LayoutDashboard,Eye,Trash2, Users, Package, AlertCircle, LogOut } from "lucide-react";

export default function ClaimsPage() {
  const [claims, setClaims] = useState<any[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const router = useRouter();
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

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

  //Voir une réclamation
  const handleViewClaim = (id: number) => {
    const claim = claims.find((c) => c.id === id);
    setSelectedClaim(claim);
    setIsViewModalOpen(true);
  };

  //Supprimer une réclamation
  const handleDeleteClaim = async (id: number) => {
    try {
      const res = await fetch(`/api/reclamation/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setClaims(claims.filter((claim) => claim.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  };

  //Charger toutes les réclamations
  useEffect(() => {
    const fetchClaims = async () => {
      if (!token) return;
      try {
        const res = await fetch("/api/reclamation/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setClaims(data);
      } catch (error) {
        console.error("Erreur lors du chargement :", error);
      }
    };
    fetchClaims();
  }, [token]);

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 font-inter">
      <aside className="w-64 bg-[#0f172a] text-gray-100 flex flex-col justify-between p-6 shadow-lg">
        <div>
          <div className="flex items-center mb-8 space-x-3">
            <img src="/logo.png" alt="Logo" width={45} height={45} className="rounded-full" />
            <h1 className="text-lg font-semibold">Admin</h1>
          </div>
          <nav className="space-y-3">
            <Link
              href="/dashboards/admin"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition"
            >
              <LayoutDashboard size={18} /> <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboards/admin/user"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition"
            >
              <Users size={18} /> <span>Users</span>
            </Link>
            <Link
              href="/dashboards/admin/product"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition"
            >
              <Package size={18} /> <span>Products</span>
            </Link>
            <Link
              href="#"
              className="flex items-center space-x-3 p-3 rounded-lg bg-[#1221ca] hover:bg-blue-700 transition"
            >
              <AlertCircle size={18} /> <span>Claims</span>
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition"
        >
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </aside>
      {/* Main */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-semibold text-[#1221ca]">Claims Management</h2>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">All Claims</h3>
            <span className="text-sm text-gray-500">
              Total: <strong>{claims.length}</strong>
            </span>
          </div>

          {/*Table*/}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-gray-700 uppercase text-xs font-semibold border-b">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Sender</th>

                  <th className="p-3">Title</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Date</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {claims.length > 0 ? (
                  claims.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                      <td className="p-3 font-medium text-gray-800">{c.id}</td>
                      <td className="p-3 text-gray-700">{c.user?.name || "—"}</td>
                      <td className="p-3">{c.title}</td>
                      <td className="p-3 text-gray-600 truncate max-w-[250px]">{c.description}</td>
                      <td className="p-3 text-gray-500">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 flex justify-center gap-2">
                        <button
                          onClick={() => handleViewClaim(c.id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteClaim(c.id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center text-gray-500 py-6">
                      No claims found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/*Modal*/}
        {isViewModalOpen && selectedClaim && (
          <ViewClaimModal
            onClose={() => setIsViewModalOpen(false)}
            claimData={selectedClaim}
          />
        )}
      </main>
    </div>
  );
}
