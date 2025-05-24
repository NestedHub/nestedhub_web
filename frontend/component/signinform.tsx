"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignInForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Mock credentials
  const MOCK_EMAIL = "user@gmail.com"
  const MOCK_PASSWORD = "12345678"

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    setError("") // Clear error when typing
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    setError("") // Clear error when typing
  }

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(e.target.checked)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call delay
    setTimeout(() => {
      if (email === MOCK_EMAIL && password === MOCK_PASSWORD) {
        console.log("Login successful", { email, password, rememberMe })

        // Store user info in localStorage or sessionStorage
        if (rememberMe) {
          localStorage.setItem("user", JSON.stringify({ email }))
        } else {
          sessionStorage.setItem("user", JSON.stringify({ email }))
        }

        // Redirect to dashboard
        router.push("/propertyowner/dashboard")
      } else {
        setError("Invalid email or password")
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">Welcome To NestedHub</h1>
        <p className="text-gray-500">Login into your account</p>
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
          <div className="text-xs text-gray-500">Demo email: user@gmail.com</div>
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

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={handleRememberMeChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <label htmlFor="remember" className="text-sm font-medium text-gray-700">
              Remember me
            </label>
          </div>
          <Link href="/recover-password" className="text-sm text-red-500 hover:underline">
            Recover Password
          </Link>
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
          {"Don't have an account? "}
          <Link href="/propertyowner/signup" className="text-green-600 hover:underline">
            Sign up!
          </Link>
        </div>
      </form>
    </div>
  )
}
