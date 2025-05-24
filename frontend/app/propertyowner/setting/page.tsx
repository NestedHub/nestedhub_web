"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Sidebar from "@/component/dashoboadpropertyowner/sidebar"

export default function SettingsPage() {
  const [userInfo, setUserInfo] = useState({
    fullName: "Song Lyne",
    email: "songlyne@gmail.com",
    phone: "+855123456789",
  })

  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleUserInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setUserInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("User info updated:", userInfo)
    // Handle user info update logic
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Password updated:", passwordInfo)
    // Handle password update logic
  }

  return (
    <Sidebar>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Setting</h1>

        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4">User setting</h2>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0">
              <div className="relative w-24 h-24">
                <Image
                  src="/avatar-placeholder.png"
                  alt="User Avatar"
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white shadow"
                />
              </div>
            </div>

            <div className="flex-grow max-w-md">
              <form onSubmit={handleUserInfoSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={userInfo.fullName}
                    onChange={handleUserInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={userInfo.email}
                    onChange={handleUserInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={userInfo.phone}
                    onChange={handleUserInfoChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="bg-[#b8c75b] hover:bg-[#a3b148] text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Save changes
                  </button>
                  <button type="button" className="ml-4 text-sm text-blue-600 hover:underline">
                    Forgot your password?
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-8 max-w-md">
          <h2 className="text-lg font-medium mb-4">Change password</h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                name="currentPassword"
                placeholder="Your old password"
                value={passwordInfo.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <input
                type="password"
                name="newPassword"
                placeholder="New Password"
                value={passwordInfo.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={passwordInfo.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <button
                type="submit"
                className="bg-[#b8c75b] hover:bg-[#a3b148] text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Sidebar>
  )
}
