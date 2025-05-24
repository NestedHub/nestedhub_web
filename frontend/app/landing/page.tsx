// app/components/LandingPage.tsx
import Image from "next/image"
import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="flex min-h-screen bg-green-800 text-white">
      <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="mb-4">
            <Image src="/logowhite.png" alt="NestedHub Logo" width={140} height={60} />
          </div>

          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Let us help you find the perfect property today.</h1>
          </div>

          <div className="mt-4 mb-8 md:mb-0">
            <Image src="/house.png" alt="Modern Property" width={500} height={300} className="rounded-md" priority />
          </div>
        </div>

        <div className="w-full md:w-1/3 flex flex-col space-y-4 items-center">
          <Link
            href="/propertyowner/login"
            className="w-full bg-[#b8c75b] hover:bg-[#a3b148] text-center py-3 px-4 rounded-md text-green-900 font-medium transition-colors"
          >
            Login
          </Link>

          <Link
            href="/propertyowner/signup"
            className="w-full bg-[#b8c75b] hover:bg-[#a3b148] text-center py-3 px-4 rounded-md text-green-900 font-medium transition-colors"
          >
            Sign Up
          </Link>

          <Link
            href="/admin/login"
            className="w-full bg-[#8ba43c] hover:bg-[#7a9230] text-center py-3 px-4 rounded-md text-white font-medium transition-colors"
          >
            Admin Login
          </Link>
        </div>
      </div>
    </main>
  )
}
