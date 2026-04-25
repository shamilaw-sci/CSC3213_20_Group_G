import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kandyan Culture Connect | KCC",
  description: "Modern Digital Transformation Suite for the Kandyan Art Association",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-50 text-stone-900 flex flex-col min-h-screen`}>
        <CartProvider>
        <Header />
        {/* Main content takes up the remaining vertical space */}
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <BackToTop />
        </CartProvider>
      </body>
    </html>
  );
}