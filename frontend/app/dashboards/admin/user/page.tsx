"use client";

import Link from "next/link";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Package,
  AlertCircle,
  LogOut,
  LayoutDashboard,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

interface User {
  id: number;
  name: string;
  category: string;
  role: string;
  email: string;
  phone: string;
  society: string;
  created_at?: string;
}

const UsersList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchProvider, setSearchProvider] = useState("");
  const [searchBuyer, setSearchBuyer] = useState("");
  const [dateProvider, setDateProvider] = useState("");
  const [dateBuyer, setDateBuyer] = useState("");
  const [categoryProvider, setCategoryProvider] = useState("");
  const [categoryBuyer, setCategoryBuyer] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [modalType, setModalType] = useState<"view" | "edit" | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});

  const router = useRouter();
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const fetchUsers = async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erreur API : " + res.status);
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Erreur lors du fetch :", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const providers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.role === "provider" &&
          u.name.toLowerCase().includes(searchProvider.toLowerCase()) &&
          u.category.toLowerCase().includes(categoryProvider.toLowerCase()) &&
          (!dateProvider ||
            new Date(u.created_at ?? "").toLocaleDateString() ===
              new Date(dateProvider).toLocaleDateString())
      ),
    [users, searchProvider, categoryProvider, dateProvider]
  );

  const buyers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.role === "buyer" &&
          u.name.toLowerCase().includes(searchBuyer.toLowerCase()) &&
          u.category.toLowerCase().includes(categoryBuyer.toLowerCase()) &&
          (!dateBuyer ||
            new Date(u.created_at ?? "").toLocaleDateString() ===
              new Date(dateBuyer).toLocaleDateString())
      ),
    [users, searchBuyer, categoryBuyer, dateBuyer]
  );

  const openModal = (user: User, type: "view" | "edit") => {
    setSelectedUser(user);
    setModalType(type);
    setFormData(user);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalType(null);
    setFormData({});
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedUser) return;
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchUsers();
        closeModal();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      localStorage.clear();
      router.push("/");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-inter">
      {/*Sidebar*/}
      <aside className="hidden md:flex w-64 bg-[#0f172a] text-gray-100 flex-col justify-between p-6 shadow-lg">
        <div>
          <div className="flex items-center mb-8 space-x-3">
            <img
              src="/logo.png"
              alt="Logo"
              width={45}
              height={45}
              className="rounded-full"
            />
            <h1 className="text-lg font-semibold">Admin</h1>
          </div>
          <nav className="space-y-3">
            <Link
              href="/dashboards/admin"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition"
            >
              <LayoutDashboard size={18} /> <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboards/admin/user"
              className="flex items-center space-x-3 p-3 rounded-lg bg-[#1221ca] hover:bg-blue-700 transition"
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

      {/* Main*/}
      <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-6 text-[#1221ca]">
          Manage Users
        </h2>

        {/*Providers & Buyers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserSection
            title="Providers"
            users={providers}
            search={searchProvider}
            setSearch={setSearchProvider}
            date={dateProvider}
            setDate={setDateProvider}
            category={categoryProvider}
            setCategory={setCategoryProvider}
            onView={openModal}
            onEdit={openModal}
            onDelete={handleDelete}
          />

          <UserSection
            title="Buyers"
            users={buyers}
            search={searchBuyer}
            setSearch={setSearchBuyer}
            date={dateBuyer}
            setDate={setDateBuyer}
            category={categoryBuyer}
            setCategory={setCategoryBuyer}
            onView={openModal}
            onEdit={openModal}
            onDelete={handleDelete}
          />
        </div>

        {/*Modal*/}
        {selectedUser && modalType && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 px-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold mb-4 capitalize text-[#1221ca]">
                {modalType} User
              </h3>

              {modalType === "view" ? (
                <div className="space-y-2 text-sm">
                  {["Name", "Email", "Company", "Phone", "Category", "Role"].map(
                    (field) => (
                      <p key={field}>
                        <strong>{field}:</strong>{" "}
                        {selectedUser[field.toLowerCase() as keyof User]}
                      </p>
                    )
                  )}
                </div>
              ) : (
                <form onSubmit={handleEdit} className="flex flex-col gap-2">
                  {["name", "email", "society", "phone", "category", "role"].map(
                    (field) => (
                      <input
                        key={field}
                        type="text"
                        value={formData[field as keyof User] ?? ""}
                        placeholder={field}
                        onChange={(e) =>
                          setFormData({ ...formData, [field]: e.target.value })
                        }
                        className="border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#1221ca]"
                      />
                    )
                  )}
                  <button
                    type="submit"
                    className="mt-2 bg-[#1221ca] text-white p-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                </form>
              )}

              <button
                onClick={closeModal}
                className="mt-4 w-full bg-gray-300 text-gray-800 p-2 rounded-lg hover:bg-gray-400 transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

interface UserSectionProps {
  title: string;
  users: User[];
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  date: string;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  category: string;
  setCategory: React.Dispatch<React.SetStateAction<string>>;
  onView: (user: User, type: "view" | "edit") => void;
  onEdit: (user: User, type: "view" | "edit") => void;
  onDelete: (id: number) => void;
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
  <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
    <h3 className="text-lg font-semibold mb-4 text-[#1221ca]">
      {title} ({users.length})
    </h3>

    {/*Input filters */}
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
      <input
        type="search"
        placeholder="Search name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 min-w-[150px] border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1221ca]"
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        className="border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1221ca]"
      />
      <input
        type="search"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="flex-1 min-w-[150px] border rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1221ca]"
      />
    </div>

    {/* List of users */}
    <ul className="divide-y divide-gray-200">
      {users.map((u) => (
        <li
          key={u.id}
          className="flex flex-wrap justify-between items-center py-2 text-sm gap-2"
        >
          <span className="font-medium">{u.name}</span>
          <span className="text-gray-500">{u.category}</span>
          <span className="text-gray-400 text-xs">
            {u.created_at ? new Date(u.created_at).toLocaleDateString() : ""}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => onView(u, "view")}
              className="p-1.5 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition"
            >
              <Eye size={14} />
            </button>
            <button
              onClick={() => onEdit(u, "edit")}
              className="p-1.5 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
            >
              <Edit size={14} />
            </button>
            <button
              onClick={() => onDelete(u.id)}
              className="p-1.5 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </li>
      ))}
    </ul>
  </div>
);

export default UsersList;
