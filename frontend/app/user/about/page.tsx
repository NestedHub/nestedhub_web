// app/about/page.tsx (Recommended path)
import Image from "next/image";
import { Globe, Users, Shield, FileText, Facebook, Instagram, Send } from "lucide-react";

// IMPORTANT: Removed Header and Footer imports here
// import Header from "@/component/user/header";
// import Footer from "@/component/user/footer";

export default function AboutUsPage() {
  return (
    // The min-h-screen and flex flex-col should be on the layout, not here.
    // The background color should also be handled by the layout's main tag or the layout's root div.
    // We remove the outermost div here because the layout already provides it.
    <> {/* Use a React Fragment to wrap the content */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-10"> {/* This div was previously your main tag */}
        {/* About Section */}
        <section className="mb-12 md:mb-16">
          <h1 className="text-3xl md:text-4xl font-bold text-[#31511e] mb-6">ABOUT NESTHUB</h1>
          <div className="w-full h-px bg-[#d9d9d9] mb-8"></div> {/* Divider */}

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p>
              Welcome to NESTHUB, your trusted partner in connecting people to their ideal home, no matter where they
              are in the world. Nestled in the vibrant heart of Phnom Penh, Cambodia, and proudly operated by a
              dedicated team based at The Royal University of Phnom Penh, NESTHUB stands as a beacon for seamless real
              estate transactions. Our platform was created with a singular goal in mind: to make buying, selling, and
              renting homes easier, more secure, and more accessible for everyone.
            </p>

            <p>
              At NESTHUB, we believe that finding the right home shouldn't be stressful—it should be an exciting journey
              full of possibilities. Whether you're searching for a cozy apartment, a spacious villa, or a commercial
              property, our diverse listings cater to a variety of needs and budgets. We've designed our platform to
              empower users with intuitive tools, ensuring a smooth experience from Browse to finalizing a deal.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="mb-12 md:mb-16">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/luxury-house-with-pool.jpg" // Changed to a more descriptive placeholder image path
                alt="Luxury house with pool at night"
                width={600}
                height={400}
                layout="responsive" // Make image responsive
                objectFit="cover"
              />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#31511e] mb-6">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                Our mission is to bridge the gap between homeowners, buyers, and renters through technology-driven
                solutions that simplify the real estate process. We strive to be more than just a listing site; we are a
                community platform that supports informed decisions, fosters connections, and facilitates success in
                property transactions.
              </p>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#31511e] text-center mb-10 md:mb-12">Why Choose NESTHUB?</h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {/* Global Reach */}
            <div className="text-center p-4">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#e6f0e2] rounded-full shadow-md">
                <Globe className="w-10 h-10 text-[#31511e]" />
              </div>
              <h3 className="text-xl font-bold text-[#31511e] mb-3">Global Reach, Local Expertise</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                While we cater to an international audience, our roots and understanding of the Cambodian market set us
                apart. We offer expert insights and a localized approach that benefits both domestic and international
                clients.
              </p>
            </div>

            {/* User-Centric Design */}
            <div className="text-center p-4">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#e6f0e2] rounded-full shadow-md">
                <Users className="w-10 h-10 text-[#31511e]" />
              </div>
              <h3 className="text-xl font-bold text-[#31511e] mb-3">User-Centric Design</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                Our platform prioritizes ease of use, allowing users to filter searches, schedule property viewings, and
                access detailed property information with just a few clicks.
              </p>
            </div>

            {/* Security and Trust */}
            <div className="text-center p-4">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#e6f0e2] rounded-full shadow-md">
                <Shield className="w-10 h-10 text-[#31511e]" />
              </div>
              <h3 className="text-xl font-bold text-[#31511e] mb-3">Security and Trust</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                We vet and verify our property listings to ensure a safe and reliable experience, promoting trust
                between buyers, sellers, and renters.
              </p>
            </div>

            {/* Comprehensive Listings */}
            <div className="text-center p-4">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-[#e6f0e2] rounded-full shadow-md">
                <FileText className="w-10 h-10 text-[#31511e]" />
              </div>
              <h3 className="text-xl font-bold text-[#31511e] mb-3">Comprehensive Listings</h3>
              <p className="text-gray-700 leading-relaxed text-sm">
                From luxury homes to budget-friendly rentals, we provide a vast range of properties tailored to diverse
                preferences.
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}