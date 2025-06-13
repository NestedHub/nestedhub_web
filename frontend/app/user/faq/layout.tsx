// app/faq/layout.tsx
import Header from "@/component/user/header"; // Import your actual Header component
import Footer from "@/component/user/footer"; // Import your actual Footer component

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#fcf9f9]"> {/* Consistent background color */}
      <Header /> {/* Your actual Header component */}

      {/* Main content area where the FAQ page will be rendered */}
      {/* The background color of the main wrapper should be consistent */}
      <main className="flex-grow">
        {children}
      </main>

      <Footer /> {/* Your actual Footer component */}
    </div>
  );
}