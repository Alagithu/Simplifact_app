"use client"

import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { useRouter } from "next/navigation"
const DashboardAdmin = () => {
  const [products, setProducts] = useState<any[]>([])
  const [factures, setFactures] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [claims, setClaims] = useState<any[]>([])

  const [filteredProducts, setFilteredProducts] = useState<any[]>([])
  const [filteredFactures, setFilteredFactures] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [filteredClaims, setFilteredClaims] = useState<any[]>([])

  const [totalFactures, setTotalFactures] = useState<number>(0)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1))

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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return

      try {
        const [resProducts, resFactures, resUsers, resClaims] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/product/all", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://127.0.0.1:8000/api/facture/all", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://127.0.0.1:8000/api/users/all", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("http://127.0.0.1:8000/api/reclamation/all", { headers: { Authorization: `Bearer ${token}` } }),
        ])

        setProducts(await resProducts.json())
        setFactures(await resFactures.json())
        setUsers(await resUsers.json())
        setClaims(await resClaims.json())
      } catch (err) {
        console.error("Erreur lors du fetch :", err)
      }
    }

    fetchData()
  }, [token])

  // Filter by date
  useEffect(() => {
    const filterByDate = (list: any[]) => {
      if (!selectedDate) return list
      const selected = new Date(selectedDate)
      return list.filter(i => i.created_at && new Date(i.created_at) <= selected)
    }

    const fProducts = filterByDate(products)
    const fFactures = filterByDate(factures)
    const fUsers = filterByDate(users)
    const fClaims = filterByDate(claims)

    setFilteredProducts(fProducts)
    setFilteredFactures(fFactures)
    setFilteredUsers(fUsers)
    setFilteredClaims(fClaims)

    setTotalFactures(fFactures.reduce((acc, f) => acc + (f.montant_ttc || 0), 0))
  }, [selectedDate, products, factures, users, claims])

  const providers = filteredUsers.filter(u => u.role?.toLowerCase() === "provider")
  const buyers = filteredUsers.filter(u => u.role?.toLowerCase() === "buyer")

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
                <Link href="/dashboards/admin/user" className="flex items-center p-3 rounded-md hover:bg-gray-800">
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM4 15a4 4 0 014-4h4a4 4 0 014 4v1H4v-1z" />
                </svg>
                    Users
                </Link>
              </li>
              <li className="mb-4">
                <Link href="/dashboards/admin/product" className="flex items-center p-3 rounded-md hover:bg-gray-800">
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM9 11a1 1 0 012 0v2a1 1 0 11-2 0v-2z"></path>
                  </svg> 
                    Products
                </Link>
              </li>
              <li className="mb-4">
                <Link href="/dashboards/admin/claims" className="flex items-center p-3 rounded-md hover:bg-gray-800">
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
        <div className="bg-[#1221ca] text-white p-4 rounded-md mb-6"><h2 className="text-xl font-semibold">Admin</h2></div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-md p-6 text-center shadow-sm"><p className="text-sm text-gray-500">Products</p><h3 className="text-3xl font-bold">{filteredProducts.length}</h3></div>
          <div className="bg-white rounded-md p-6 text-center shadow-sm"><p className="text-sm text-gray-500">Users</p><h3 className="text-3xl font-bold">{filteredUsers.length-1}</h3></div>
          <div className="bg-white rounded-md p-6 text-center shadow-sm"><p className="text-sm text-gray-500">Revenue</p><h3 className="text-3xl font-bold">${totalFactures}</h3></div>
          <div className="bg-white rounded-md p-6 text-center shadow-sm"><p className="text-sm text-gray-500">Claims</p><h3 className="text-3xl font-bold">{filteredClaims.length}</h3></div>
        </div>

        {/* Providers & Buyers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-md p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Providers ({providers.length})</h3>
            <ul>{providers.slice(-3).map((u, idx) => <li key={idx} className="flex justify-between py-2 border-b last:border-b-0"><span>{u.name}</span><span>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}</span></li>)}</ul>
          </div>
          <div className="bg-white rounded-md p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Buyers ({buyers.length})</h3>
            <ul>{buyers.slice(-3).map((u, idx) => <li key={idx} className="flex justify-between py-2 border-b last:border-b-0"><span>{u.name}</span><span>{u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}</span></li>)}</ul>
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
                return <div key={dateStr} onClick={() => setSelectedDate(dateStr)} className={`cursor-pointer flex items-center justify-center w-10 h-10 rounded-full ${isSelected ? "bg-[#1221ca] text-white" : "text-gray-700 hover:bg-gray-200"}`}>{day.getDate()}</div>
              })}
            </div>
            <button onClick={nextWeek} className="text-gray-500 hover:text-gray-900">&gt;</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardAdmin
