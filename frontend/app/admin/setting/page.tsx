"use client"

import { useState } from "react"
import AdminSidebar from "@/component/admin/sidebar"

export default function AdminSettingPage() {
  const [selectedCurrency, setSelectedCurrency] = useState("$")
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false)

  const handleCurrencyChange = (currency: string) => {
    setSelectedCurrency(currency)
    setCurrencyDropdownOpen(false)
  }

  const handleSaveChanges = () => {
    console.log("Currency saved:", selectedCurrency)
    // In a real app, you would call an API to save the settings
  }

  return (
    <AdminSidebar>
      <div>
        <h1 className="text-2xl font-bold mb-6">Setting</h1>

        <div className="mb-8">
          <h2 className="text-sm font-medium text-gray-700 mb-4">Information about</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
            <div className="relative">
              <button
                onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                className="w-full flex items-center justify-between bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <span>Select Currency: {selectedCurrency}</span>
                <svg
                  className={`h-5 w-5 text-gray-400 transition-transform ${currencyDropdownOpen ? "rotate-180" : ""}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {currencyDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200">
                  <div className="py-1 text-center text-sm text-gray-700">Select</div>
                  <button
                    onClick={() => handleCurrencyChange("$")}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    $
                  </button>
                  <button
                    onClick={() => handleCurrencyChange("£")}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    £
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleSaveChanges}
            className="bg-[#b8c75b] hover:bg-[#a3b148] text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Save changes
          </button>
        </div>
      </div>
    </AdminSidebar>
  )
}
