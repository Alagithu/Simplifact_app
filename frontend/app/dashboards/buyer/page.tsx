"use client"

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { useRouter } from "next/navigation"

const DashboardBuyer = () => {
  const [products, setProducts] = useState<any[]>([])
  const [factures, setFactures] = useState<any[]>([])
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [filteredFactures, setFilteredFactures] = useState<any[]>([])
  const [totalFactures, setTotalFactures] = useState<number>(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)) // Septembre 2025

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

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


  // Charger les produits et factures
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) return
        const resProducts = await fetch("http://127.0.0.1:8000/api/product/all", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const productsData = await resProducts.json()
        setProducts(productsData)

        const resFactures = await fetch("http://127.0.0.1:8000/api/facture/all", {
          headers: { Authorization: `Bearer ${token}` }
        })
        const facturesData = await resFactures.json()
        setFactures(facturesData)
      } catch (err) {
        console.error(err)
      }
    }
    fetchData()
  }, [token])

  // Filtrer selon la date sélectionnée
  useEffect(() => {
    if (selectedDate) {
      const fProducts = products.filter(p => p.created_at.startsWith(selectedDate))
      const fFactures = factures.filter(f => f.created_at.startsWith(selectedDate))
      setFilteredProducts(fProducts)
      setFilteredFactures(fFactures)
      setTotalFactures(fFactures.reduce((acc, f) => acc + (f.montant_ttc || 0), 0))
    } else {
      setFilteredProducts(products)
      setFilteredFactures(factures)
      setTotalFactures(factures.reduce((acc, f) => acc + (f.montant_ttc || 0), 0))
    }
  }, [selectedDate, products, factures])

  // Générer jours pour la semaine actuelle
  const getWeekDays = (date: Date) => {
    const days: Date[] = []
    const start = new Date(date)
    for (let i = 0; i < 7; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    return days
  }

  const weekDays = getWeekDays(currentDate)

  const prevWeek = () => setCurrentDate(prev => { const d = new Date(prev); d.setDate(d.getDate() - 7); return d })
  const nextWeek = () => setCurrentDate(prev => { const d = new Date(prev); d.setDate(d.getDate() + 7); return d })

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-black text-white p-6 flex flex-col justify-between">
         <div>
           <h1 className="text-3xl font-bold mb-10">Logo</h1>
            <nav>
               <ul>
                 <li className="mb-4">
                   <Link href="#" className="flex items-center p-3 rounded-md bg-[#1221ca]">
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
                    <Link href="/dashboards/buyer/pages/invoices" className="flex items-center p-3 rounded-md hover:bg-gray-800"> 
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
              <button onClick={handleLogout} className="flex items-center p-3 rounded-md hover:bg-gray-800 w-full text-left"> 
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 11a1 1 0 112 0v2a1 1 0 11-2 0v-2zM10 7a1 1 0 110 2 1 1 0 010-2z"></path>
                  </svg> 
                    Logout 
              </button> 
            </div>
        </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="bg-[#1221ca] text-white p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold">Buyer</h2>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-md p-6 text-center shadow-sm">
            <p className="text-sm text-gray-500">Products</p>
            <h3 className="text-3xl font-bold">{filteredProducts.length}</h3>
          </div>
          <div className="bg-white rounded-md p-6 text-center shadow-sm">
            <p className="text-sm text-gray-500">Invoices</p>
            <h3 className="text-3xl font-bold">{filteredFactures.length}</h3>
          </div>
          <div className="bg-white rounded-md p-6 text-center shadow-sm">
            <p className="text-sm text-gray-500">Revenue</p>
            <h3 className="text-3xl font-bold">${totalFactures}</h3>
          </div>
        </div>

        {/* Last invoices & products */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-md p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Last invoices</h3>
            <ul>
              {filteredFactures.slice(-4).map((f, idx) => (
                <li key={idx} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span>{f.name_client } </span>
                  <span>{new Date(f.created_at).toLocaleDateString()}</span>
                  <span className="font-bold">${f.montant_ttc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-md p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Last products</h3>
            <ul>
              {filteredProducts.slice(-3).map((p, idx) => (
                <li key={idx} className="flex justify-between items-center py-2 border-b last:border-b-0">
                  <span>{p.nom_produit} Ref{p.ref_produit}</span>
                  <span className="font-bold">${p.prix} </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-md p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">{currentDate.toLocaleString("default", { month: "long", year: "numeric" })}</h3>
          <div className="flex items-center justify-between">
            <button onClick={prevWeek} className="text-gray-500 hover:text-gray-900">&lt;</button>
            <div className="grid grid-cols-7 text-center gap-2 w-full">
              {weekDays.map(day => {
                const dateStr = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`
                const isSelected = selectedDate === dateStr
                return (
                  <div key={dateStr} onClick={() => setSelectedDate(dateStr)}
                    className={`cursor-pointer flex items-center justify-center w-10 h-10 rounded-full ${
                      isSelected ? "bg-[#1221ca] text-white" : "text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                )
              })}
            </div>
            <button onClick={nextWeek} className="text-gray-500 hover:text-gray-900">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardBuyer
