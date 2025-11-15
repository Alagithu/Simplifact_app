"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Package, LogOut, LayoutDashboard, Users, AlertCircle } from "lucide-react"

type Product = {
  id: number
  nom_produit: string
  ref_produit: string
  type: string
  prix: number
  user?: {
    id: number
    name: string
  }
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 6

  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  useEffect(() => {
    if (!token) return
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/product", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Erreur serveur")
        const data = await res.json()
        setProducts(data)
      } catch (err) {
        console.error(err)
      }
    }
    fetchProducts()
  }, [token])

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      localStorage.clear()
      router.push("/")
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    try {
      const res = await fetch(`/api/product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setProducts(products.filter(p => p.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const filteredProducts = products.filter(p =>
    p.nom_produit.toLowerCase().includes(search.toLowerCase())
  )

  const indexOfLast = currentPage * productsPerPage
  const indexOfFirst = indexOfLast - productsPerPage
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast)
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage)

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-inter">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0f172a] text-gray-100 flex flex-col justify-between p-6 shadow-lg">
        <div>
          <div className="flex items-center mb-8 space-x-3">
            <img src="/logo.png" alt="Logo" width={45} height={45} className="rounded-full" />
            <h1 className="text-lg font-semibold">Admin</h1>
          </div>
          <nav className="space-y-3">
            <Link href="/dashboards/admin" className="flex items-center space-x-3 p-3 rounded-lg  hover:bg-gray-800 transition">
              <LayoutDashboard size={18} /> <span>Dashboard</span>
            </Link>
            <Link href="/dashboards/admin/user" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <Users size={18} /> <span>Users</span>
            </Link>
            <Link href="#" className="flex items-center space-x-3 p-3 rounded-lg bg-[#1221ca]  hover:bg-blue-700 transition">
              <Package size={18} /> <span>Products</span>
            </Link>
            <Link href="/dashboards/admin/claims" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
              <AlertCircle size={18} /> <span>Claims</span>
            </Link>
          </nav>
        </div>
        <button onClick={handleLogout} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition">
          <LogOut size={18} /> <span>Logout</span>
        </button>
      </aside>

      {/* Main*/}
      <main className="flex-1 p-8 flex flex-col bg-gray-50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-[#1221ca]">Products</h2>
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded-md w-1/3 focus:outline-none focus:ring-2 focus:ring-[#1221ca]"
          />
        </div>

        {/* produit */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentProducts.length > 0 ? (
            currentProducts.map(p => (
             <div key={p.id} className="bg-white rounded-xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition">
              <div>
                <h4 className="font-bold text-lg mb-1">{p.nom_produit}</h4>
                <p className="text-gray-600 text-sm mb-1">Ref: {p.ref_produit}</p>
                <p className="text-gray-600 text-sm mb-1">Type: {p.type}</p>
                <p className="font-semibold text-[#1221ca]">${p.prix}</p>
                {p.user && (
                  <p className="text-xs text-gray-500 mt-1">
                    Created by: <span className="font-medium">{p.user.name}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDeleteProduct(p.id)}
                className="mt-2 bg-red-600 hover:bg-red-700 text-white text-sm p-1 rounded transition"
              >
                Delete
              </button>
            </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500">No products found.</p>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-4 sticky bottom-0 bg-gray-50 py-4 border-t">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100 transition"
          >
            Prev
          </button>
          <span className="font-bold">{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50 hover:bg-gray-100 transition"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  )
}
