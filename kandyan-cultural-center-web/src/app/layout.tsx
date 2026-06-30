import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import StoreLayout from "@/components/StoreLayout";
import { CurrencyProvider } from "@/context/CurrencyContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kandyan Culture Centre",
  description: 'Preserving and promoting the traditional Kandyan arts and culture of Sri Lanka.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-stone-50 text-stone-900 flex flex-col min-h-screen`}>
        <CurrencyProvider>
          <CartProvider>
            {/* We moved the Header, Footer, and Cart into this wrapper! */}
            <StoreLayout>
              {children}
            </StoreLayout>
          </CartProvider>
        </CurrencyProvider>
          
      </body>
    </html>
  );
}