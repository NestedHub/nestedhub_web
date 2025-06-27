// UserDetailPage.tsx
"use client";

import React, { useState } from "react"; // Import useState
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useUserDetail } from "@/lib/hooks/useUserDetail";
import { useUserProperties } from "@/lib/hooks/useUserProperties";
import PropertyCard from "@/component/property/propertyCard";
import Header from "@/component/user/header";
import Footer from "@/component/user/footer";
import {
  Mail,
  Phone,
  Lock,
  BadgeCheck,
  AlertCircle,
  User,
  CheckCircle,
  Link as LinkIcon,
  Loader2,
  XCircle,
} from "lucide-react";

const DEFAULT_PROPERTY_IMAGE = "/property.png";

const UserDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId;

  const parsedUserId =
    typeof userId === "string" ? parseInt(userId, 10) : undefined;

  const { user, isLoadingUser, errorUser } = useUserDetail(parsedUserId);
  const {
    properties,
    isLoading: isLoadingProperties,
    error: errorProperties,
    fetchProperties,
  } = useUserProperties();

  // State to track if the profile picture has failed to load
  const [profilePicError, setProfilePicError] = useState(false);

  React.useEffect(() => {
    if (parsedUserId) {
      fetchProperties(parsedUserId);
    }
    // Reset profilePicError when user changes or component mounts
    setProfilePicError(false);
  }, [parsedUserId, fetchProperties, user]); // Added 'user' to dependency array to reset on user change

  // Helper function to get the first letter of the name
  const getFirstLetterOfName = (name: string | undefined | null) => {
    if (name && typeof name === "string" && name.trim().length > 0) {
      return name.trim().charAt(0).toUpperCase();
    }
    return "";
  };

  const userInitial = getFirstLetterOfName(user?.name);

  if (isLoadingUser || isLoadingProperties) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <p className="text-xl text-gray-700 font-medium">
          Loading user details and properties...
        </p>
      </div>
    );
  }

  if (errorUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <XCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
          <h2 className="text-3xl font-bold text-red-600 mb-3">
            Error Loading User
          </h2>
          <p className="mt-2 text-lg text-gray-700 mb-8">{errorUser}</p>
          <button
            onClick={() => router.back()}
            className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
        <div className="bg-white p-8 rounded-xl shadow-xl text-center">
          <User className="mx-auto h-16 w-16 text-gray-400 mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            User Not Found
          </h2>
          <p className="mt-2 text-lg text-gray-700 mb-8">
            The user you are looking for does not exist or the ID is invalid.
          </p>
          <button
            onClick={() => router.push("/")}
            className="w-full px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  const mapPropertyReadToCardProps = (propertyRead: any) => {
    // Console logs for debugging (can be removed after fix)
    console.log(
      `Property ID: ${propertyRead.property_id}, Raw Media:`,
      propertyRead.media
    );

    const firstImage =
      propertyRead.media && propertyRead.media.length > 0
        ? propertyRead.media.find((m: any) => m.media_type === "image")
            ?.media_url || propertyRead.media[0].media_url
        : DEFAULT_PROPERTY_IMAGE;

    console.log(
      `Property ID: ${propertyRead.property_id}, Selected Image URL:`,
      firstImage
    );

    if (propertyRead.media && propertyRead.media.length > 0) {
      console.log(
        `Property ID: ${propertyRead.property_id}, URL from first media item:`,
        propertyRead.media[0].media_url
      );
    } else {
      console.log(
        `Property ID: ${propertyRead.property_id}, No media found, using default image.`
      );
    }

    return {
      id: propertyRead.property_id.toString(),
      title: propertyRead.title,
      category: propertyRead.category_name,
      price:
        propertyRead.pricing.rent_price ||
        propertyRead.pricing.other_price ||
        "N/A",
      location: `${propertyRead.location.commune_name}, ${propertyRead.location.district_name}, ${propertyRead.location.city_name}`,
      bedrooms: propertyRead.bedrooms,
      bathrooms: propertyRead.bathrooms,
      image: firstImage,
      rating: parseFloat(propertyRead.rating) || undefined,
    };
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-12 flex-grow">
        <title>{user.name}'s Profile</title>
        <div className="max-w-6xl mx-auto bg-white shadow-2xl rounded-xl p-8 sm:p-10 lg:p-12 border border-gray-200">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center pb-6 border-b-2 border-blue-500/50">
            {user.name}'s Profile
          </h1>

          <div className="xl:flex xl:space-x-12">
            <div className="xl:w-1/4 flex flex-col items-center text-center pt-8 mb-8 xl:mb-0">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-blue-400 shadow-lg relative flex items-center justify-center">
                {profilePicError || !user.profile_picture_url ? ( // Check if error or no URL exists
                  <div className="w-full h-full bg-blue-500 text-white text-6xl font-bold flex items-center justify-center">
                    {userInitial || <User className="w-24 h-24" />}{" "}
                    {/* Fallback to User icon if no initial */}
                  </div>
                ) : (
                  <Image
                    src={user.profile_picture_url}
                    alt={`${user.name}'s profile picture`}
                    layout="fill"
                    objectFit="cover"
                    onError={() => setProfilePicError(true)} // Set state on error
                  />
                )}
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mt-4 mb-2">
                {user.name}
              </h2>
              <p className="text-lg text-gray-600 mb-4 flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-500" /> {user.email}
              </p>
              <p className="text-lg text-gray-600 mb-6 flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-500" />{" "}
                {user.phone || "N/A"}
              </p>
              <p
                className={`px-4 py-2 rounded-full text-sm font-medium text-purple-700 bg-purple-100 capitalize`}
              >
                <span className="flex items-center">
                  <Lock className="h-4 w-4 mr-1.5" /> Role: {user.role}
                </span>
              </p>
            </div>

            <div className="xl:w-3/4 space-y-6 xl:pl-12 xl:border-l xl:border-gray-200 xl:py-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                General Information
              </h2>

              <div>
                <p className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <User className="h-4 w-4 mr-2 text-blue-500" /> Full Name
                </p>
                <p className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-gray-800 text-base">
                  {user.name}
                </p>
              </div>

              <div>
                <p className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Mail className="h-4 w-4 mr-2 text-blue-500" /> Email Address
                </p>
                <p className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-gray-800 text-base">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="h-4 w-4 mr-2 text-blue-500" /> Phone Number
                </p>
                <p className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg shadow-sm text-gray-800 text-base">
                  {user.phone || "N/A"}
                </p>
              </div>

              {user.id_card_url && (
                <div className="col-span-1 md:col-span-2 pt-4">
                  <p className="font-medium text-gray-600 mb-2">ID Card:</p>
                  <a
                    href={user.id_card_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline flex items-center text-sm font-semibold"
                  >
                    <LinkIcon className="h-4 w-4 mr-1" /> View ID Card
                  </a>
                  {/* For ID card, you might still want to display a generic fallback image or leave it as is,
                      as an initial for an ID card doesn't make as much sense visually.
                      Keeping the existing onError for the ID card for now. */}
                  <div className="mt-4 w-64 h-40 relative border rounded-md overflow-hidden shadow-md">
                    <Image
                      src={user.id_card_url}
                      alt={`${user.name}'s ID Card`}
                      layout="fill"
                      objectFit="contain"
                      // You can add an onError here as well if you want a fallback for ID card image
                      onError={(e) => {
                        e.currentTarget.src = "/images/id_card_fallback.png"; // A generic fallback for ID card
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                  Properties Listed by {user.name}
                </h2>
                {errorProperties && (
                  <p className="text-red-500 text-center mb-4">
                    Error loading properties: {errorProperties.message}
                  </p>
                )}
                {!isLoadingProperties && properties && properties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {properties.map((property) => (
                      <PropertyCard
                        key={property.property_id}
                        property={mapPropertyReadToCardProps(property)}
                        isUserAuthenticated={false}
                        isUserLoading={false}
                        initialIsWishlisted={false}
                      />
                    ))}
                  </div>
                ) : (
                  !isLoadingProperties && (
                    <p className="text-gray-600 text-center">
                      This user has not listed any properties yet.
                    </p>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t-2 border-gray-100 mt-8 flex justify-center">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-8 py-3 border border-transparent text-lg font-semibold rounded-lg shadow-lg text-white bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-300 transform hover:scale-105"
            >
              Go Back
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDetailPage;
