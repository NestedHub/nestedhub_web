import Link from "next/link";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      
      {/* Main Content */}
      <main className="flex-grow">{children}</main>

      {/* Footer */}
      <footer className="bg-white shadow-inner py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600 mb-2">
            © {new Date().getFullYear()} NESTHUB. All rights reserved.
          </p>
          <div className="flex justify-center space-x-4 text-gray-600">
            <Link href="/privacy" className="hover:text-blue-600">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-600">
              Terms of Service
            </Link>
            <Link href="/contact" className="hover:text-blue-600">
              Contact Us
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}