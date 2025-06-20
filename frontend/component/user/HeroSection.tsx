import Image from "next/image"

export default function HeroSection() {
  return (
    <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
      <div className="lg:w-1/2 space-y-6">
        <div className="space-y-4">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Let us help you
            <br />
            <span className="text-green-700">find the perfect</span>
            <br />
            property today.
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
            Discover amazing properties in prime locations with our comprehensive search and filtering system.
          </p>
        </div>
      </div>
      <div className="lg:w-1/2">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl transform rotate-3"></div>
          <Image
            src="/modern-house.jpg"
            alt="Modern Property"
            width={600}
            height={400}
            className="relative rounded-2xl shadow-2xl border-4 border-white"
          />
        </div>
      </div>
    </div>
  )
}