"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    telegramLink: "",
    idCardImage: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        idCardImage: e.target.files![0],
      }))
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log(formData)
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Get Started With NESTHUB</h1>
        <p className="text-xs text-gray-500">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-green-600 hover:underline">
            Terms of Use
          </Link>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <input
            type="tel"
            name="phoneNumber"
            placeholder="Phone Number"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <input
            type="text"
            name="telegramLink"
            placeholder="Telegram Link"
            value={formData.telegramLink}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex justify-center">
          <label className="w-full flex flex-col items-center px-4 py-2 bg-white text-gray-500 rounded-md border border-gray-300 cursor-pointer hover:bg-gray-50">
            <span className="text-sm">{formData.idCardImage ? formData.idCardImage.name : "Upload ID Card Image"}</span>
            <input type="file" name="idCardImage" accept="image/*" onChange={handleFileChange} className="hidden" />
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-green-800 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Submit
        </button>

        <div className="text-center text-sm">
          {"Already have an account? "}
          <Link href="/propertyowner/login" className="text-green-600 hover:underline">
            Login
          </Link>
        </div>
      </form>
    </div>
  )
}
