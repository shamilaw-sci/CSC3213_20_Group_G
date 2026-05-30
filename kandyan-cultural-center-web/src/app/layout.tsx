import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kandyan Culture Connect | KCC",
  description: "Modern Digital Transformation Suite for the Kandyan Art Association",
  manifest: "/manifest.json",
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
          {/* We removed the layout frames here so they don't bleed into the POS */}
          {children}
        </CartProvider>
      </body>
    </html>
  );
}