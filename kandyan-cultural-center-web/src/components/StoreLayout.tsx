'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CartDrawer from "@/components/CartDrawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  // If we are in the admin panel, ONLY render the children (no header/footer)
  if (isAdminPage) {
    return <main className="flex-grow bg-slate-50">{children}</main>;
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