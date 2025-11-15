"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) throw new Error("Erreur de connexion")

      const data = await res.json()
      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.role)

      if (data.role === "Admin") {
        router.push("/dashboards/admin")
      } else if (data.role === "provider") {
        router.push("/dashboards/provider")
      } else if (data.role === "buyer") {
        router.push("/dashboards/buyer")
      } else {
        alert("Unrecognized role")
      }
    } catch (err) {
      alert("Identifiants invalides")
    }
  }

  return (
    <div className="flex h-screen overflow-hidden font-[Inter]">
      <section className="hidden md:flex w-1/2 h-full bg-gradient-to-br from-[#1221ca] to-[#3040ff] text-white flex-col items-center justify-center relative">
        <div className="absolute top-10 left-10">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-40 drop-shadow-lg transition-transform duration-300 hover:scale-105"
          />
        </div>
        <div className="text-center space-y-6">
          <h2 className="font-extrabold text-5xl leading-tight drop-shadow-md tracking-wide">
            WELCOME <br /> BACK!
          </h2>
          <p className="text-lg text-gray-200 max-w-sm mx-auto">
            We're glad to see you again. Log in to continue exploring your dashboard.
          </p>
        </div>
        <div className="absolute bottom-10 text-sm text-gray-300">
          © {new Date().getFullYear()} Simplifact. All rights reserved.
        </div>
      </section>
      <section className="w-full md:w-1/2 h-full flex flex-col justify-center items-center bg-gray-50 px-6">
        <div className="w-full max-w-sm bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            Sign In
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Access your account using your email and password
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1221ca] focus:border-transparent"
              />
              <span className="absolute right-4 top-3.5 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                  />
                </svg>
              </span>
            </div>

            <div className="relative">
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1221ca] focus:border-transparent"
              />
              <span className="absolute right-4 top-3.5 text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 
                      11.25h10.5a2.25 2.25 0 0 0 
                      2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 
                      2.25 0 0 0-2.25 2.25v6.75a2.25 
                      2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </span>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1221ca] text-white font-semibold py-3 rounded-lg hover:bg-blue-800 transition-all duration-300"
            >
              Login
            </button>

            <div className="text-center text-gray-600 text-sm">
              Don’t have an account?{" "}
              <Link
                href="/auth/registre"
                className="text-[#1221ca] font-semibold hover:underline"
              >
                Register
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}

export default LoginPage
