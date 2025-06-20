// component/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ChevronDown,
  Heart,
  Menu,
  User,
  Loader2,
  X,
  CalendarCheck,
} from "lucide-react"; // Import CalendarCheck icon
import { useState, useRef, useEffect, useMemo } from "react";
import { useWishlist } from "@/lib/hooks/usewishlist";
import { useUser } from "@/lib/hooks/useUser";
import { useRouter } from "next/navigation";
import { useUserViewingRequests } from "@/lib/hooks/useViewingRequests"; // Import the hook to get viewing requests

interface HeaderProps {
  userType?: string;
}

export default function Header({ userType = "user" }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { wishlist } = useWishlist();
  const { user, isLoading, isAuthenticated } = useUser();
  const router = useRouter();

  // Use the useUserViewingRequests hook to get viewing requests
  const { data: userViewingRequests, loading: loadingViewingRequests } =
    useUserViewingRequests();

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsMobileMenuOpen(false); // Close mobile menu when header hides
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const getFirstLetterOfName = (name: string | undefined | null) => {
    if (name && typeof name === "string" && name.trim().length > 0) {
      return name.trim().charAt(0).toUpperCase();
    }
    return "";
  };

  const userInitial = getFirstLetterOfName(user?.name);

  let hasValidProfilePictureUrl = false;
  if (
    user &&
    typeof user.profile_picture_url === "string" &&
    user.profile_picture_url.trim().length > 0
  ) {
    const urlString = user.profile_picture_url.trim();
    if (
      urlString.startsWith("/") ||
      urlString.startsWith("http://") ||
      urlString.startsWith("https://")
    ) {
      hasValidProfilePictureUrl = true;
    }
  }

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    if (!isAuthenticated) {
      e.preventDefault();
      router.push("/login");
    }
    setIsMobileMenuOpen(false);
  };

  // Calculate the number of pending viewing requests
  const pendingRequestsCount = useMemo(() => {
    if (userViewingRequests && !loadingViewingRequests) {
      return userViewingRequests.filter(
        (request) => request.status === "pending"
      ).length;
    }
    return 0;
  }, [userViewingRequests, loadingViewingRequests]);

  return (
    <header
      className={`bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg sticky top-0 z-50 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      } h-20 flex items-center`}
    >
      <div className="container mx-auto px-4 py-0 flex items-center justify-between h-full">
        {/* Logo */}
        <Link href="/user" className="flex items-center flex-shrink-0 h-full">
          <Image
            src="/logowhite.png"
            alt="NestedHub Logo"
            width={560} // Increased width
            height={180} // Increased height
            className="w-auto h-12 object-contain" // Adjusted height for image
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
          {/* Viewing Requests Icon */}
          {isAuthenticated ? (
            <Link
              href="/user/viewing-requests"
              className="text-white hover:text-green-200 relative transition-colors duration-200"
              aria-label={`View your viewing requests (${pendingRequestsCount} pending)`}
            >
              <CalendarCheck className="h-6 w-6" />
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-green-800">
                  {pendingRequestsCount}
                </span>
              )}
            </Link>
          ) : (
            <button
              onClick={(e) => handleLinkClick(e, "/user/viewing-requests")}
              className="text-white relative opacity-70 cursor-pointer hover:opacity-100 transition-opacity duration-200"
              aria-label="Viewing Requests (Login required)"
              title="Login to view your requests"
            >
              <CalendarCheck className="h-6 w-6" />
            </button>
          )}

          {/* Wishlist Icon */}
          {isAuthenticated ? (
            <Link
              href="/user/wishlist"
              className="text-white hover:text-green-200 relative transition-colors duration-200"
              aria-label={`View wishlist with ${wishlist.length} items`}
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
              onClick={(e) => handleLinkClick(e, "/user/wishlist")}
              className="text-white relative opacity-70 cursor-pointer hover:opacity-100 transition-opacity duration-200"
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
            <div className="flex items-center space-x-2 bg-white rounded-full p-1.5 pr-3 shadow-sm">
              <Loader2 className="h-5 w-5 text-green-800 animate-spin" />
              <span className="text-green-800 text-sm font-medium hidden sm:inline">
                Loading...
              </span>
            </div>
          ) : isAuthenticated && user ? (
            <Link
              href="/user/profile/me"
              className="flex items-center space-x-2 group p-1 pr-3 rounded-full hover:bg-green-600 transition-colors duration-200"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-white group-hover:border-green-200 transition-colors duration-200 flex items-center justify-center flex-shrink-0">
                {hasValidProfilePictureUrl ? (
                  <Image
                    src={user.profile_picture_url as string}
                    alt={user.name || "User profile picture"}
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
              className="flex items-center space-x-1 bg-white text-green-800 py-1.5 px-3 rounded-full hover:bg-green-100 transition-colors duration-200 shadow-sm"
            >
              <User className="h-5 w-5" />
              <span className="hidden sm:inline text-sm font-medium">
                Sign In
              </span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white hover:text-green-200 transition-colors duration-200 p-2 rounded-md"
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
          className="md:hidden fixed inset-0 bg-green-900/95 backdrop-blur-sm z-40 flex flex-col p-6 animate-slideInLeft"
          style={{ animationDuration: "0.3s" }}
        >
          <div className="flex justify-end mb-8">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-white text-3xl p-2 rounded-md hover:bg-white/10 transition-colors duration-200"
              aria-label="Close mobile menu"
            >
              <X className="h-8 w-8" />
            </button>
          </div>
          <nav className="flex flex-col items-center space-y-6 text-xl font-semibold">
            <Link
              href="/user"
              className="text-white hover:text-green-200 transition-colors duration-200 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/user/rent"
              className="text-white hover:text-green-200 transition-colors duration-200 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Rent
            </Link>
            <Link
              href="/user/about"
              className="text-white hover:text-green-200 transition-colors duration-200 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/user/faq"
              className="text-white hover:text-green-200 transition-colors duration-200 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              FAQ
            </Link>
            {isAuthenticated && user ? (
              <>
                <Link
                  href="/user/profile/me"
                  className="flex items-center space-x-3 text-white hover:text-green-200 transition-colors duration-200 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-white flex items-center justify-center flex-shrink-0">
                    {hasValidProfilePictureUrl ? (
                      <Image
                        src={user.profile_picture_url as string}
                        alt={user.name || "User profile picture"}
                        fill
                        sizes="36px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-green-600 text-white text-xl font-bold flex items-center justify-center">
                        {userInitial}
                      </div>
                    )}
                  </div>
                  <span>{user.name || "User Profile"}</span>
                </Link>
                {/* Viewing Requests Icon for mobile */}
                <Link
                  href="/user/viewing-requests"
                  className="flex items-center space-x-3 text-white hover:text-green-200 transition-colors duration-200 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <CalendarCheck className="h-7 w-7" />
                  <span>Viewing Requests ({pendingRequestsCount})</span>
                </Link>
                <Link
                  href="/user/wishlist"
                  className="flex items-center space-x-3 text-white hover:text-green-200 transition-colors duration-200 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Heart className="h-7 w-7" />
                  <span>Wishlist ({wishlist.length})</span>
                </Link>
              </>
            ) : (
              <Link
                href="/login"
                className="flex items-center space-x-3 text-white hover:text-green-200 transition-colors duration-200 py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <User className="h-7 w-7" />
                <span>Sign In</span>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}