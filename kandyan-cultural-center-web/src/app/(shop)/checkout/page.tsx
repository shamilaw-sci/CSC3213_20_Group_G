'use client';

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity } = useCart();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Unified state for delivery form
  const [deliveryData, setDeliveryData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Sri Lanka",
    notes: ""
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => {
    const activePrice = item.discounted_price || item.price;
    return sum + activePrice * item.quantity;
  }, 0);
  
  const shipping = 0; 
  const total = subtotal + shipping;

  // Simple validation to ensure required fields are filled before paying
  const isFormValid = deliveryData.firstName && deliveryData.phone && deliveryData.address && deliveryData.city;

  // Load User Profile & Auto-fill what we know
  useEffect(() => {
    const loadCheckoutData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone')
        .eq('id', user.id)
        .single();

      const nameParts = (profile?.full_name || "Valued Customer").split(" ");
      const fName = nameParts[0];
      const lName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Customer";

      setDeliveryData(prev => ({
        ...prev,
        firstName: fName,
        lastName: lName,
        email: user.email || "",
        phone: profile?.phone || "", // Auto-fill phone from DB
      }));

      setIsLoading(false);
    };

    loadCheckoutData();
  }, [router]);

  // Handle Input Changes for the Form
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryData(prev => ({ ...prev, [name]: value }));
  };

  // Initiate PayHere Payment
  const handlePay = async () => {
    if (!isFormValid) return; // Prevent submission if bypassed
    setIsProcessing(true);
    
    try {
      const orderId = "ORDER_" + Date.now();

      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: total,
          orderId,
          firstName: deliveryData.firstName,
          lastName: deliveryData.lastName,
          email: deliveryData.email,
          phone: deliveryData.phone,
        }),
      });

      const data = await res.json();

      // Create a hidden form and submit to PayHere
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://sandbox.payhere.lk/pay/checkout";

      const fields = {
        merchant_id: data.merchantId,
        return_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/checkout`,
        notify_url: `${window.location.origin}/api/webhook`,
        order_id: data.orderId,
        items: "Kandyan Cultural Center Order",
        amount: data.amount,
        currency: "LKR",
        hash: data.hash,
        first_name: deliveryData.firstName,
        last_name: deliveryData.lastName,
        email: deliveryData.email,
        phone: deliveryData.phone,
        address: deliveryData.address,
        city: deliveryData.city,
        country: deliveryData.country,
        custom_1: deliveryData.notes, 
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

  // --- EMPTY CART STATE ---
  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-24 bg-stone-50">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm mb-6">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Your Cart is Empty</h1>
        <p className="text-slate-500 mb-8 max-w-md text-center">Looks like you haven't added any authentic Kandyan artifacts to your cart yet.</p>
        <Link href="/shop" className="bg-slate-900 hover:bg-kandyan-maroon text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1">
          Explore the Shop
        </Link>
      </div>
    );
  }

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-kandyan-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-stone-50 min-h-screen py-8 lg:py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        
        <Link href="/shop" className="text-slate-400 hover:text-kandyan-maroon transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest group mb-8">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Shop
        </Link>

        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-8 flex items-center gap-4">
          Checkout
          <span className="grow h-px bg-slate-200 ml-4 hidden sm:block"></span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Delivery Form & Cart Items */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Editable Shipping Details Form */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-kandyan-gold border border-slate-100 text-sm">1</span>
                Shipping Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Contact Info (Pre-filled but editable) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">First Name</label>
                  <input type="text" name="firstName" value={deliveryData.firstName} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Last Name</label>
                  <input type="text" name="lastName" value={deliveryData.lastName} onChange={handleInputChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-all" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mobile Number</label>
                  <input type="tel" name="phone" value={deliveryData.phone} onChange={handleInputChange} required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-all" />
                </div>

                {/* Address Info (User must fill this out) */}
                <div className="space-y-2 sm:col-span-2 mt-4 border-t border-slate-100 pt-6">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Street Address *</label>
                  <input type="text" name="address" value={deliveryData.address} onChange={handleInputChange} required placeholder="123 Temple Road, Apt 4" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">City *</label>
                  <input type="text" name="city" value={deliveryData.city} onChange={handleInputChange} required placeholder="Kandy" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Country</label>
                  <input type="text" disabled value="Sri Lanka" className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed" />
                </div>

                {/* Notes */}
                <div className="space-y-2 sm:col-span-2 mt-4 border-t border-slate-100 pt-6">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Driver Notes (Optional)</label>
                  <textarea name="notes" value={deliveryData.notes} onChange={handleInputChange} placeholder="e.g. Leave at the front desk, ring doorbell..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-kandyan-gold focus:ring-1 focus:ring-kandyan-gold transition-all resize-none h-20" />
                </div>
              </div>
            </div>

            {/* 2. Review Items Card */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-kandyan-gold border border-slate-100 text-sm">2</span>
                Review Your Items
              </h2>
              
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 sm:gap-6 group relative bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    
                    {/* Item Image */}
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-50 shrink-0">
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex flex-col flex-grow justify-between">
                      <div className="pr-8">
                        <h3 className="text-sm sm:text-lg font-bold text-slate-900 line-clamp-2">{item.name}</h3>
                        <p className="text-xs sm:text-sm font-black text-kandyan-gold mt-1">
                          LKR {(item.discounted_price || item.price).toLocaleString()}
                        </p>
                      </div>
                      
                      {/* Interactive Quantity Selector */}
                      <div className="flex items-center mt-3 border border-slate-200 rounded-lg w-fit bg-slate-50 overflow-hidden shadow-sm">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-3 py-1 sm:py-1.5 text-slate-500 hover:bg-white hover:text-slate-900 transition-colors font-bold">−</button>
                        <span className="px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-black text-slate-900 min-w-[2.5rem] text-center border-x border-slate-200 bg-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1 sm:py-1.5 text-slate-500 hover:bg-white hover:text-slate-900 transition-colors font-bold">+</button>
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button onClick={() => removeFromCart(item.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 transition-colors p-1.5 bg-white rounded-full sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100" aria-label="Remove item">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Order Summary & Payment */}
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-slate-950 text-white rounded-[2rem] p-6 sm:p-8 shadow-2xl shadow-slate-900/20 border border-slate-800">
              <h2 className="text-xl font-bold mb-6 pb-6 border-b border-white/10">Order Summary</h2>
              
              <div className="space-y-4 mb-8 text-slate-300 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-bold text-white">LKR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping & Delivery</span>
                  <span className="font-bold text-emerald-400">Free Shipping</span>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 mb-8 flex justify-between items-end">
                <div>
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount</span>
                  <span className="text-xs text-slate-500">Including VAT</span>
                </div>
                <span className="text-3xl font-black text-kandyan-gold">
                  LKR {total.toLocaleString()}
                </span>
              </div>

              {/* Dynamic Button (Disabled if form is empty) */}
              <button
                onClick={handlePay}
                disabled={isProcessing || !isFormValid} 
                className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-3 ${
                  isProcessing || !isFormValid
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-kandyan-gold hover:bg-amber-400 text-slate-950 shadow-lg hover:-translate-y-1'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Confirm & Pay
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                )}
              </button>
              
              {!isFormValid && (
                <p className="text-rose-400 text-xs text-center mt-4 font-medium animate-pulse">
                  Please fill in your Street Address and City to continue.
                </p>
              )}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500 font-medium">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Secured by PayHere Sri Lanka
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}