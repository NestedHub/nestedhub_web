"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Sidebar from "@/component/dashoboadpropertyowner/sidebar"
// Define the steps for property creation
const steps = [
  { id: "general", label: "General" },
  { id: "location", label: "Location" },
  { id: "cost", label: "Cost" },
  { id: "image", label: "Image and video" },
  { id: "contacts", label: "Contacts" },
]

// Define types for our form data
type Facilities = {
  guard: boolean
  airConditioning: boolean
  internet: boolean
  parking: boolean
}

type ForRent = {
  maleStudent: boolean
  femaleStudent: boolean
  manJob: boolean
  womanJob: boolean
}

type GeneralSection = {
  propertyOwner: string
  propertyType: string
  availableFrom: string
  title: string
  description: string
  bedrooms: string
  bathrooms: string
  facilities: Facilities
  forRent: ForRent
}

type LocationSection = {
  city: string
  khan: string
  sangkat: string
  streetName: string
  streetNumber: string
  mapLocation: string
}

type CostSection = {
  rentPrice: string
  electric: string
  water: string
  other: string
}

type ImageSection = {
  propertyImage: File | null
  neighborhoodImage: File | null
}

type ContactsSection = {
  ownerName: string
  phone: string
  email: string
  telegram: string
}

type FormData = {
  general: GeneralSection
  location: LocationSection
  cost: CostSection
  image: ImageSection
  contacts: ContactsSection
}

// Initial form state
const initialFormState: FormData = {
  general: {
    propertyOwner: "",
    propertyType: "Apartment",
    availableFrom: "01 Nov 2024",
    title: "",
    description: "",
    bedrooms: "1",
    bathrooms: "1",
    facilities: {
      guard: false,
      airConditioning: false,
      internet: false,
      parking: false,
    },
    forRent: {
      maleStudent: false,
      femaleStudent: false,
      manJob: false,
      womanJob: false,
    },
  },
  location: {
    city: "Phnom Penh",
    khan: "Phnom Penh",
    sangkat: "Bak Kilo",
    streetName: "Phnom Penh",
    streetNumber: "Phnom Penh",
    mapLocation: "",
  },
  cost: {
    rentPrice: "$0.00",
    electric: "$0.00",
    water: "$0.00",
    other: "$0.00",
  },
  image: {
    propertyImage: null,
    neighborhoodImage: null,
  },
  contacts: {
    ownerName: "",
    phone: "",
    email: "",
    telegram: "",
  },
}

