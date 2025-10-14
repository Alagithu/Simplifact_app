"use client"
import Link from "next/link";
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const RegisterPage = () => {
  const router = useRouter()

  const categories = [
    'Electronics',
    'Fashion',
    'Beauty',
    'Home & Kitchen',
    'Sports & Outdoors',
    'Toys & Games',
    'Books',
    'Automotive',
    'Health',
    'Groceries'
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
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    try {
      const res = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          cdi,
          society,
          email,
          category,
          role,
          password
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Erreur lors de l'inscription")
        return
      }

      setSuccess("Inscription réussie !")


     

    } catch (err) {
      setError("Erreur réseau ou serveur")
      console.error(err)
    }
  }

  return (
    <div className="flex h-screen bg-[#1221ca]">
      <header><h1 className="text-white text-lg font-bold p-7">Logo</h1></header>
      <section className="w-full flex flex-col justify-center items-center p-8 bg-[#1221ca] text-white">
        <div className="w-full max-w-lg mt-10">
          <h1 className="text-3xl font-bold mb-2 leading-snug">Create new account</h1>
          <p className="text-sm mb-8 text-black font-bold">
            Already have an Account?{" "}
            <Link href="/" className="text-white hover:underline">
              Login
            </Link>
          </p>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              placeholder="Username"
              className="bg-transparent border border-white rounded-md px-4 py-3 placeholder-grey focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="tel"
              placeholder="Phone"
              className="bg-transparent border border-white rounded-md px-4 py-3 placeholder-grey focus:outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <input
              type="text"
              placeholder="Identity card"
              className="bg-transparent border border-white rounded-md px-4 py-3 placeholder-grey focus:outline-none"
              value={cdi}
              onChange={(e) => setCdi(e.target.value)}
            />
            <input
              type="text"
              placeholder="Company"
              className="bg-transparent border border-white rounded-md px-4 py-3 placeholder-grey focus:outline-none"
              value={society}
              onChange={(e) => setSociety(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="bg-transparent border border-white rounded-md px-4 py-3 placeholder-grey focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <select
                className="w-full bg-transparent hover:bg-[#1221ca] hover:text-white border border-white rounded-md px-4 py-3 placeholder-grey appearance-none focus:outline-none"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option className="bg-[#1221ca] text-white">Category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-[#1221ca] text-white">{cat}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <input
              type="password"
              placeholder="Password"
              className="bg-transparent border border-white rounded-md px-4 py-3 placeholder-grey focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="relative">
              <select
                className="w-full bg-transparent hover:bg-[#1221ca] hover:text-white border border-white rounded-md px-4 py-3 placeholder-white appearance-none focus:outline-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option className="bg-[#1221ca] text-white">Role</option>
                <option value="buyer" className="bg-[#1221ca] text-white">Buyer</option>
                <option value="provider" className="bg-[#1221ca] text-white">Provider</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white font-bold border border-white py-3 mt-6 rounded-md hover:bg-white hover:text-black col-span-2"
            >
              Create account
            </button>
          </form>
          {error && <p className="text-red-500 mt-4">{error}</p>}
          {success && <p className="text-green-500 mt-4">{success}</p>}
        </div>
      </section>
    </div>
  );
};

export default RegisterPage;
