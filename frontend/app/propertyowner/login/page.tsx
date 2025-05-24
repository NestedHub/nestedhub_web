import SignInForm from "@/component/signinform"
import Image from "next/image"

export default function Page() {
  return (
    <main className="flex min-h-screen">
      <div className="hidden md:flex md:w-1/2 bg-green-800 text-white p-8 flex-col relative">
        <div className="mb-4">
          <Image src="/logowhite.png" alt="NestedHub Logo" width={200} height={40} />
        </div>
        <div className="max-w-md">
          <h1 className="text-4xl font-bold mb-4">Let us help you find the perfect property today.</h1>
          <div className="mt-8">
            <Image src="/house.jpg" alt="Modern Property" width={500} height={300} className="rounded-md" priority />
          </div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <SignInForm />
      </div>
    </main>
  )
}