export default function CreatePropertyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>(initialFormState)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push("/propertyowner/property")
    }
  }

  const handleSubmit = () => {
    // In a real app, you would call an API to create the property
    console.log("Form submitted:", formData)
    alert("Property created successfully!")
    router.push("/propertyowner/property")
  }

  const updateFormData = <K extends keyof FormData, T extends keyof FormData[K]>(
    section: K,
    field: T,
    value: FormData[K][T],
  ) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value,
      },
    })
  }

  const updateNestedFormData = <K extends keyof FormData, P extends keyof FormData[K], T extends keyof FormData[K][P]>(
    section: K,
    parentField: P,
    field: T,
    value: FormData[K][P][T],
  ) => {
    setFormData({
      ...formData,
      [section]: {
        ...formData[section],
        [parentField]: {
          ...formData[section][parentField],
          [field]: value,
        } as FormData[K][P],
      },
    })
  }

  const toggleFacility = (facility: keyof Facilities) => {
    updateNestedFormData("general", "facilities", facility, !formData.general.facilities[facility] as boolean)
  }

  const toggleForRent = (option: keyof ForRent) => {
    updateNestedFormData("general", "forRent", option, !formData.general.forRent[option] as boolean)
  }

  const handleFileChange = (section: "image", field: keyof ImageSection, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        [section]: {
          ...formData[section],
          [field]: e.target.files[0],
        },
      })
    }
  }

  // Render different form sections based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // General
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property owner</label>
              <input
                type="text"
                value={formData.general.propertyOwner}
                onChange={(e) => updateFormData("general", "propertyOwner", e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property type</label>
              <div className="relative">
                <select
                  value={formData.general.propertyType}
                  onChange={(e) => updateFormData("general", "propertyType", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Villa">Villa</option>
                  <option value="Condo">Condo</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Available from:</label>
              <div className="relative">
                <select
                  value={formData.general.availableFrom}
                  onChange={(e) => updateFormData("general", "availableFrom", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="01 Nov 2024">01 Nov 2024</option>
                  <option value="15 Nov 2024">15 Nov 2024</option>
                  <option value="01 Dec 2024">01 Dec 2024</option>
                  <option value="15 Dec 2024">15 Dec 2024</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property detail</label>
              <input
                type="text"
                value={formData.general.title}
                onChange={(e) => updateFormData("general", "title", e.target.value)}
                placeholder="Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
              />
              <textarea
                value={formData.general.description}
                onChange={(e) => updateFormData("general", "description", e.target.value)}
                placeholder="Description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedroom</label>
              <input
                type="number"
                value={formData.general.bedrooms}
                onChange={(e) => updateFormData("general", "bedrooms", e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathroom</label>
              <input
                type="number"
                value={formData.general.bathrooms}
                onChange={(e) => updateFormData("general", "bathrooms", e.target.value)}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleFacility("guard")}
                  className={`px-3 py-1 rounded-md ${
                    formData.general.facilities.guard
                      ? "bg-green-800 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Guard
                </button>
                <button
                  type="button"
                  onClick={() => toggleFacility("airConditioning")}
                  className={`px-3 py-1 rounded-md ${
                    formData.general.facilities.airConditioning
                      ? "bg-green-800 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Air Conditioning
                </button>
                <button
                  type="button"
                  onClick={() => toggleFacility("internet")}
                  className={`px-3 py-1 rounded-md ${
                    formData.general.facilities.internet
                      ? "bg-green-800 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Internet / Wifi
                </button>
                <button
                  type="button"
                  onClick={() => toggleFacility("parking")}
                  className={`px-3 py-1 rounded-md ${
                    formData.general.facilities.parking
                      ? "bg-green-800 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Parking
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">For rent</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleForRent("maleStudent")}
                  className={`px-3 py-1 rounded-md ${
                    formData.general.forRent.maleStudent
                      ? "bg-green-800 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Male Student
                </button>
                <button
                  type="button"
                  onClick={() => toggleForRent("femaleStudent")}
                  className={`px-3 py-1 rounded-md ${
                    formData.general.forRent.femaleStudent
                      ? "bg-green-800 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Female Student
                </button>
                <button
                  type="button"
                  onClick={() => toggleForRent("manJob")}
                  className={`px-3 py-1 rounded-md ${
                    formData.general.forRent.manJob
                      ? "bg-green-800 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Man Job
                </button>
                <button
                  type="button"
                  onClick={() => toggleForRent("womanJob")}
                  className={`px-3 py-1 rounded-md ${
                    formData.general.forRent.womanJob
                      ? "bg-green-800 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Woman Job
                </button>
              </div>
            </div>
          </div>
        )

      case 1: // Location
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City / Province:</label>
              <div className="relative">
                <select
                  value={formData.location.city}
                  onChange={(e) => updateFormData("location", "city", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="Phnom Penh">Phnom Penh</option>
                  <option value="Siem Reap">Siem Reap</option>
                  <option value="Battambang">Battambang</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khan / District:</label>
              <div className="relative">
                <select
                  value={formData.location.khan}
                  onChange={(e) => updateFormData("location", "khan", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="Phnom Penh">Phnom Penh</option>
                  <option value="Chamkarmon">Chamkarmon</option>
                  <option value="Daun Penh">Daun Penh</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sangkat / Commune:</label>
              <div className="relative">
                <select
                  value={formData.location.sangkat}
                  onChange={(e) => updateFormData("location", "sangkat", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="Bak Kilo">Bak Kilo</option>
                  <option value="Boeung Keng Kang">Boeung Keng Kang</option>
                  <option value="Tuol Svay Prey">Tuol Svay Prey</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Name:</label>
              <div className="relative">
                <select
                  value={formData.location.streetName}
                  onChange={(e) => updateFormData("location", "streetName", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="Phnom Penh">Phnom Penh</option>
                  <option value="Street 271">Street 271</option>
                  <option value="Street 310">Street 310</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Number:</label>
              <div className="relative">
                <select
                  value={formData.location.streetNumber}
                  onChange={(e) => updateFormData("location", "streetNumber", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="Phnom Penh">Phnom Penh</option>
                  <option value="123">123</option>
                  <option value="456">456</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Location on Map:</label>
              <div className="relative">
                <select
                  value={formData.location.mapLocation}
                  onChange={(e) => updateFormData("location", "mapLocation", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none"
                >
                  <option value="">Select location</option>
                  <option value="Phnom Penh">Phnom Penh</option>
                  <option value="Specific Location">Specific Location</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="mt-4 border border-gray-300 rounded-md overflow-hidden">
                <Image src="/map-placeholder.png" alt="Map" width={600} height={300} className="w-full h-auto" />
              </div>
            </div>
          </div>
        )

      case 2: // Cost
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rent Price</label>
              <input
                type="text"
                value={formData.cost.rentPrice}
                onChange={(e) => updateFormData("cost", "rentPrice", e.target.value)}
                placeholder="$0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Electric</label>
              <input
                type="text"
                value={formData.cost.electric}
                onChange={(e) => updateFormData("cost", "electric", e.target.value)}
                placeholder="$0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Water</label>
              <input
                type="text"
                value={formData.cost.water}
                onChange={(e) => updateFormData("cost", "water", e.target.value)}
                placeholder="$0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other</label>
              <input
                type="text"
                value={formData.cost.other}
                onChange={(e) => updateFormData("cost", "other", e.target.value)}
                placeholder="$0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        )

      case 3: // Image and video
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Property Image</label>
              <div className="bg-gray-200 w-64 h-48 rounded-md flex items-center justify-center mb-2">
                {formData.image.propertyImage ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">{formData.image.propertyImage.name}</p>
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-2">JPG/PNG files with a size less than 500KB</p>
              <label className="bg-teal-100 hover:bg-teal-200 text-teal-700 px-4 py-2 rounded-md cursor-pointer inline-block">
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("image", "propertyImage", e)}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Neighborhood Image</label>
              <div className="bg-gray-200 w-64 h-48 rounded-md flex items-center justify-center mb-2">
                {formData.image.neighborhoodImage ? (
                  <div className="text-center">
                    <p className="text-sm text-gray-600">{formData.image.neighborhoodImage.name}</p>
                  </div>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-2">JPG/PNG files with a size less than 500KB</p>
              <label className="bg-teal-100 hover:bg-teal-200 text-teal-700 px-4 py-2 rounded-md cursor-pointer inline-block">
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange("image", "neighborhoodImage", e)}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )

      case 4: // Contacts
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Owner of this property</label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username:</label>
              <input
                type="text"
                value={formData.contacts.ownerName}
                onChange={(e) => updateFormData("contacts", "ownerName", e.target.value)}
                placeholder="Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone:</label>
              <input
                type="tel"
                value={formData.contacts.phone}
                onChange={(e) => updateFormData("contacts", "phone", e.target.value)}
                placeholder="Phone Number"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address:</label>
              <input
                type="email"
                value={formData.contacts.email}
                onChange={(e) => updateFormData("contacts", "email", e.target.value)}
                placeholder="Email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telegram link:</label>
              <input
                type="text"
                value={formData.contacts.telegram}
                onChange={(e) => updateFormData("contacts", "telegram", e.target.value)}
                placeholder="Telegram link"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Property Listing</h1>
        </div>

        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {steps.map((step, index) => (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    currentStep === index
                      ? "border-green-800 text-green-800"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="mb-8">{renderStepContent()}</div>

        <div className="flex justify-end">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mr-2"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            {currentStep === steps.length - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </Sidebar>
  )
}
