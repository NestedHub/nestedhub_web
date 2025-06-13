// components/Layout.tsx (example)
import React from 'react';
import Header from '@/component/user/header'; // Your Header component
import Footer from '@/component/user/footer'; // Your Footer component

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}