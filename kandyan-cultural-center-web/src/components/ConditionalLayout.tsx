'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CartDrawer from "@/components/CartDrawer";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we are currently on the POS route
  const isPOS = pathname === '/pos' || pathname?.startsWith('/pos/');

  // If we are on the POS screen, ONLY render the children (no headers/footers)
  if (isPOS) {
    return <main className="flex-grow flex flex-col">{children}</main>;
  }

  // If we are anywhere else on the website, render the full UI for your team
  return (
    <>
      <Header />
      <CartDrawer />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <BackToTop />
    </>
  );
}