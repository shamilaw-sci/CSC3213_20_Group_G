'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CartDrawer from "@/components/CartDrawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Check if we are in the admin panel OR the POS system
  const isHiddenRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/pos');

  // If we are on a hidden route, ONLY render the children (no header/footer)
  if (isHiddenRoute) {
    return <main className="flex-grow flex flex-col">{children}</main>;
  }

  // If we are on the public storefront, render everything
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