import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CartDrawer from "@/components/CartDrawer";

export default function ShopGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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