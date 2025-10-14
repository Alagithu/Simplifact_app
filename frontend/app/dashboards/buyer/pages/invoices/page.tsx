"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import ViewInvoiceModal from "./ViewInvoiceModal";
import AddInvoiceModal from "./AddInvoiceModal";
import { useRouter } from "next/navigation"

type LineItem = {
  ref_produit: string;
  nom_produit: string;
  quantite: number;
  prix_unitaire: number;
  total_ligne: number;
};

export type InvoiceData = {
  id: number;
  ref_facture: string;
  name_client: string;
  created_at: string;
  montant_ht: number;
  tva: number;
  montant_ttc: number;
  mode_paiement: string;
  lines: LineItem[];
};

export default function InvoiceList() {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);

  const [filterDate, setFilterDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const ITEMS_PER_PAGE = 6;

  const filteredInvoices = invoices
    .filter((inv) => (filterDate ? inv.created_at.startsWith(filterDate) : true))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const totalPages = Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE);
  const paginatedInvoices = filteredInvoices.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

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

  // ✅ Charger factures depuis /api/facture
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    (async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/facture/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const facturesData: InvoiceData[] = await res.json();
        setInvoices(facturesData);
      } catch (err) {
        console.error("Erreur lors de la récupération des factures:", err);
      }
    })();
  }, []);

  // ✅ Ajouter facture
  const handleSaveInvoice = (createdInvoice: any) => {
    if (createdInvoice?.data) {
      setInvoices((prev) => [...prev, createdInvoice.data]); // le backend renvoie { message, data }
    }
    setIsAddModalOpen(false);
  };

  // ✅ Voir facture
  const handleViewInvoice = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/facture/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const invoiceData: InvoiceData = await res.json();
      setSelectedInvoice(invoiceData);
      setIsViewModalOpen(true);
    } catch (err) {
      console.error("Erreur lors de la récupération de la facture:", err);
    }
  };

  // ✅ Supprimer facture
  const handleDeleteInvoice = async (id: number) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/facture/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      }
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
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
                   <Link href="/dashboards/buyer" className="flex items-center p-3 rounded-md  hover:bg-gray-800">
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
                            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 11V8a1 1 0 012 0v3a1 1 10 11-2 0zM10 15a1 1 0 110-2 1 1 0 010 2z"></path>
                        </svg>
                            Invoices
                        </Link> 
                    </li>
                  <li className="mb-4">
                    <Link href="/dashboards/buyer/pages/estimates" className="flex items-center p-3 rounded-md hover:bg-gray-800">
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM15 8.114a1 1 0 011-1h2.5L12 1.5 3.5 7.114H6a1 1 0 011 1v7.5A1.5 1.5 0 008.5 17h3a1.5 1.5 0 001.5-1.5V8.114z"></path>
                      </svg> 
                        Estimates 
                    </Link> 
                  </li> 
                  <li className="mb-4">
                    <Link href="/dashboards/buyer/pages/products" className="flex items-center p-3 rounded-md hover:bg-gray-800">
                      <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 11a1 1 0 012 0v2a1 1 0 11-2 0v-2z"></path>
                      </svg> 
                        Products
                    </Link> 
                  </li>
                  <li className="mb-4"> 
                    <Link href="/dashboards/buyer/pages/claims" className="flex items-center p-3 rounded-md hover:bg-gray-800"> 
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

      {/* Contenu principal */}
            <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-[#1221ca] text-white p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold">Buyer</h2>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="font-bold text-lg">Invoices</div>
            <div className="flex gap-2">
                <input
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="border px-2 py-1 rounded"
                />
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                Add Invoice
            </button>
            </div>

            </div>
                <div className="grid grid-cols-5 gap-4 font-bold border-b pb-2">
                <div>Ref</div>
                <div>Client</div>
                <div>Date</div>
                <div>Amount</div>
                <div>Actions</div>
            </div>

            {paginatedInvoices.map((invoice) => (
            <div key={invoice.id} className="border-b">
            <div className="grid grid-cols-5 gap-4 py-2">
            <div >{invoice.ref_facture}</div>
            <div >{invoice.name_client}</div>
            <div >{new Date(invoice.created_at).toLocaleDateString()}</div>
            <div >${invoice.montant_ttc}</div>
            <div className="flex gap-1">
                <button
                onClick={() => handleViewInvoice(invoice.id)}
                className="px-2 py-1 bg-green-500 text-white rounded-md"
                >
                View
                </button>
                <button
                onClick={() => handleDeleteInvoice(invoice.id)}
                className="px-2 py-1 bg-red-500 text-white rounded-md"
                >
                Delete
                </button>
            </div>
            </div>
        </div>
        ))}
        {/* Pagination */}
        <div className="flex justify-center items-center mt-4 space-x-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 0}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {currentPage + 1} / {totalPages || 1}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

              {/* Modals */}
      {isAddModalOpen && (
        <AddInvoiceModal onClose={() => setIsAddModalOpen(false)} onSave={handleSaveInvoice} />
      )}
      {isViewModalOpen && selectedInvoice && (
        <ViewInvoiceModal
          invoiceData={selectedInvoice}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
    </div> 
</div>   
  );
}