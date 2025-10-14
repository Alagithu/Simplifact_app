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

  // Charger user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://127.0.0.1:8000/api/user", {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const data = await res.json()
          setUser(data)
        }
      } catch (error) {
        console.error("Erreur récupération user:", error)
      }
    }
    fetchUser()
  }, [])

  // Charger produits
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://127.0.0.1:8000/api/product/all", {
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

  // Ref unique
  const generateRef = () => {
    return "PROD-" + Math.random().toString(36).substring(2, 8).toUpperCase()
  }

  // Filtrage
  const filtered = products.filter((p) =>
    p.nom_produit.toLowerCase().includes(search.toLowerCase())
  )

  // Pagination
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = filtered.slice(indexOfFirstProduct, indexOfLastProduct)
  const totalPages = Math.ceil(filtered.length / productsPerPage)

  // Ajouter produit
  const handleSaveProduct = async () => {
    try {
      if (!user) return

      // Vérifier unicité nom produit
      const exists = products.some(
        (p) => p.nom_produit.toLowerCase() === nom_produit.toLowerCase()
      )
      if (exists) {
        alert("Product name exist")
        return
      }

      const prixNum = parseFloat(prix)
      if (isNaN(prixNum) || prixNum <= 0) {
        alert("Price incorrect <0")
        return
      }

      const token = localStorage.getItem("token")
      const newRef = generateRef()
      const productType = user.category

      const res = await fetch("http://127.0.0.1:8000/api/product/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nom_produit,
          ref_produit: newRef,
          type: productType,
          prix: prixNum,
        }),
      })

      if (res.ok) {
        const created = await res.json()
        setProducts([...products, created])
        setIsAddModalOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Erreur ajout produit:", error)
    }
  }

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
                <Link href="/dashboards/provider" className="flex items-center p-3 rounded-md hover:bg-gray-800">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 11.5a1.5 1.5 0 113 0v4a1.5 1.5 0 11-3 0v-4zM10 8a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" clipRule="evenodd" fillRule="evenodd"></path>
                  </svg>
                  Dashboard
                </Link>
              </li>
              <li className="mb-4">
                <Link href="/messages" className="flex items-center p-3 rounded-md hover:bg-gray-800">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884zM18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"></path>
                  </svg>
                  Messages
                </Link>
              </li>
              <li className="mb-4">
                <Link href="/dashboards/provider/pages/estimates" className="flex items-center p-3 rounded-md hover:bg-gray-800 ">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM15 8.114a1 1 0 011-1h2.5L12 1.5 3.5 7.114H6a1 1 0 011 1v7.5A1.5 1.5 0 008.5 17h3a1.5 1.5 0 001.5-1.5V8.114z"></path>
                  </svg> 
                  Estimates
                </Link>
              </li>
              <li className="mb-4">
                <Link href="#" className="flex items-center p-3 rounded-md bg-[#1221ca]">
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


      {/* Content */}
      <main className="flex-1 p-8">
        <div className="bg-[#1221ca] text-white p-4 rounded mb-6">
          <h2 className="text-xl font-bold">Provider</h2>
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
                    onClick={() => handleEditProduct(p)}
                    className="bg-yellow-400 text-black p-1 rounded"
                  >
                    Edit
                  </button>
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

        {/* Add Product */}
        <div className="flex justify-end">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 border rounded text-[#1221ca] border-black font-bold hover:bg-[#1221ca] hover:text-white"
          >
            Add Product
          </button>
        </div>
      </main>

      {/* Modales */}
      {isAddModalOpen && (
        <Modal
          title="Add Product"
          onCancel={() => setIsAddModalOpen(false)}
          onSave={handleSaveProduct}
          name={nom_produit}
          setName={setTitle}
          refProd={ref_produit}
          setRefProd={setRef}
          price={prix}
          setPrice={setPrice}
        />
      )}

      {isEditModalOpen && selectedProduct && (
        <Modal
          title="Edit Product"
          onCancel={() => setIsEditModalOpen(false)}
          onSave={handleUpdateProduct}
          name={nom_produit}
          setName={setTitle}
          refProd={ref_produit}
          setRefProd={setRef}
          price={prix}
          setPrice={setPrice}
        />
      )}
    </div>
  )
}

// 🔹 Modal
function Modal({
  title,
  onCancel,
  onSave,
  name,
  setName,
  refProd,
  setRefProd,
  price,
  setPrice,
}: {
  title: string
  onCancel: () => void
  onSave: () => void
  name: string
  setName: (v: string) => void
  refProd: string
  setRefProd: (v: string) => void
  price: string
  setPrice: (v: string) => void
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        <input
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2 mb-3"
        />

        <input
          type="number"
          placeholder="Price "
          min="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full border rounded p-2 mb-3"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
