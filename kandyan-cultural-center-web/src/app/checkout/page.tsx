'use client';

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity } = useCart();
  const { currency, formatPrice } = useCurrency();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Logistics States
  const [shippingFee, setShippingFee] = useState(500); 
  const [carrierInfo, setCarrierInfo] = useState("Local Courier");

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

  // Financial Calculators
  const subtotal = cart.reduce((sum, item) => {
    const activePrice = item.discounted_price || item.price;
    return sum + activePrice * item.quantity;
  }, 0);
  
  const processingFee = Math.ceil((subtotal + shippingFee) * 0.033);
  const total = subtotal + shippingFee + processingFee;

  const isFormValid = deliveryData.firstName && deliveryData.phone && deliveryData.address && deliveryData.city && deliveryData.country;

  useEffect(() => {
    const loadCheckoutData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

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
        phone: profile?.phone || "",
      }));

      setIsLoading(false);
    };

    loadCheckoutData();
  }, [router]);

  useEffect(() => {
    if (!deliveryData.country || cart.length === 0) return;

    const recalculateLogistics = async () => {
      setIsCalculatingShipping(true);
      try {
        const response = await fetch('/api/shipping/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            country: deliveryData.country,
            city: deliveryData.city || 'Generic',
            cartItems: cart
          })
        });

        const data = await response.json();
        if (response.ok) {
          setShippingFee(data.shippingFee);
          setCarrierInfo(data.carrier);
        }
      } catch (err) {
        console.error("Failed calculating automated shipping fees:", err);
      } finally {
        setIsCalculatingShipping(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      recalculateLogistics();
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [deliveryData.country, deliveryData.city, cart]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDeliveryData(prev => ({ ...prev, [name]: value }));
  };

  const handlePay = async () => {
    if (!isFormValid || !userId) return;
    setIsProcessing(true);
    
    try {
      const fullShippingAddress = `${deliveryData.address}, ${deliveryData.city}, ${deliveryData.country}`;
      const finalAmountToChargeLKR = total.toFixed(2);

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileId: userId,
          totalAmount: finalAmountToChargeLKR,
          currency: 'LKR', 
          shippingAddress: fullShippingAddress,
          cartItems: cart
        })
      });

      const paymentConfig = await response.json();

      if (response.ok) {
        const form = document.createElement('form');
        form.method = 'POST';
        
        form.action = process.env.NEXT_PUBLIC_PAYHERE_ENV === 'live' 
          ? 'https://www.payhere.lk/pay/checkout' 
          : 'https://sandbox.payhere.lk/pay/checkout';

        const fields = {
          merchant_id: paymentConfig.merchantId,
          return_url: `https://kandyanculturalcentre.lk/success?order=${paymentConfig.orderId}`,
          cancel_url: `https://kandyanculturalcentre.lk/payment-cancelled`,
          notify_url: `https://kandyanculturalcentre.lk/api/payhere-notify`,
          order_id: paymentConfig.orderId,
          items: 'KCC Authentic Artifacts',
          currency: 'LKR',
          amount: paymentConfig.amount,
          first_name: deliveryData.firstName,
          last_name: deliveryData.lastName,
          email: deliveryData.email,
          phone: deliveryData.phone,
          address: deliveryData.address,
          city: deliveryData.city,
          country: deliveryData.country,
          hash: paymentConfig.hash,
          custom_1: deliveryData.notes 
        };

        Object.entries(fields).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      } else {
        alert(paymentConfig.error || 'Could not initialize gateway configuration.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Payment initiation failed:", err);
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (cart.length === 0 && !isLoading) {
    return (
      <main className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 py-24 bg-[#F8F9FA]">
        {/* Background */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        <div className="relative z-10 bg-white/60 backdrop-blur-xl border border-white/80 p-12 rounded-[3rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] text-center max-w-lg w-full flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-slate-300 shadow-sm border border-white/80 mb-6">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Your Cart is Empty</h1>
          <p className="text-slate-500 mb-8 font-medium">Looks like no authentic Kandyan artifacts have been added to the cart yet.</p>
          <Link href="/shop" className="bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-1">
            Explore the Shop
          </Link>
        </div>
      </main>
    );
  }

  // --- REUSABLE GLASS INPUT CLASS ---
  const glassInputClass = "w-full bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition-all shadow-sm placeholder:text-slate-400";

  return (
    <main className="relative min-h-screen pb-24 pt-28 bg-[#F8F9FA]">
      
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 max-w-7xl">
        
        <Link href="/shop" className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-white/80 text-slate-600 hover:text-amber-600 font-bold px-5 py-2.5 rounded-full mb-8 transition-all shadow-sm group hover:bg-white text-sm">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Shop
        </Link>

        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-10 flex items-center gap-6">
          Checkout
          <span className="grow h-px bg-white/60 ml-2 hidden sm:block"></span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT COLUMN: Forms & Items */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Shipping Details */}
            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 shadow-[0_10px_40px_rgba(31,38,135,0.05)] border border-white/80">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-4 mb-8">
                <span className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200/50 text-base shadow-sm">1</span>
                Shipping Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">First Name</label>
                  <input type="text" name="firstName" value={deliveryData.firstName} onChange={handleInputChange} required className={glassInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Last Name</label>
                  <input type="text" name="lastName" value={deliveryData.lastName} onChange={handleInputChange} className={glassInputClass} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Mobile Number</label>
                  <input type="tel" name="phone" value={deliveryData.phone} onChange={handleInputChange} required className={glassInputClass} />
                </div>

                <div className="space-y-2 sm:col-span-2 mt-4 border-t border-white/60 pt-6">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Street Address *</label>
                  <input type="text" name="address" value={deliveryData.address} onChange={handleInputChange} required placeholder="123 Temple Road, Apt 4" className={glassInputClass} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">City *</label>
                  <input type="text" name="city" value={deliveryData.city} onChange={handleInputChange} required placeholder="Kandy" className={glassInputClass} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Country *</label>
                  <select name="country" value={deliveryData.country} onChange={handleInputChange} className={`${glassInputClass} appearance-none pr-10`}>
                    <option value="Sri Lanka">Sri Lanka (Local)</option>
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="AU">Australia</option>
                    <option value="DE">Germany</option>
                    <option value="JP">Japan</option>
                    <option value="IN">India</option>
                    <option value="MV">Maldives</option>
                  </select>
                </div>

                <div className="space-y-2 sm:col-span-2 mt-4 border-t border-white/60 pt-6">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Driver Notes (Optional)</label>
                  <textarea name="notes" value={deliveryData.notes} onChange={handleInputChange} placeholder="e.g. Leave at the front desk, ring doorbell..." className={`${glassInputClass} resize-none h-24`} />
                </div>
              </div>
            </div>

            {/* 2. Review Items */}
            <div className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 shadow-[0_10px_40px_rgba(31,38,135,0.05)] border border-white/80">
              <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-4">
                <span className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200/50 text-base shadow-sm">2</span>
                Review Items
              </h2>
              <div className="space-y-5">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 sm:gap-6 group relative bg-white/50 backdrop-blur-sm p-4 rounded-3xl border border-white/80 shadow-sm hover:shadow-md transition-shadow">
                    
                    <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-50 shrink-0 border border-white">
                      <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                    </div>
                    
                    <div className="flex flex-col flex-grow justify-between py-1">
                      <div className="pr-8">
                        <h3 className="text-sm sm:text-lg font-bold text-slate-900 line-clamp-2">{item.name}</h3>
                        <p className="text-xs sm:text-sm font-black text-slate-600 mt-1">
                          {formatPrice(item.discounted_price || item.price)}
                        </p>
                      </div>
                      
                      <div className="flex items-center mt-3 border border-white/80 rounded-xl w-fit bg-white/60 overflow-hidden shadow-sm backdrop-blur-sm">
                        <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-3 py-1.5 sm:py-2 text-slate-500 hover:bg-white hover:text-amber-600 transition-colors font-extrabold">−</button>
                        <span className="px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-black text-slate-900 min-w-[2.5rem] text-center border-x border-white/60">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1.5 sm:py-2 text-slate-500 hover:bg-white hover:text-amber-600 transition-colors font-extrabold">+</button>
                      </div>
                    </div>

                    <button 
                      onClick={() => removeFromCart(item.id)} 
                      className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 transition-colors p-2 bg-white/80 backdrop-blur-sm rounded-full sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 shadow-sm border border-transparent hover:border-white"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(31,38,135,0.05)] border border-white/80">
              <h2 className="text-2xl font-black text-slate-900 mb-8 pb-6 border-b border-white/60">Order Summary</h2>
              
              <div className="space-y-5 mb-8 text-slate-600 text-sm font-medium">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.length} items)</span>
                  <span className="font-bold text-slate-900">{formatPrice(subtotal)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Logistics ({carrierInfo})</span>
                  {isCalculatingShipping ? (
                    <div className="w-4 h-4 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div>
                  ) : (
                    <span className="font-bold text-slate-900">{formatPrice(shippingFee)}</span>
                  )}
                </div>

                <div className="flex justify-between">
                  <span>Gateway handling fee (3.30%)</span>
                  <span className="font-bold text-slate-900">{formatPrice(processingFee)}</span>
                </div>
              </div>

              <div className="border-t border-white/60 pt-6 mb-8 flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Total Amount</span>
                  <span className="text-4xl font-black text-amber-600 tracking-tight">
                    {formatPrice(total)}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 text-right">Includes {currency} Conversion</span>
              </div>

              <button
                onClick={handlePay}
                disabled={isProcessing || !isFormValid || isCalculatingShipping} 
                className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 text-base ${
                  isProcessing || !isFormValid || isCalculatingShipping
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    : 'bg-amber-600 hover:bg-amber-500 text-white shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-1'
                }`}
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Secure Payment
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </>
                )}
              </button>
              
              {!isFormValid && (
                <p className="text-rose-500 text-xs text-center mt-4 font-bold animate-pulse">
                  Please fill in all required fields to continue.
                </p>
              )}

              <div className="mt-8 pt-6 border-t border-white/60 flex items-center justify-center gap-2 text-xs text-slate-400 font-extrabold uppercase tracking-widest">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Secured by PayHere Sri Lanka
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}