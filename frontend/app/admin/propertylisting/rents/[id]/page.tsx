"use client"

import { useParams } from "next/navigation"
import AdminSidebar from "@/component/admin/sidebar"
import BackButton from "@/component/ui/backbutton"
// Mock data for a rental property
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
    airConditioning: "yes",
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

export default function RentalPropertyDetailPage() {
  const params = useParams()
  const propertyId = params.id as string

  // In a real app, you would fetch the property data based on the ID
  const property = mockPropertyDetail

  return (
    <AdminSidebar>
      <div>
        <div className="flex items-center mb-6">
          <BackButton className="mr-4" />
          <h1 className="text-2xl font-bold">Rental property detail</h1>
        </div>

        <div className="bg-white rounded-md shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Property Detail</h2>

          <div className="mb-6">
            <div className="bg-gray-200 w-64 h-48 rounded-md flex items-center justify-center mb-2">
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
              <div>{property.title}</div>
            </div>
            <div>
              <div className="font-medium mb-2">Description</div>
              <div>{property.description}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Home Detail</div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="font-medium">Type</div>
                  <div>{property.type}</div>
                </div>
                <div>
                  <div className="font-medium">Bedroom</div>
                  <div>{property.bedrooms}</div>
                </div>
                <div>
                  <div className="font-medium">Bathroom</div>
                  <div>{property.bathrooms}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Rent Information</div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-medium">Available From</div>
                  <div>{property.availableFrom}</div>
                </div>
                <div>
                  <div className="font-medium">Location</div>
                  <div>{property.location}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Facilities</div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="font-medium">Air-Conditioning</div>
                  <div>{property.facilities.airConditioning}</div>
                </div>
                <div>
                  <div className="font-medium">Guard</div>
                  <div>{property.facilities.guard}</div>
                </div>
                <div>
                  <div className="font-medium">Parking</div>
                  <div>{property.facilities.parking}</div>
                </div>
                <div>
                  <div className="font-medium">Internet</div>
                  <div>{property.facilities.internet}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Cost</div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="font-medium">Rent Price</div>
                  <div>{property.cost.rentPrice}</div>
                </div>
                <div>
                  <div className="font-medium">Electric</div>
                  <div>{property.cost.electric}</div>
                </div>
                <div>
                  <div className="font-medium">Water</div>
                  <div>{property.cost.water}</div>
                </div>
                <div>
                  <div className="font-medium">Other</div>
                  <div>{property.cost.other}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">For Rent</div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <div className="font-medium">Male Student</div>
                  <div>{property.forRent.maleStudent}</div>
                </div>
                <div>
                  <div className="font-medium">Female Student</div>
                  <div>{property.forRent.femaleStudent}</div>
                </div>
                <div>
                  <div className="font-medium">Man Job</div>
                  <div>{property.forRent.manJob}</div>
                </div>
                <div>
                  <div className="font-medium">Woman Job</div>
                  <div>{property.forRent.womanJob}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="font-medium mb-2">Property owner information</div>
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="grid grid-cols-1 gap-2">
                <div>
                  <div className="font-medium">Name: {property.owner.name}</div>
                </div>
                <div>
                  <div className="font-medium">phone: {property.owner.phone}</div>
                </div>
                <div>
                  <div className="font-medium">email: {property.owner.email}</div>
                </div>
                <div>
                  <div className="font-medium">telegram link: {property.owner.telegram}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminSidebar>
  )
}
