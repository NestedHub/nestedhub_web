import Image from "next/image";
import { FaGlobe, FaUsers, FaShieldAlt, FaHome } from "react-icons/fa";

export default function AboutUs() {
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header Section */}
      <section className="bg-white py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">
            ABOUT NESTHUB
          </h1>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          {/* Text Content */}
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              WELCOME TO NESTHUB, YOUR TRUSTED PARTNER IN CONNECTING PEOPLE
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Nestled in the vibrant heart of Phnom Penh, Cambodia, and proudly
              opened as a dedicated local business by THE ROYAL UNIVERSITY OF
              PHNOM PENH, we believe that finding the right home shouldn’t be a
              stressful hunt—it should be an exciting journey! At NESTHUB, we’re
              committed to making that journey seamless by connecting people with
              their ideal homes, no matter where they are in the world. Whether
              you’re searching for a cozy apartment, a spacious villa, a
              commercial property, or a chance to list your own space, we’ve got
              you covered. Our platform is designed to bridge the gap between
              property seekers and owners, offering a user-friendly experience
              that caters to a variety of needs.
            </p>
          </div>
          {/* Image */}
          <div className="md:w-1/2">
            <Image
              src="/path-to-your-image.jpg" // Replace with the actual path to your image
              alt="Nesthub Property"
              width={500}
              height={300}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            OUR MISSION
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Our mission is to bridge the gap between property seekers and owners
            by providing a seamless, technology-driven solution that simplifies
            the real estate process. We aim to empower our users with the right
            tools, resources, and support to make informed decisions.
          </p>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-12">
            WHY CHOOSE NESTHUB?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 */}
            <div className="flex flex-col items-center text-center">
              <FaGlobe className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                GLOBAL REACH, LOCAL EXPERTISE
              </h3>
              <p className="text-gray-600">
                Our platform connects you with properties worldwide, while our
                local expertise ensures you get the best insights and
                opportunities in Cambodia.
              </p>
            </div>
            {/* Card 2 */}
            <div className="flex flex-col items-center text-center">
              <FaUsers className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                USER-CENTRIC DESIGN
              </h3>
              <p className="text-gray-600">
                Our platform is designed with you in mind, offering an intuitive
                interface to list, search, and manage properties with just a few
                clicks.
              </p>
            </div>
            {/* Card 3 */}
            <div className="flex flex-col items-center text-center">
              <FaShieldAlt className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                SECURITY AND TRUST
              </h3>
              <p className="text-gray-600">
                We vet and verify all properties to ensure transparency,
                fostering trust between buyers, renters, and property owners.
              </p>
            </div>
            {/* Card 4 */}
            <div className="flex flex-col items-center text-center">
              <FaHome className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                COMPREHENSIVE LISTINGS
              </h3>
              <p className="text-gray-600">
                From luxury homes to budget-friendly rentals, we offer a wide
                range of properties tailored to diverse needs and preferences.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}