"use client"
import Link from "next/link";
import { useState } from 'react'
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter(); 
  const categories = [
    'Electronics', 'Fashion', 'Beauty', 'Home & Kitchen',
    'Sports & Outdoors', 'Toys & Games', 'Books',
    'Automotive', 'Health', 'Groceries'
  ];

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [cdi, setCdi] = useState("")
  const [society, setSociety] = useState("")
  const [email, setEmail] = useState("")
  const [category, setCategory] = useState("")
  const [role, setRole] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, cdi, society, email, category, role, password }),
      })

      const data = await res.json()
      if (!res.ok) return setError(data.message || "Erreur lors de l'inscription")
        
      alert("User registred");
      router.push("/")
    } catch (err) {
      setError("Erreur réseau ou serveur")
      console.error(err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1221ca] text-white px-4">
      <section className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl md:p-3">
        <div className="flex items-center justify-center mb-4">
          <img src="/logo.png" alt="Logo" className="w-36 md:w-44 drop-shadow-lg" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3 text-center">Create New Account</h1>
        <p className="text-center text-sm mb-8 text-gray-200">
          Already have an account?{" "}
          <Link href="/" className="text-white underline hover:text-gray-300">
            Login
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <input type="text" placeholder="Username" value={name} onChange={(e) => setName(e.target.value)}
            className="bg-transparent border border-white/70 rounded-lg px-4 py-3 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white/60" />
          <input type="tel" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)}
            className="bg-transparent border border-white/70 rounded-lg px-4 py-3 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white/60" />
          <input type="text" placeholder="Identity card" value={cdi} onChange={(e) => setCdi(e.target.value)}
            className="bg-transparent border border-white/70 rounded-lg px-4 py-3 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white/60" />
          <input type="text" placeholder="Company" value={society} onChange={(e) => setSociety(e.target.value)}
            className="bg-transparent border border-white/70 rounded-lg px-4 py-3 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white/60" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="bg-transparent border border-white/70 rounded-lg px-4 py-3 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white/60" />

          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#1221ca]/50 border border-white/70 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/60 text-white">
            <option value="">Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-[#1221ca]">{cat}</option>
            ))}
          </select>

          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent border border-white/70 rounded-lg px-4 py-3 placeholder-gray-200 focus:outline-none focus:ring-2 focus:ring-white/60" />

          <select value={role} onChange={(e) => setRole(e.target.value)}
            className="w-full bg-[#1221ca]/50 border border-white/70 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/60 text-white">
            <option value="">Role</option>
            <option value="buyer" className="bg-[#1221ca]">Buyer</option>
            <option value="provider" className="bg-[#1221ca]">Provider</option>
          </select>

          <button type="submit" className="col-span-1 md:col-span-2 w-full bg-white text-[#1221ca] font-bold py-3 mt-4 rounded-lg hover:bg-gray-100 transition-all duration-200">
            Create Account
          </button>
        </form>

        {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
      </section>
    </div>
  );
};

export default RegisterPage;
