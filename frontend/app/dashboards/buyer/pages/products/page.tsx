"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  FileText,
  MessageSquare,
  FileSignature,
  AlertCircle,
  LogOut,
  Menu,
  X,
  PlusCircle,
  Edit,
  Trash2,
} from "lucide-react"

type Product = {
  id: number
  nom_produit: string
  ref_produit: string
  type: string
  prix: number
}

type User = {
  id: number
  name: string
  category: string
}

export default function BuyerProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [user, setUser] = useState<User | null>(null)
  const [search, setSearch] = useState("")
  const [nom_produit, setName] = useState("")
  const [prix, setPrice] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 6
  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const fetchUser = useCallback(async () => {
    if (!token) return router.push("/")
    const res = await fetch("/api/user", { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setUser(await res.json())
  }, [router, token])

  const fetchProducts = useCallback(async () => {
    if (!token) return
    const res = await fetch("/api/product/all", { headers: { Authorization: `Bearer ${token}` } })
    if (res.ok) setProducts(await res.json())
  }, [token])

  useEffect(() => {
    fetchUser()
    fetchProducts()
  }, [fetchUser, fetchProducts])

  const handleLogout = async () => {
    await fetch("/api/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {})
    localStorage.clear()
    router.push("/")
  }

  const handleSave = async () => {
    if (!user || !nom_produit || !prix) return alert("Complete all fields")
    const exists = products.some((p) => p.nom_produit.toLowerCase() === nom_produit.toLowerCase())
    if (exists) return alert("Product already exists")

    const prixNum = parseFloat(prix)
    if (isNaN(prixNum) || prixNum <= 0) return alert("Invalid price")

    const ref = "PROD-" + Math.random().toString(36).substring(2, 8).toUpperCase()
    const res = await fetch("/api/product/add", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ nom_produit, ref_produit: ref, type: user.category, prix: prixNum }),
    })

    if (res.ok) {
      const created = await res.json()
      setProducts((prev) => [...prev, created])
      setIsModalOpen(false)
      setName("")
      setPrice("")
    }
  }

  const handleEdit = async () => {
    if (!selectedProduct || !user) return
    const prixNum = parseFloat(prix)
    if (isNaN(prixNum) || prixNum <= 0) return alert("Invalid price")

    const res = await fetch(`/api/product/${selectedProduct.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        nom_produit,
        ref_produit: selectedProduct.ref_produit,
        type: user.category,
        prix: prixNum,
      }),
    })

    if (res.ok) {
      const updated = await res.json()
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setIsModalOpen(false)
      setIsEditMode(false)
      setSelectedProduct(null)
    }
  }

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/product/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const filteredProducts = useMemo(
    () => products.filter((p) => p.nom_produit.toLowerCase().includes(search.toLowerCase())),
    [products, search]
  )

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)
  const indexOfLast = currentPage * productsPerPage
  const indexOfFirst = indexOfLast - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast)

  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1))

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
            <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
              <X />
            </button>
          </div>

          <nav className="space-y-3">
            <Link href="/dashboards/buyer" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <LayoutDashboard size={18} /> <span>Dashboard</span>
            </Link>
            <Link href="/dashboards/buyer/pages/messages" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <MessageSquare size={18} /> <span>Messages</span>
            </Link>
            <Link href="/dashboards/buyer/pages/invoices" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <FileText size={18} /> <span>Invoices</span>
            </Link>
            <Link href="/dashboards/buyer/pages/estimates" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <FileSignature size={18} /> <span>Estimates</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-[#1221ca]">
              <Package size={18} /> <span>Products</span>
            </Link>
            <Link href="/dashboards/buyer/pages/claims" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <AlertCircle size={18} /> <span>Claims</span>
            </Link>
          </nav>
        </div>

        <button onClick={handleLogout} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full">
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} className="text-[#1221ca]" />
          </button>
          <h2 className="text-xl font-semibold text-[#1221ca]">Products</h2>
        </div>

        <h2 className="hidden md:block text-2xl font-semibold mb-6 text-[#1221ca]">
          Products Management
        </h2>

        {/* Search + Add */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/3"
          />
          <button
            onClick={() => {
              setIsModalOpen(true)
              setIsEditMode(false)
              setName("")
              setPrice("")
            }}
            className="flex items-center space-x-2 bg-[#1221ca] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <PlusCircle size={18} /> <span>Add Product</span>
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentProducts.map((p) => (
            <div key={p.id} className="bg-white shadow-md rounded-xl p-4 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-[#1221ca] text-center">{p.nom_produit}</h4>
                <p className="text-sm text-gray-600">Ref: {p.ref_produit}</p>
                <p className="text-sm text-gray-600">Type: {p.type}</p>
                <p className="text-lg font-bold text-center mt-2">${p.prix}</p>
              </div>
              <div className="flex justify-center gap-2 mt-3">
                <button
                  onClick={() => {
                    setIsModalOpen(true)
                    setIsEditMode(true)
                    setSelectedProduct(p)
                    setName(p.nom_produit)
                    setPrice(p.prix.toString())
                  }}
                  className="p-2 bg-yellow-400 rounded hover:bg-yellow-500"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {currentProducts.length === 0 && (
          <p className="text-center text-gray-500 mt-6">No products found.</p>
        )}

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition"
          >
            Prev
          </button>
          <span className="font-semibold">{currentPage} / {totalPages}</span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      </main>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4 text-[#1221ca]">
              {isEditMode ? "Edit Product" : "Add Product"}
            </h3>

            <input
              type="text"
              placeholder="Product name"
              value={nom_produit}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-3"
            />
            <input
              type="number"
              placeholder="Price"
              value={prix}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
            />

            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300">
                Cancel
              </button>
              <button
                onClick={isEditMode ? handleEdit : handleSave}
                className="px-4 py-2 rounded-lg bg-[#1221ca] text-white hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
