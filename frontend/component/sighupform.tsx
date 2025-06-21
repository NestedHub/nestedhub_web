// "use client"

// import React, { useState } from "react"
// import Link from "next/link"
// import { useRouter } from "next/navigation"
// import { toast } from "react-hot-toast"
// import { Loader2, UploadCloud } from "lucide-react"
// import { authApi } from "@/lib/api/auth"
// import { propertyOwnerApi } from "@/lib/api/propertyOwner"

// export default function SignUpForm() {
//   const router = useRouter()
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//     idCardImage: null as File | null,
//   })
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }))
//   }

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files && e.target.files[0]) {
//       setFormData((prev) => ({
//         ...prev,
//         idCardImage: e.target.files![0],
//       }))
//     }
//   }

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault()
//     if (formData.password !== formData.confirmPassword) {
//       toast.error("Passwords do not match.")
//       return
//     }
//     if (!formData.idCardImage) {
//       toast.error("Please upload an ID card image for verification.")
//       return
//     }

//     setIsSubmitting(true)
//     toast.loading("Creating your account...")

//     try {
//       // 1. Upload ID card image
//       const idCardUrl = await propertyOwnerApi.uploadImageToCloudinary(formData.idCardImage)

//       // 2. Register user
//       await authApi.register({
//         name: formData.name,
//         email: formData.email,
//         phone: formData.phone,
//         password: formData.password,
//         role: "property_owner",
//         id_card_url: idCardUrl.secure_url,
//       })

//       toast.dismiss()
//       toast.success("Account created successfully! Please log in.")
//       router.push("/login")

//     } catch (error: any) {
//       toast.dismiss()
//       toast.error(error.message || "Failed to create account.")
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <div className="w-full max-w-md">
//       <div className="text-center mb-6">
//         <h1 className="text-2xl font-bold mb-2">Property Owner Registration</h1>
//         <p className="text-xs text-gray-500">
//           By continuing you agree to our{" "}
//           <Link href="/terms" className="text-green-600 hover:underline">
//             Terms of Use
//           </Link>
//         </p>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <input
//           type="text"
//           name="name"
//           placeholder="Full Name"
//           value={formData.name}
//           onChange={handleChange}
//           required
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//         />
//         <input
//           type="email"
//           name="email"
//           placeholder="Enter Email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//         />
//         <input
//           type="tel"
//           name="phone"
//           placeholder="Phone Number"
//           value={formData.phone}
//           onChange={handleChange}
//           required
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//         />
//         <input
//           type="password"
//           name="confirmPassword"
//           placeholder="Confirm Password"
//           value={formData.confirmPassword}
//           onChange={handleChange}
//           required
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
//         />

//         <label className="w-full flex flex-col items-center px-4 py-3 bg-white text-gray-500 rounded-md border-2 border-dashed cursor-pointer hover:bg-gray-50 hover:border-green-500">
//           <UploadCloud className="h-8 w-8 text-gray-400" />
//           <span className="mt-2 text-sm text-center">{formData.idCardImage ? formData.idCardImage.name : "Upload ID Card (Required)"}</span>
//           <input type="file" name="idCardImage" accept="image/*" onChange={handleFileChange} className="hidden" />
//         </label>

//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className="w-full bg-green-800 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 flex justify-center items-center"
//         >
//           {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit"}
//         </button>

//         <div className="text-center text-sm">
//           {"Already have an account? "}
//           <Link href="/login" className="text-green-600 hover:underline">
//             Login
//           </Link>
//         </div>
//       </form>
//     </div>
//   )
// }
