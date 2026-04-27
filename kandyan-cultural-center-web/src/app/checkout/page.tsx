'use client';

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import Image from "next/image";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, removeFromCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  // You can add logic for shipping later, setting to 0 for now
  const shipping = 0; 
  const total = subtotal + shipping;

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      const orderId = "ORDER_" + Date.now();

      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          orderId,
          firstName: "Test", // Ideally, this comes from a form or auth state
          lastName: "User",
          email: "test@example.com",
          phone: "0771234567",
        }),
      });

      const data = await res.json();

      // Create a hidden form and submit to PayHere
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      const fields = {
        merchant_id: data.merchantId,
        return_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/checkout",
        notify_url: "http://localhost:3000/api/webhook",
        order_id: data.orderId,
        items: "KCC Artifacts",
        amount: data.amount,
        currency: "LKR",
        hash: data.hash,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        address: "No.1, Kandy Road",
        city: "Kandy",
        country: "Sri Lanka",
      };

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value as string;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      console.error("Payment initiation failed:", error);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-24 bg-kandyan-bg">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-6">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Your Cart is Empty</h1>
        <p className="text-slate-500 mb-8 max-w-md text-center">Looks like you haven't added any authentic Kandyan artifacts to your cart yet.</p>
        <Link href="/shop" className="bg-kandyan-maroon hover:bg-rose-800 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
          Explore the Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-kandyan-bg min-h-screen py-12 lg:py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-10 flex items-center gap-4">
          Checkout & Order Summary
          <span className="grow h-px bg-slate-200 ml-4 hidden sm:block"></span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT COLUMN: Cart Items */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-kandyan-soft border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-6 border-b border-slate-100">Review Your Items</h2>
              
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 sm:gap-6 group relative bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {/* Item Image */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white shrink-0 shadow-sm">
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex flex-col flex-grow justify-center">
                      <h3 className="text-lg font-bold text-slate-900 line-clamp-2">{item.name}</h3>
                      <p className="text-slate-500 mt-1">Quantity: <span className="font-bold text-slate-700">{item.quantity}</span></p>
                      
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <p className="text-xl font-black text-kandyan-gold">
                          LKR {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 transition-colors p-2 bg-white rounded-full shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label="Remove item"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Payment */}
          <div className="lg:col-span-5 sticky top-28">
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-kandyan-hover border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 pb-6 border-b border-slate-100">Order Summary</h2>
              
              <div className="space-y-4 mb-8 text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-bold text-slate-900">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Delivery</span>
                  <span className="font-bold text-slate-900">Calculated below</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-6 mb-8 flex justify-between items-end">
                <div>
                  <span className="block text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</span>
                  <span className="text-sm text-slate-500">Including VAT</span>
                </div>
                <span className="text-3xl font-black text-slate-900">
                  LKR {total.toLocaleString()}
                </span>
              </div>

              <button
                onClick={handlePay}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${
                  isProcessing 
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-kandyan-gold to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment Gateway
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                )}
              </button>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400 font-medium">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Secure payment powered by PayHere
              </div>
            </div>
          </div>

        </div>
      </div>
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      const items = JSON.parse(stored);
      setCartItems(items);
      const total = items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(total);
    }
  }, []);

  const handlePay = async () => {
    const orderId = "ORDER_" + Date.now();

    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: subtotal,
        orderId,
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "0771234567",
      }),
    });

    const data = await res.json();

    // Create a hidden form and submit to PayHere
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://sandbox.payhere.lk/pay/checkout";

    const fields = {
      merchant_id: data.merchantId,
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/checkout",
      notify_url: "http://localhost:3000/api/webhook",
      order_id: data.orderId,
      items: "KCC Artifacts",
      amount: data.amount,
      currency: "LKR",
      hash: data.hash,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      address: "No.1, Kandy Road",
      city: "Kandy",
      country: "Sri Lanka",
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value as string;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Order Summary</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty!</p>
      ) : (
        <>
          {cartItems.map((item: any) => (
            <div key={item.artifact_id} className="flex justify-between mb-3">
              <span>{item.name} × {item.quantity}</span>
              <span>LKR {item.price * item.quantity}</span>
            </div>
          ))}

          <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>LKR {subtotal}</span>
          </div>

          <button
            onClick={handlePay}
            className="mt-8 w-full bg-black text-white py-3 rounded-lg text-lg"
          >
            Pay Now
          </button>
        </>
      )}
    </div>
  );
}