// app/faq/page.tsx
// Removed Header and Footer imports as they are now handled by the layout
import Image from "next/image";
import { Heart, ChevronDown, Facebook, Instagram, Send } from "lucide-react"; // Import social icons

export default function FaqPage() {
  return (
    // Removed the outermost div's styling, as it's handled by the layout.
    // The max-w-4xl and px-6 py-12 from the original main tag will now be applied directly.
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10"> {/* Applied consistent padding and max-width */}
      <h1 className="text-3xl md:text-4xl font-bold text-[#31511e] mb-6 md:mb-8 text-center">FAQ – Frequently Asked Questions</h1>

      <h2 className="text-xl md:text-2xl font-bold text-[#31511e] mb-6">
        Frequently asked questions about the new website experience
      </h2>

      <div className="space-y-6 md:space-y-8"> {/* Increased spacing for readability */}
        {/* Q1 */}
        <div>
          <h3 className="text-lg md:text-xl font-bold text-[#31511e] mb-3">Q: What is NESTHUB?</h3>
          <p className="text-gray-700 leading-relaxed">
            <span className="font-bold">A:</span> NESTHUB is a comprehensive real estate platform based in Phnom Penh,
            Cambodia, that allows users to buy, sell, and rent properties worldwide. Our goal is to make property
            transactions simple, secure, and accessible to everyone.
          </p>
        </div>

        {/* Q2 */}
        <div>
          <h3 className="text-lg md:text-xl font-bold text-[#31511e] mb-3">Q: How do I create an account on NESTHUB?</h3>
          <p className="text-gray-700 leading-relaxed">
            <span className="font-bold">A:</span> Creating an account is easy! Simply click on the "Sign Up" button on
            the top right corner of our homepage, fill in your details, and start exploring.
          </p>
        </div>

        {/* Q3 */}
        <div>
          <h3 className="text-lg md:text-xl font-bold text-[#31511e] mb-3">Q: Is NESTHUB free to use?</h3>
          <p className="text-gray-700 leading-relaxed">
            <span className="font-bold">A:</span> Yes, creating an account and Browse properties is completely free.
            However, there may be fees associated with listing a property or using premium features.
          </p>
        </div>
      </div>

      <hr className="border-gray-300 my-10 md:my-12" /> {/* Consistent divider color and spacing */}
    </div>
  );
}