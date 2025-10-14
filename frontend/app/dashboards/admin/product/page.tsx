"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"


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

export default function ProductsPage() {
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

  const [user, setUser] = useState<User | null>(null)

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



  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Champs formulaire
  const [nom_produit, setTitle] = useState("")
  const [ref_produit, setRef] = useState("")
  const [prix, setPrice] = useState("")

  // Erreur
  const [error, setError] = useState<string | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 6
  // Charger produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://127.0.0.1:8000/api/product", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setProducts(data)
        }
      } catch (error) {
        console.error("Erreur chargement produits:", error)
      }
    }
    fetchProducts()
  }, [])


  // Filtrage
  const filtered = products.filter((p) =>
    p.nom_produit.toLowerCase().includes(search.toLowerCase())
  )

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filtered.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filtered.length / productsPerPage)


  // Supprimer produit
  const handleDeleteProduct = async (id: number) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`http://127.0.0.1:8000/api/product/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error("Erreur suppression produit:", error)
    }
  }

  // Editer produit
  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product)
    setTitle(product.nom_produit)
    setRef(product.ref_produit)
    setPrice(product.prix.toString())
    setIsEditModalOpen(true)
  }

  // Update produit
  const handleUpdateProduct = async () => {
    if (!selectedProduct || !user) return
    try {
      const prixNum = parseFloat(prix)
      if (isNaN(prixNum) || prixNum <= 0) {
        setError("Price incorrect <0")
        return
      }

      // Vérifier unicité nom (sauf si c'est le même produit)
      const exists = products.some(
        (p) =>
          p.nom_produit.toLowerCase() === nom_produit.toLowerCase() &&
          p.id !== selectedProduct.id
      )
      if (exists) {
        alert("Product name exist")
        return
      }

      const token = localStorage.getItem("token")
      const productType = user.category

      const res = await fetch(
        `http://127.0.0.1:8000/api/product/${selectedProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            nom_produit,
            ref_produit,
            type: productType,
            prix: prixNum,
          }),
        }
      )

      if (res.ok) {
        const updated = await res.json()
        setProducts(products.map((p) => (p.id === updated.id ? updated : p)))
        setIsEditModalOpen(false)
        setSelectedProduct(null)
        resetForm()
      }
    } catch (error) {
      console.error("Erreur modification produit:", error)
    }
  }

  // Reset form
  const resetForm = () => {
    setTitle("")
    setRef("")
    setPrice("")
    setError(null)
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
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
                  className="flex items-center p-3 rounded-md  bg-[#1221ca]"
                >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 11a1 1 0 012 0v2a1 1 0 11-2 0v-2z"></path>
                </svg> 
                  Products
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="/dashboards/admin/pages/claims"
                  className="flex items-center p-3 rounded-md hover:bg-gray-800"
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
              <button onClick={handleLogout} className="flex items-center p-3 rounded-md hover:bg-gray-800 w-full text-left"> 
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 11a1 1 0 112 0v2a1 1 0 11-2 0v-2zM10 7a1 1 0 110 2 1 1 0 010-2z"></path>
                  </svg> 
                    Logout 
              </button> 
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 p-8">
        <div className="bg-[#1221ca] text-white p-4 rounded mb-6">
          <h2 className="text-xl font-bold">Admin</h2>
        </div>

        {/* Search */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Products</h3>
          <input
            type="text"
            placeholder="Search product"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-1 rounded text-black"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-600 font-bold mb-4 text-center">{error}</p>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-3 gap-2 mb-1">
          {currentProducts.length > 0 ? (
            currentProducts.map((p) => (
              <div
                key={p.id}
                className="bg-[#1221ca] text-white rounded-lg p-4 flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-center">{p.nom_produit}</h4>
                  <p>Ref: {p.ref_produit}</p>
                  <p>Type: {p.type}</p>
                  <p className="text-center">${p.prix}</p>
                </div>
                <div className="flex justify-between mt-3">
                  <button
                    onClick={() => handleDeleteProduct(p.id)}
                    className="bg-red-600 text-white p-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-600">
              No products found.
            </p>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center gap-2 mb-1">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-1 border border-black rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="self-center font-bold">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-4 py-1 border border-black rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>

      </main>
    </div>
  )
}


