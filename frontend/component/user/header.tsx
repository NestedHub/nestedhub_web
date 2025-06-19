// component/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Heart, Menu, User, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useWishlist } from "@/lib/hooks/usewishlist";
import { useUser } from "@/lib/hooks/useUser";
import { useRouter } from "next/navigation";

interface HeaderProps {
  userType?: string;
}

export default function Header({ userType = "user" }: HeaderProps) {
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { wishlist } = useWishlist();
  const { user, isLoading, isAuthenticated } = useUser();
  const router = useRouter();

  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle scroll for hide/show header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsLanguageOpen(false);
        setIsMobileMenuOpen(false);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Function to get the first letter of the user's name
  const getFirstLetterOfName = (name: string | undefined | null) => {
    if (name && typeof name === "string" && name.trim().length > 0) {
      return name.trim().charAt(0).toUpperCase();
    }
    return ""; // Return empty string if no valid name
  };

  const userInitial = getFirstLetterOfName(user?.name);

  // --- Robust check for profile_picture_url validity ---
  let hasValidProfilePictureUrl = false;
  if (
    user &&
    typeof user.profile_picture_url === "string" &&
    user.profile_picture_url.trim().length > 0
  ) {
    const urlString = user.profile_picture_url.trim();
    // Check if it starts with a leading slash or an absolute URL protocol
    if (
      urlString.startsWith("/") ||
      urlString.startsWith("http://") ||
      urlString.startsWith("https://")
    ) {
      hasValidProfilePictureUrl = true;
    }
  }
  // ----------------------------------------------------

  // Function to handle wishlist link click
  const handleWishlistClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault(); // Prevent navigation
      router.push("/login"); // Redirect to login page
    }
    setIsMobileMenuOpen(false); // Close mobile menu on click (for mobile)
  };

  return (
    <header
      className={`bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg sticky top-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } h-16 flex items-center`}
    >
      <div className="container mx-auto px-4 py-0 flex items-center justify-between h-full">
        {/* Logo */}
        <Link href="/user" className="flex items-center flex-shrink-0 h-full">
          <Image
            src="/logowhite.png"
            alt="NestedHub Logo"
            width={120} // Slightly increased width for better visibility
            height={40} // Constrain height
            className="w-auto h-10 object-contain" // Use object-contain and set a fixed height
          />
        </Link>

        {/* Navigation - Desktop */}
        <nav className="hidden md:flex items-center space-x-10 text-lg font-medium">
          <Link
            href="/user"
            className="hover:text-green-200 transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            href="/user/rent"
            className="hover:text-green-200 transition-colors duration-200"
          >
            Rent
          </Link>
          <Link
            href="/user/about"
            className="hover:text-green-200 transition-colors duration-200"
          >
            About Us
          </Link>
          <Link
            href="/user/faq"
            className="hover:text-green-200 transition-colors duration-200"
          >
            FAQ
          </Link>
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Language Selector */}
          <div className="relative" ref={languageDropdownRef}>
            <button
              className="flex items-center space-x-1 text-sm font-medium hover:text-green-200 transition-colors duration-200 py-1 px-2 rounded-md"
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            >
              <Image
                src="/english.png"
                alt="English"
                width={20} // Adjusted flag size
                height={15} // Adjusted flag size
                className="rounded-sm object-cover"
              />
              <span className="hidden sm:inline">English</span>
              <ChevronDown
                className={`h-4 w-4 transform transition-transform ${
                  isLanguageOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isLanguageOpen && (
              <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-xl overflow-hidden z-20">
                <div className="py-1">
                  <button className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 w-full text-left transition-colors duration-150">
                    <Image
                      src="/english.png"
                      alt="English"
                      width={20}
                      height={15}
                      className="rounded-sm object-cover mr-2"
                    />
                    English
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 w-full text-left transition-colors duration-150">
                    <Image
                      src="/khmer.png"
                      alt="Khmer"
                      width={20}
                      height={15}
                      className="rounded-sm object-cover mr-2"
                    />
                    ខ្មែរ
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wishlist - Desktop */}
          {isAuthenticated ? (
            <Link
              href="/user/wishlist"
              className="text-white hover:text-green-200 relative transition-colors duration-200"
            >
              <Heart className="h-6 w-6" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-green-800">
                  {wishlist.length}
                </span>
              )}
            </Link>
          ) : (
            <button
              onClick={handleWishlistClick}
              className="text-white relative opacity-50 cursor-not-allowed"
              aria-label="Wishlist (Login required)"
              title="Login to view your wishlist"
            >
              <Heart className="h-6 w-6" />
              {wishlist.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-green-800">
                  {wishlist.length}
                </span>
              )}
            </button>
          )}

          {/* User Profile / Sign In */}
          {isLoading ? (
            <div className="flex items-center space-x-2 bg-white rounded-full p-1.5 animate-pulse">
              <Loader2 className="h-5 w-5 text-green-800 animate-spin" />
              <span className="text-green-800 text-sm font-medium hidden sm:inline">
                Loading...
              </span>
            </div>
          ) : isAuthenticated && user ? (
            <Link href="/user/profile" className="flex items-center space-x-2 group">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white group-hover:border-green-200 transition-colors duration-200 flex items-center justify-center">
                {hasValidProfilePictureUrl ? (
                  <Image
                    src={user.profile_picture_url as string}
                    alt={user.name || "User"}
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-green-600 text-white text-lg font-bold flex items-center justify-center">
                    {userInitial}
                  </div>
                )}
              </div>
              <span className="hidden sm:inline text-sm font-medium group-hover:text-green-200 transition-colors duration-200">
                {user.name || "User"}
              </span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-1 hover:text-green-200 transition-colors duration-200"
            >
              <div className="bg-white rounded-full p-1.5">
                {" "}
                {/* Adjusted padding here */}
                <User className="h-5 w-5 text-green-800" />
              </div>
              <span className="hidden sm:inline text-sm font-medium">Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-green-200 transition-colors duration-200"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Open mobile menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay (Off-canvas or Full-screen) */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="md:hidden fixed inset-0 bg-green-900/95 backdrop-blur-sm z-40 flex flex-col p-6"
        >
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white text-3xl"
              aria-label="Close mobile menu"
            >
              &times;
            </button>
          </div>
          <nav className="flex flex-col items-center space-y-6 text-xl font-semibold">
            <Link
              href="/user"
              className="text-white hover:text-green-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/user/rent"
              className="text-white hover:text-green-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rent
            </Link>
            <Link
              href="/user/about"
              className="text-white hover:text-green-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/user/faq"
              className="text-white hover:text-green-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/user/profile"
                  className="flex items-center space-x-2 text-white hover:text-green-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white flex items-center justify-center">
                    {hasValidProfilePictureUrl ? (
                      <Image
                        src={user.profile_picture_url as string}
                        alt={user.name || "User"}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-600 text-white text-lg font-bold flex items-center justify-center">
                        {userInitial}
                      </div>
                    )}
                  </div>
                  <span>{user.name || "User"}</span>
                </Link>
                <Link
                  href="/user/wishlist"
                  className="flex items-center space-x-2 text-white hover:text-green-200"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="h-6 w-6" />
                  <span>Wishlist ({wishlist.length})</span>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-2 text-white hover:text-green-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-6 w-6" />
                <span>Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}