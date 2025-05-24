import Link from "next/link"
import Image from "next/image"

interface FooterProps {
  userType?: string
}

export default function Footer({ userType = "user" }: FooterProps) {
  return (
    <footer className="bg-white py-8 border-t">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Discover your dream home with NestedHub</h2>

          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <Image src="/logo-green.svg" alt="NestedHub Logo" width={150} height={60} className="mb-4" />
            </div>

            <div className="md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Customer support:</span> support@nestedhub.com
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> community@gmail.com
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Contact number:</span> 0976654321
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Location:</span> Royal University of Phnom Penh, Russian Federation
                    Blvd (110)
                  </p>
                </div>

                <div className="flex flex-col items-start md:items-end">
                  <div className="flex space-x-4 mb-6">
                    <a href="#" className="text-blue-600 hover:text-blue-800">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </a>
                    <a href="#" className="text-pink-600 hover:text-pink-800">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153.509.5.902 1.105 1.153 1.772.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 01-1.153 1.772c-.5.508-1.105.902-1.772 1.153-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 01-1.772-1.153 4.904 4.904 0 01-1.153-1.772c-.247-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.218-1.79.465-2.428.254-.66.598-1.216 1.153-1.772.5-.509 1.105-.902 1.772-1.153.637-.247 1.363-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.466.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.048 1.055-.058 1.37-.058 4.04 0 2.67.01 2.986.058 4.04.045.976.207 1.505.344 1.858.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.04.058 2.67 0 2.986-.01 4.04-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.04 0-2.67-.01-2.986-.058-4.04-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.055-.048-1.37-.058-4.04-.058zm0 3.063a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 8.468a3.333 3.333 0 100-6.666 3.333 3.333 0 000 6.666zm6.538-8.469a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
                      </svg>
                    </a>
                    <a href="#" className="text-blue-500 hover:text-blue-700">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.22-1.13 6.93-.14.71-.42 1.34-.76 1.48-.65.33-1.14-.43-1.74-.84-.97-.67-1.51-1.06-2.45-1.72-.08-.04-.16-.11-.16-.19 0-.09.11-.14.18-.18l.07-.04c.55-.36 1.2-.89 1.89-1.61.35-.38.67-.71.67-.71s.18-.19.09-.29c-.09-.1-.36-.1-.36-.1l-1.38.09c-.13.08-.58.38-1.22.91-.23.19-.46.29-.65.29-.07 0-.14-.02-.2-.05-.35-.15-.63-.59-.63-1.19 0-.37.12-.67.36-.91.89-.91 1.69-1.17 2.06-1.24.41-.09.95-.18 1.54-.18 1.75 0 2.82.8 2.82 2.5 0 .03 0 .07-.01.11z" />
                      </svg>
                    </a>
                  </div>

                  <div className="border-t border-gray-200 pt-4 w-full">
                    <div className="flex justify-between">
                      <Link href={`/${userType}`} className="text-sm text-gray-600 hover:text-green-800">
                        HOME
                      </Link>
                      <Link href={`/${userType}/rent`} className="text-sm text-gray-600 hover:text-green-800">
                        RENT
                      </Link>
                      <Link href={`/${userType}/sales`} className="text-sm text-gray-600 hover:text-green-800">
                        SALES
                      </Link>
                      <Link href={`/${userType}/about`} className="text-sm text-gray-600 hover:text-green-800">
                        ABOUT US
                      </Link>
                      <Link href={`/${userType}/faq`} className="text-sm text-gray-600 hover:text-green-800">
                        FAQ
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
