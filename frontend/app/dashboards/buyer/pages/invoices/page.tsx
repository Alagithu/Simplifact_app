"use client"

import Link from "next/link"
import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  FileSignature,
  Package,
  MessageSquare,
  AlertCircle,
  LogOut,
  Menu,
  Eye,
  Trash2,
  PlusCircle,
} from "lucide-react"
import ViewInvoiceModal from "./ViewInvoiceModal"
import AddInvoiceModal from "./AddInvoiceModal"

export type LineItem = {
  ref_produit: string
  nom_produit: string
  quantite: number
  prix_unitaire: number
  total_ligne: number
}

export type InvoiceData = {
  id: number
  ref_facture: string
  name_client: string
  created_at: string
  montant_ht: number
  tva: number
  montant_ttc: number
  mode_paiement: string
  lines: LineItem[]
}

const InvoiceList = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [filterDate, setFilterDate] = useState<string>("")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const ITEMS_PER_PAGE = 6

  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  // Déconnexion
  const handleLogout = async () => {
    try {
      if (!token) {
        router.push("/")
        return
      }
      await fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {})

      localStorage.clear()
      router.push("/")
    } catch (err) {
      console.error("Erreur de déconnexion :", err)
    }
  }

  //Chargement des factures 
  useEffect(() => {
    if (!token) return
    const fetchInvoices = async () => {
      try {
        const res = await fetch("/api/facture/all", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`)
        const data = await res.json()
        setInvoices(data)
      } catch (err) {
        console.error("Erreur chargement factures :", err)
      }
    }
    fetchInvoices()
  }, [token])

  //Filtres + pagination/
  const filteredInvoices = useMemo(() => {
    return invoices
      .filter((inv) => (filterDate ? inv.created_at.startsWith(filterDate) : true))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }, [invoices, filterDate])

  const totalPages = useMemo(() => Math.ceil(filteredInvoices.length / ITEMS_PER_PAGE), [filteredInvoices])
  const paginatedInvoices = useMemo(
    () => filteredInvoices.slice(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE),
    [filteredInvoices, currentPage]
  )

  const handleNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))
  const handlePrev = () => setCurrentPage((p) => Math.max(p - 1, 0))

  //Voir facture 
  const handleViewInvoice = async (id: number) => {
    if (!token) return
    try {
      const res = await fetch(`/api/facture/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`Erreur serveur : ${res.status}`)
      const data = await res.json()
      setSelectedInvoice(data)
      setIsViewModalOpen(true)
    } catch (err) {
      console.error("Erreur récupération facture :", err)
    }
  }

  // Supprimer facture 
  const handleDeleteInvoice = async (id: number) => {
    if (!token) return
    try {
      const res = await fetch(`/api/facture/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setInvoices((prev) => prev.filter((inv) => inv.id !== id))
    } catch (err) {
      console.error("Erreur suppression facture :", err)
    }
  }

  // Sauvegarde facture
  const handleSaveInvoice = (createdInvoice: any) => {
    if (createdInvoice?.data) {
      setInvoices((prev) => [...prev, createdInvoice.data])
    }
    setIsAddModalOpen(false)
  }

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
              <h1 className="text-lg font-semibold">Buyer</h1>
            </div>
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          <nav className="space-y-3">
            <Link href="/dashboards/buyer" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <LayoutDashboard size={18} /> <span>Dashboard</span>
            </Link>
            <Link href="/dashboards/buyer/pages/messages" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <MessageSquare size={18} /> <span>Messages</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-[#1221ca] hover:bg-blue-700 transition">
              <FileText size={18} /> <span>Invoices</span>
            </Link>
            <Link href="/dashboards/buyer/pages/estimates" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <FileSignature size={18} /> <span>Estimates</span>
            </Link>
            <Link href="/dashboards/buyer/pages/products" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <Package size={18} /> <span>Products</span>
            </Link>
            <Link href="/dashboards/buyer/pages/claims" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
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

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden">
              <Menu size={24} className="text-[#1221ca]" />
            </button>
            <h2 className="text-2xl font-semibold text-[#1221ca]">Invoices</h2>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border px-2 py-1 rounded-md text-sm"
            />
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center space-x-2 bg-[#1221ca] text-white px-3 py-2 rounded-md hover:bg-blue-700 transition"
            >
              <PlusCircle size={16} /> <span>Add Invoice</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="grid grid-cols-5 gap-4 font-semibold bg-gray-50 border-b px-4 py-3 text-sm text-gray-600">
            <div>Ref</div>
            <div>Client</div>
            <div>Date</div>
            <div>Amount</div>
            <div>Actions</div>
          </div>

          {paginatedInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="grid grid-cols-5 gap-4 items-center px-4 py-3 border-b text-sm"
            >
              <div>{invoice.ref_facture}</div>
              <div>{invoice.name_client}</div>
              <div>{new Date(invoice.created_at).toLocaleDateString()}</div>
              <div className="font-semibold">${Number(invoice.montant_ttc).toFixed(2)}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleViewInvoice(invoice.id)}
                  className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleDeleteInvoice(invoice.id)}
                  className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div className="flex justify-center items-center py-4 space-x-3">
            <button
              onClick={handlePrev}
              disabled={currentPage === 0}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm">
              Page {currentPage + 1} / {totalPages || 1}
            </span>
            <button
              onClick={handleNext}
              disabled={currentPage >= totalPages - 1}
              className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Modals */}
        {isAddModalOpen && (
          <AddInvoiceModal onClose={() => setIsAddModalOpen(false)} onSave={handleSaveInvoice} />
        )}
        {isViewModalOpen && selectedInvoice && (
          <ViewInvoiceModal invoiceData={selectedInvoice} onClose={() => setIsViewModalOpen(false)} />
        )}
      </main>
    </div>
  )
}

export default InvoiceList
