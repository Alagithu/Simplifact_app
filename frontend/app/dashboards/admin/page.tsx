"use client"

import Link from "next/link"
import React, { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { BarChart3, Users, Package, AlertCircle, LogOut, LayoutDashboard, Menu } from "lucide-react"

const DashboardAdmin = () => {
  const [products, setProducts] = useState<any[]>([])
  const [factures, setFactures] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [claims, setClaims] = useState<any[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date()) // mois et année courants
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const router = useRouter()
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

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

  useEffect(() => {
    if (!token) return

    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-cache",
        })

        if (!res.ok) throw new Error("Erreur serveur")

        const data = await res.json()
        setProducts(data.products || [])
        setFactures(data.factures || [])
        setUsers(data.users || [])
        setClaims(data.claims || [])
      } catch (err) {
        console.error("Erreur lors du fetch dashboard:", err)
      }
    }

    fetchDashboard()
  }, [token])

  // Filtres par date
  const filteredProducts = useMemo(() => {
    if (!selectedDate) return products
    const d = new Date(selectedDate)
    return products.filter((p) => p.created_at && new Date(p.created_at) <= d)
  }, [selectedDate, products])

  const filteredFactures = useMemo(() => {
    if (!selectedDate) return factures
    const d = new Date(selectedDate)
    return factures.filter((f) => f.created_at && new Date(f.created_at) <= d)
  }, [selectedDate, factures])

  const filteredUsers = useMemo(() => {
    if (!selectedDate) return users
    const d = new Date(selectedDate)
    return users.filter(
      (u) => u.created_at && new Date(u.created_at) <= d && u.role?.toLowerCase() !== "admin"
    )
  }, [selectedDate, users])

  const filteredClaims = useMemo(() => {
    if (!selectedDate) return claims
    const d = new Date(selectedDate)
    return claims.filter((c) => c.created_at && new Date(c.created_at) <= d)
  }, [selectedDate, claims])

  const totalFactures = useMemo(
    () => filteredFactures.reduce((acc, f) => acc + (f.montant_ttc || 0), 0),
    [filteredFactures]
  )

  const totalUsers = useMemo(
  () => filteredUsers.filter(u => u.role?.toLowerCase() !== "admin").length,
  [filteredUsers]
)


  const providers = useMemo(
    () => filteredUsers.filter((u) => u.role?.toLowerCase() === "provider"),
    [filteredUsers]
  )

  const buyers = useMemo(
    () => filteredUsers.filter((u) => u.role?.toLowerCase() === "buyer"),
    [filteredUsers]
  )

  // Gestion du calendrier
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
          <div className="flex items-center justify-between mb-8 space-x-3">
            <div className="flex items-center space-x-3">
              <img src="/logo.png" alt="Logo" width={45} height={45} className="rounded-full" />
              <h1 className="text-lg font-semibold">Admin</h1>
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
              href="/dashboards/admin/claims"
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

      {/* Main*/}
      <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full">
        <div className="flex items-center justify-between mb-6 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={24} className="text-[#1221ca]" />
          </button>
          <h2 className="text-xl font-semibold text-[#1221ca]">Admin Dashboard</h2>
        </div>

        <h2 className="hidden md:block text-2xl font-semibold mb-6 text-[#1221ca]">
          Welcome, Admin
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {[
            { title: "Products", value: filteredProducts.length, icon: <Package />, color: "bg-blue-100 text-blue-700" },
            { title: "Users", value: totalUsers, icon: <Users />, color: "bg-green-100 text-green-700" },
            { title: "Revenue", value: `$${totalFactures}`, icon: <BarChart3 />, color: "bg-yellow-100 text-yellow-700" },
            { title: "Claims", value: filteredClaims.length, icon: <AlertCircle />, color: "bg-red-100 text-red-700" },
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

        {/* Providers & Buyers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
          {[{ title: "Providers", list: providers }, { title: "Buyers", list: buyers }].map(
            (section, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-md p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 text-[#1221ca]">
                  {section.title} ({section.list.length})
                </h3>
                <ul className="divide-y divide-gray-200">
                  {section.list.slice(-3).map((u, i) => (
                    <li key={i} className="py-2 flex justify-between text-sm">
                      <span>{u.name}</span>
                      <span className="text-gray-500">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}
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

export default DashboardAdmin
