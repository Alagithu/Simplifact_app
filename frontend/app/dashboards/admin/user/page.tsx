"use client"

import Link from "next/link"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: number
  name: string
  category: string
  role: string
  email: string
  phone: string
  society: string
  created_at?: string
}
  
const UsersList = () => {
  const [users, setUsers] = useState<User[]>([])
  const [searchProvider, setSearchProvider] = useState("")
  const [searchBuyer, setSearchBuyer] = useState("")
  const [dateProvider, setDateProvider] = useState("")
  const [dateBuyer, setDateBuyer] = useState("")
  const [categoryProvider, setCategoryProvider] = useState("")
  const [categoryBuyer, setCategoryBuyer] = useState("")

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalType, setModalType] = useState<"view" | "edit" | null>(null)
  const [formData, setFormData] = useState<Partial<User>>({})

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null

  //Fetch all users
  const fetchUsers = async () => {
    if (!token) return
    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Erreur API : " + res.status)
      const data = await res.json()
      setUsers(data)
    } catch (err) {
      console.error("Erreur lors du fetch :", err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [token])

  //Filtering logic
  const providers = users
    .filter((u) => u.role === "provider")
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchProvider.toLowerCase()) &&
        u.category.toLowerCase().includes(categoryProvider.toLowerCase()) &&
        (!dateProvider ||
          new Date(u.created_at ?? "").toLocaleDateString() ===
            new Date(dateProvider).toLocaleDateString())
    )

  const buyers = users
    .filter((u) => u.role === "buyer")
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchBuyer.toLowerCase()) &&
        u.category.toLowerCase().includes(categoryBuyer.toLowerCase()) &&
        (!dateBuyer ||
          new Date(u.created_at ?? "").toLocaleDateString() ===
            new Date(dateBuyer).toLocaleDateString())
    )

  //Modal handlers
  const openModal = (user: User, type: "view" | "edit") => {
    setSelectedUser(user)
    setModalType(type)
    setFormData(user)
  }

  const closeModal = () => {
    setSelectedUser(null)
    setModalType(null)
    setFormData({})
  }

  //Delete user
  const handleDelete = async (id: number) => {
    if (!token) return
    if (!confirm("Are you sure you want to delete this user?")) return

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (res.ok) {
        alert("User deleted successfully.")
        fetchUsers()
      } else {
        alert("Failed to delete user.")
      }
    } catch (err) {
      console.error("Erreur lors de la suppression :", err)
    }
  }

  //Edit user
  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !selectedUser) return

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/users/${selectedUser.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      )

      if (res.ok) {
        alert("User updated successfully.")
        closeModal()
        fetchUsers()
      } else {
        alert("Failed to update user.")
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour :", err)
    }
  }
  
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

  return (
    <div className="flex h-screen bg-gray-100">
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
                  href="#"
                  className="flex items-center p-3 rounded-md bg-[#1221ca]"
                >
                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0zM4 15a4 4 0 014-4h4a4 4 0 014 4v1H4v-1z" />
                </svg>
                  Users
                </Link>
              </li>
              <li className="mb-4">
                <Link
                  href="/dashboards/admin/product"
                  className="flex items-center p-3 rounded-md hover:bg-gray-800"
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

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="bg-[#1221ca] text-white p-4 rounded-md mb-6">
          <h2 className="text-xl font-semibold">Admin</h2>
        </div>

        <div className="flex gap-4">
          {/* Providers Section */}
          <UserSection
            title="Providers"
            users={providers}
            search={searchProvider}
            setSearch={setSearchProvider}
            date={dateProvider}
            setDate={setDateProvider}
            category={categoryProvider}
            setCategory={setCategoryProvider}
            onView={(u) => openModal(u, "view")}
            onEdit={(u) => openModal(u, "edit")}
            onDelete={handleDelete}
          />

          {/* Buyers Section */}
          <UserSection
            title="Buyers"
            users={buyers}
            search={searchBuyer}
            setSearch={setSearchBuyer}
            date={dateBuyer}
            setDate={setDateBuyer}
            category={categoryBuyer}
            setCategory={setCategoryBuyer}
            onView={(u) => openModal(u, "view")}
            onEdit={(u) => openModal(u, "edit")}
            onDelete={handleDelete}
          />
        </div>

        {/* Modal View/Edit */}
        {selectedUser && modalType && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-md w-96">
              <h3 className="text-lg font-bold mb-4 capitalize">
                {modalType} User
              </h3>

              {modalType === "view" ? (
                <div>
                  <p><strong>Name:</strong> {selectedUser.name}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Company:</strong> {selectedUser.society}</p>
                  <p><strong>Phone:</strong> {selectedUser.phone}</p>
                  <p><strong>Category:</strong> {selectedUser.category}</p>
                  <p><strong>Role:</strong> {selectedUser.role}</p>
                  <p>
                    <strong>Date:</strong>{" "}
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleDateString()
                      : ""}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleEdit} className="flex flex-col gap-2">
                  {["name", "email", "society", "phone", "category", "role"].map(
                    (field) => (
                      <input
                        key={field}
                        type="text"
                        value={formData[field as keyof User] ?? ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [field]: e.target.value,
                          })
                        }
                        className="border rounded-md p-1"
                        placeholder={field}
                      />
                    )
                  )}
                  <button
                    type="submit"
                    className="mt-2 bg-green-500 text-white p-2 rounded-md"
                  >
                    Save
                  </button>
                </form>
              )}

              <button
                onClick={closeModal}
                className="mt-4 w-full bg-gray-400 text-white p-2 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 🔹 Composant réutilisable pour Provider/Buyer
interface UserSectionProps {
  title: string
  users: User[]
  search: string
  setSearch: React.Dispatch<React.SetStateAction<string>>
  date: string
  setDate: React.Dispatch<React.SetStateAction<string>>
  category: string
  setCategory: React.Dispatch<React.SetStateAction<string>>
  onView: (user: User) => void
  onEdit: (user: User) => void
  onDelete: (id: number) => void
}

const UserSection: React.FC<UserSectionProps> = ({
  title,
  users,
  search,
  setSearch,
  date,
  setDate,
  category,
  setCategory,
  onView,
  onEdit,
  onDelete,
}) => (
  <div className="w-1/2 border border-2 border-black rounded-md p-2">
    <legend className="bg-gray-400 text-center font-semibold">{title}</legend>

    <div className="flex mb-2">
      <input
        type="search"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-1/3 border border-black text-center"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="w-1/3 border border-black text-center"
      />
      <input
        type="search"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="w-1/3 border border-black text-center"
      />
    </div>

    <ul>
      {users.map((u) => (
        <li
          key={u.id}
          className="flex justify-between items-center py-2 border-b border-gray-400"
        >
          <span>{u.name}</span>
          <span>{u.category}</span>
          <span>
            {u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}
          </span>
          <div className="flex gap-2">
            <button
              className="border bg-blue-500 text-white rounded-md p-1"
              onClick={() => onView(u)}
            >
              View
            </button>
            <button
              className="border bg-green-500 text-white rounded-md p-1"
              onClick={() => onEdit(u)}
            >
              Edit
            </button>
            <button
              className="border bg-red-500 text-white rounded-md p-1"
              onClick={() => onDelete(u.id)}
            >
              Delete
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
)

export default UsersList
