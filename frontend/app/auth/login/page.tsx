"use client"

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        
      })

      if (!res.ok) {
        throw new Error("Erreur de connexion")
      }

      const data = await res.json()
      setSuccess("Connexion réussie ")

      console.log("Token:", data.token)
      localStorage.setItem("token", data.token)
      console.log("Role:", data.role)
      localStorage.setItem("role", data.role)
    if (data.role === 'Admin') {
        router.push('/dashboards/admin')
      } else if (data.role === 'provider') {
        router.push('/dashboards/provider')
      } else if (data.role === 'buyer') {
        router.push('/dashboards/buyer')
      } else {
        setError("Rôle non reconnu")
      }
    } catch (err) {
      setError("Identifiants invalides ")
    }
  }
   


  return (
    <div className="flex h-screen">
    
    <section className="w-1/2 h-full bg-[#1221ca] flex flex-col text-white p-6">
    <h1 className="font-bold text-lg">Logo</h1>

    <div className="flex flex-1 items-center">
      <h2 className="font-extrabold text-3xl leading-snug">
        WELCOME <br /> BACK!
      </h2>
    </div>
  </section>

<section className="w-1/2 h-screen flex flex-col justify-center items-center p-8">
  <h1 className="text-3xl font-bold mb-10 leading-snug">Sign In</h1>
  <div className="w-full max-w-xs space-y-6">

    <div className="relative">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 py-2 pl-1"
      />
      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
        </svg>
      </span>
    </div>
    <div className="relative">
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 py-2 pl-1"
      />
      <span className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
        </svg>
      </span>
    </div>
    <div>
      <button
        type="submit"
        onClick={handleSubmit}
        className="w-full bg-[#1221ca] text-white font-bold py-2 rounded-full hover:bg-blue-800"
      >
        Login
      </button>
    </div>
    <div className="text-center text-gray-800">
      <p>
        Don't have an Account?{" "}
        <Link href="/auth/registre" className="text-blue-500 font-semibold hover:underline">
          Register
        </Link>
      </p>
    </div>
       
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}  
   
  </div>
</section>
</div>

  )
}

export default LoginPage