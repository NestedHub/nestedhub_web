"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

export default function AdminLoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Mock admin credentials
  const ADMIN_EMAIL = "admin@gmail.com"
  const ADMIN_PASSWORD = "12345678"

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError("") // Clear error when typing
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError("") // Clear error when typing
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call delay
    setTimeout(() => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        console.log("Admin login successful", { email })

        // Store admin info in localStorage
        localStorage.setItem("admin", JSON.stringify({ email, role: "admin" }))

        // Redirect to admin dashboard
        router.push("/admin/dashboard")
      } else {
        setError("Invalid email or password")
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <main className="flex min-h-screen">
      <div className="hidden md:flex md:w-1/2 bg-green-800 text-white p-8 flex-col relative">
        <div className="mb-4">
          <Image src="/logowhite.png" alt="NestedHub Logo" width={200} height={40} />
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">Admin Portal</h1>
          <p className="text-xl mb-4">Manage your properties, users, and more.</p>
          <div className="mt-8">
            <Image src="/house.jpg" alt="Modern Property" width={500} height={300} className="rounded-md" priority />
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
            <p className="text-gray-500">Login to access the admin dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{error}</div>
            )}

            <div className="space-y-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <div className="text-xs text-gray-500">Demo email: admin@gmail.com</div>
            </div>

            <div className="space-y-2">
  <div className="relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Password"
      value={password}
      onChange={handlePasswordChange}
      required
      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 pr-10"
    />
    <button
      type="button"
      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
      onClick={() => setShowPassword(!showPassword)}
    >
      {showPassword ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
          <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
          <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
          <line x1="2" x2="22" y1="2" y2="22"></line>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      )}
    </button>
  </div>
  <div className="text-xs text-gray-500">Demo password: 12345678</div>
</div>


            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-green-800 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
            >
              {isLoading ? "Logging in..." : "Log In"}
            </button>

            <div className="text-center text-sm">
              <Link href="/" className="text-green-600 hover:underline">
                Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
