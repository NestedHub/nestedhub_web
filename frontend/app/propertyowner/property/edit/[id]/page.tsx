"use client"

import type React from "react"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import Sidebar from "@/component/dashoboadpropertyowner/sidebar"

// Mock property data
const mockPropertyDetail = {
  id: "01",
  title: "Luxury Apartment in Downtown",
  description: "Description",
  type: "Apartment",
  bedrooms: 3,
  bathrooms: 2,
  availableFrom: "02 Jan 2025",
  location: "Location",
  facilities: {
    airConditioning: "no",
    guard: "yes",
    parking: "no",
    internet: "yes",
  },
  cost: {
    rentPrice: "$500/month",
    electric: "$30",
    water: "$20",
    other: "$50",
  },
  forRent: {
    maleStudent: "no",
    femaleStudent: "yes",
    manJob: "no",
    womanJob: "no",
  },
  owner: {
    name: "Name Here",
    phone: "0987777",
    email: "email@example.com",
    telegram: "@telegram-link",
  },
}

export default function EditPropertyPage() {
  const params = useParams()
  const router = useRouter()
  const propertyId = params.id as string

  // In a real app, you would fetch the property data based on the ID
  const [property, setProperty] = useState(mockPropertyDetail)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would call an API to update the property
    alert("Property updated successfully!")
    router.push(`/propertyowner/property/${propertyId}`)
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <Sidebar>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Property Listing</h1>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold">Edit Rent Peroperty</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <div className="grid grid-cols-2">
              <div className="font-medium">Title</div>
              <div>Detail</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Thumbnail</div>
            <div className="bg-gray-200 w-64 h-48 rounded-md flex items-center justify-center">
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
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="font-medium mb-2">Title</div>
              <input
                type="text"
                value={property.title}
                onChange={(e) => setProperty({ ...property, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <div className="font-medium mb-2">Description</div>
              <input
                type="text"
                value={property.description}
                onChange={(e) => setProperty({ ...property, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Home Detail</div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="font-medium mb-2">Type</div>
                  <input
                    type="text"
                    value={property.type}
                    onChange={(e) => setProperty({ ...property, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <div className="font-medium mb-2">Bedroom</div>
                  <input
                    type="number"
                    value={property.bedrooms}
                    onChange={(e) => setProperty({ ...property, bedrooms: Number.parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <div className="font-medium mb-2">Bathroom</div>
                  <input
                    type="number"
                    value={property.bathrooms}
                    onChange={(e) => setProperty({ ...property, bathrooms: Number.parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Rent Information</div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium mb-2">Available From</div>
                  <input
                    type="text"
                    value={property.availableFrom}
                    onChange={(e) => setProperty({ ...property, availableFrom: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <div className="font-medium mb-2">Location</div>
                  <input
                    type="text"
                    value={property.location}
                    onChange={(e) => setProperty({ ...property, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Facilities</div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="font-medium mb-2">Air-Conditioning</div>
                  <select
                    value={property.facilities.airConditioning}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        facilities: { ...property.facilities, airConditioning: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="yes">yes</option>
                    <option value="no">no</option>
                  </select>
                </div>
                <div>
                  <div className="font-medium mb-2">Guard</div>
                  <select
                    value={property.facilities.guard}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        facilities: { ...property.facilities, guard: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="yes">yes</option>
                    <option value="no">no</option>
                  </select>
                </div>
                <div>
                  <div className="font-medium mb-2">Parking</div>
                  <select
                    value={property.facilities.parking}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        facilities: { ...property.facilities, parking: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="yes">yes</option>
                    <option value="no">no</option>
                  </select>
                </div>
                <div>
                  <div className="font-medium mb-2">Internet</div>
                  <select
                    value={property.facilities.internet}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        facilities: { ...property.facilities, internet: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="yes">yes</option>
                    <option value="no">no</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Cost</div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="font-medium mb-2">Rent Price</div>
                  <input
                    type="text"
                    value={property.cost.rentPrice}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        cost: { ...property.cost, rentPrice: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <div className="font-medium mb-2">Electric</div>
                  <input
                    type="text"
                    value={property.cost.electric}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        cost: { ...property.cost, electric: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <div className="font-medium mb-2">Water</div>
                  <input
                    type="text"
                    value={property.cost.water}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        cost: { ...property.cost, water: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <div className="font-medium mb-2">Other</div>
                  <input
                    type="text"
                    value={property.cost.other}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        cost: { ...property.cost, other: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">For Rent</div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="font-medium mb-2">Male Student</div>
                  <select
                    value={property.forRent.maleStudent}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        forRent: { ...property.forRent, maleStudent: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="yes">yes</option>
                    <option value="no">no</option>
                  </select>
                </div>
                <div>
                  <div className="font-medium mb-2">Female Student</div>
                  <select
                    value={property.forRent.femaleStudent}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        forRent: { ...property.forRent, femaleStudent: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="yes">yes</option>
                    <option value="no">no</option>
                  </select>
                </div>
                <div>
                  <div className="font-medium mb-2">Man Job</div>
                  <select
                    value={property.forRent.manJob}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        forRent: { ...property.forRent, manJob: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="yes">yes</option>
                    <option value="no">no</option>
                  </select>
                </div>
                <div>
                  <div className="font-medium mb-2">Woman Job</div>
                  <select
                    value={property.forRent.womanJob}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        forRent: { ...property.forRent, womanJob: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="yes">yes</option>
                    <option value="no">no</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Property owner information</div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="font-medium mb-2">Name</div>
                  <input
                    type="text"
                    value={property.owner.name}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        owner: { ...property.owner, name: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <div className="font-medium mb-2">Phone</div>
                  <input
                    type="text"
                    value={property.owner.phone}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        owner: { ...property.owner, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <div className="font-medium mb-2">Email</div>
                  <input
                    type="email"
                    value={property.owner.email}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        owner: { ...property.owner, email: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <div className="font-medium mb-2">Telegram link</div>
                  <input
                    type="text"
                    value={property.owner.telegram}
                    onChange={(e) =>
                      setProperty({
                        ...property,
                        owner: { ...property.owner, telegram: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleBack}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 mr-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-800 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </Sidebar>
  )
}
