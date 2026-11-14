'use client';

import { usePathname } from 'next/navigation';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CartDrawer from "@/components/CartDrawer";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  

  const isHiddenRoute = pathname?.startsWith('/admin') || pathname?.startsWith('/pos');


  if (isHiddenRoute) {
    return <main className="flex-grow flex flex-col">{children}</main>;
  }


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