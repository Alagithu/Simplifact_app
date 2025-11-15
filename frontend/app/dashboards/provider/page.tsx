"use client"

import Link from "next/link"
import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  FileSignature,
  BarChart3,
  MessageSquare,
  AlertCircle,
  LogOut,
  Menu,
} from "lucide-react"

const DashboardProvider = () => {
  const [products, setProducts] = useState<any[]>([])
  const [devis, setDevis] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }).catch(() => {})

      localStorage.clear()
      router.push("/")
    } catch (error) {
      console.error("Erreur de déconnexion :", error)
    }
  }
  const [userName, setUserName] = useState<string>("");

useEffect(() => {
  if (!token) return;
  fetch("/api/user", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.ok && res.json())
    .then((data) => {
      if (data?.name) setUserName(data.name);
    })
    .catch(console.error);
}, [token]);

  useEffect(() => {
    if (!token) return

    const fetchDashboard = async () => {
      try {
        const [resProducts, resDevis] = await Promise.all([
          fetch("/api/product/all", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/devis/all", { headers: { Authorization: `Bearer ${token}` } }),
        ])

        if (!resProducts.ok || !resDevis.ok) throw new Error("Erreur serveur")

        const [productsData, devisData] = await Promise.all([
          resProducts.json(),
          resDevis.json(),
        ])

        setProducts(productsData || [])
        setDevis(devisData || [])
      } catch (err) {
        console.error("Erreur lors du fetch dashboard provider:", err)
      }
    }

    fetchDashboard()
  }, [token])

  //Filtres 
  const filteredProducts = useMemo(() => {
    if (!selectedDate) return products
    const d = new Date(selectedDate)
    return products.filter((p) => p.created_at && new Date(p.created_at) <= d)
  }, [selectedDate, products])

  const filteredDevis = useMemo(() => {
    if (!selectedDate) return devis
    const d = new Date(selectedDate)
    return devis.filter((d) => d.created_at && new Date(d.created_at) <= d)
  }, [selectedDate, devis])

  const totalDevis = useMemo(() => {
    const total = filteredDevis.reduce((acc, d) => acc + (Number(d.total) || 0), 0)
    return parseFloat(total.toFixed(1))
  }, [filteredDevis])

  // Calendrier
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

  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate])
  const prevWeek = () =>
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() - 7))
  const nextWeek = () =>
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth(), prev.getDate() + 7))

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
            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>

          <nav className="space-y-3">
            <Link
              href="#"
              className="flex items-center space-x-3 p-3 rounded-lg bg-[#1221ca] hover:bg-blue-700 transition"
            >
              <LayoutDashboard size={18} /> <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboards/provider/pages/messages"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition"
            >
              <MessageSquare size={18} /> <span>Messages</span>
            </Link>
            <Link
              href="/dashboards/provider/pages/estimates"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition"
            >
              <FileSignature size={18} /> <span>Estimates</span>
            </Link>
            <Link
              href="/dashboards/provider/pages/products"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition"
            >
              <Package size={18} /> <span>Products</span>
            </Link>
            <Link
              href="/dashboards/provider/pages/claims"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition"
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

   
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main  */}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full">
        
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} className="text-[#1221ca]" />
          </button>
          <h2 className="text-xl font-semibold text-[#1221ca]">Provider Dashboard</h2>
        </div>

        <h2 className="hidden md:block text-2xl font-semibold mb-6 text-[#1221ca]">
          Welcome, {userName}
        </h2>

        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {[
            { title: "Products", value: filteredProducts.length, icon: <Package />, color: "bg-blue-100 text-blue-700" },
            { title: "Estimates", value: filteredDevis.length, icon: <FileSignature />, color: "bg-green-100 text-green-700" },
            { title: "Revenue", value: `$${totalDevis}`, icon: <BarChart3 />, color: "bg-yellow-100 text-yellow-700" },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex items-center space-x-4">
              <div className={`p-3 rounded-full ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <h3 className="text-xl sm:text-2xl font-bold">{stat.value}</h3>
              </div>
            </div>
          ))}
        </div>

      
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 text-[#1221ca]">Last Estimates</h3>
            <ul className="divide-y divide-gray-200">
              {filteredDevis.slice(-4).map((d, i) => (
                <li key={i} className="py-2 flex justify-between text-sm">
                  <span>{d.ref_devis}</span>
                  <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  <span className="font-bold">${d.total}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4 text-[#1221ca]">Last Products</h3>
            <ul className="divide-y divide-gray-200">
              {filteredProducts.slice(-3).map((p, i) => (
                <li key={i} className="py-2 flex justify-between text-sm">
                  <span>{p.nom_produit}</span>
                  <span className="font-bold">${p.prix}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
            <h3 className="text-lg font-semibold text-[#1221ca]">
              {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
            </h3>
            <div className="space-x-3">
              <button
                onClick={prevWeek}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                &lt;
              </button>
              <button
                onClick={nextWeek}
                className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
              >
                &gt;
              </button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekDays.map((day) => {
              const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(
                day.getDate()
              ).padStart(2, "0")}`
              const isSelected = selectedDate === dateStr
              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`cursor-pointer flex items-center justify-center w-8 sm:w-10 h-8 sm:h-10 rounded-full ${
                    isSelected ? "bg-[#1221ca] text-white" : "hover:bg-gray-200 text-gray-700"
                  } transition`}
                >
                  {day.getDate()}
                </div>
              )
            })}
          </div>
        </div>

      </main>
    </div>
  )
}

export default DashboardProvider
