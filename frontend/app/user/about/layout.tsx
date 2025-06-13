// app/about/layout.tsx (Recommended path for a specific layout)
// OR lib/layouts/AboutLayout.tsx (if you prefer a centralized layouts folder)
import Link from "next/link";
// Import your actual Header and Footer components
import Header from "@/component/user/header";
import Footer from "@/component/user/footer";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header /> {/* Your actual Header component */}

      {/* Main Content Area where the child page (AboutUsPage) will be rendered */}
      {/* Set the background of the main content to match the desired page background */}
      <main className="flex-grow bg-[#fcf9f9]"> {/* Added background here */}
        {children}
      </main>

      <Footer /> {/* Your actual Footer component */}
    </div>
  );
}