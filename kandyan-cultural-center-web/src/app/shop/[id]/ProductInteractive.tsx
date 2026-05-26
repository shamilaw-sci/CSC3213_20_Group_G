"use client";

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function ProductInteractive({ artifact }: { artifact: any }) {
  const router = useRouter();
  const { addToCart, setIsDrawerOpen } = useCart();
  
  // 1. SAFE IMAGE HANDLING: Ensure gallery is an array, prevent crashes
  const safeGallery = Array.isArray(artifact.gallery_images) ? artifact.gallery_images : [];
  const allImages = [artifact.image_url, ...safeGallery].filter(Boolean);
  
  const [mainImage, setMainImage] = useState(allImages[0]);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const increment = () => setQuantity(prev => (prev < artifact.stock ? prev + 1 : prev));
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const hasDiscount = artifact.discounted_price && artifact.discounted_price < artifact.price;

  // 2. ARTISAN DATA MAPPING
  const artisanName = artifact.artisans?.name || "Kandyan Heritage Craftsman";
  const artisanGuild = artifact.artisans?.guild || "Kandyan Heritage Guild";

  const handleShare = async () => {
    const shareData = {
      title: `${artifact.name} | Kandyan Cultural Center`,
      text: `Check out this authentic ${artifact.name} handcrafted in Sri Lanka!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) { console.log('Error sharing:', err); }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCart = () => {
    if (addToCart) addToCart({ ...artifact, quantity });
    if (setIsDrawerOpen) setIsDrawerOpen(true);
  };

  const handleBuyNow = async (e: React.MouseEvent, artifact: any) => {
  e.stopPropagation();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    // Redirect to login, but keep the intention
    router.push('/login'); 
    return;
  }

  // If logged in, go to delivery details
  addToCart({ ...artifact, quantity: 1 });
  router.push('/checkout');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">
      
      {/* LEFT COLUMN: Image Gallery */}
      <div className="flex flex-col gap-4">
        <div className="bg-slate-50 rounded-3xl h-[400px] lg:h-[600px] relative overflow-hidden shadow-sm border border-slate-100">
          <Image src={mainImage} alt={artifact.name} fill className="object-cover" />
        </div>
        
        {/* Only show thumbnails if there is more than 1 image */}
        {allImages.length > 1 && (
          <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
            {allImages.slice(0, 5).map((img, index) => (
              <button 
                key={index} 
                onClick={() => setMainImage(img)}
                className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  mainImage === img 
                    ? 'border-kandyan-gold scale-105 shadow-md' 
                    : 'border-transparent hover:border-slate-300'
                }`}
              >
                <Image src={img} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Details & Actions */}
      <div className="flex flex-col justify-start">
        
        {/* Title & Share Button */}
        <div className="flex justify-between items-start gap-4 mb-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">{artifact.name}</h1>
          <button 
            onClick={handleShare}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-kandyan-gold transition-colors p-2 shrink-0 group relative cursor-pointer"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
        
        {/* Pricing Logic */}
        <div className="flex items-end gap-4 mb-6">
          {hasDiscount ? (
            <>
              <p className="text-3xl text-kandyan-gold font-black">LKR {artifact.discounted_price.toLocaleString()}</p>
              <p className="text-xl text-slate-400 line-through mb-1 font-medium">LKR {artifact.price.toLocaleString()}</p>
            </>
          ) : (
            <p className="text-3xl text-kandyan-gold font-black">LKR {artifact.price.toLocaleString()}</p>
          )}
        </div>

        {/* Stock Indicator */}
        <div className="mb-6">
          {artifact.stock > 10 ? (
            <span className="text-green-700 font-bold bg-green-50 px-4 py-2 rounded-lg text-xs border border-green-200 uppercase tracking-widest shadow-sm">✓ {artifact.stock} in stock</span>
          ) : artifact.stock > 0 ? (
            <span className="text-kandyan-maroon font-bold bg-rose-50 px-4 py-2 rounded-lg text-xs border border-rose-200 uppercase tracking-widest shadow-sm">⏳ Only {artifact.stock} left!</span>
          ) : (
            <span className="text-slate-500 font-bold bg-slate-100 px-4 py-2 rounded-lg text-xs border border-slate-200 uppercase tracking-widest shadow-sm">❌ Out of stock</span>
          )}
        </div>
        
        <p className="text-slate-500 mb-8 leading-relaxed font-light text-lg">
          {artifact.description}
        </p>

        {/* --- ARTIST DIV (CONNECTED TO DB) --- */}
        <div className="bg-stone-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 mb-8 transition-colors group">
          <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center overflow-hidden border border-slate-200 shadow-sm shrink-0 text-kandyan-gold">
            {artifact.artisans?.avatar_url ? (
               <Image src={artifact.artisans.avatar_url} alt={artisanName} width={56} height={56} className="object-cover" />
            ) : (
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            )}
          </div>
          <div>
            <p className="text-[10px] font-bold text-kandyan-maroon uppercase tracking-widest mb-1">The Artisan</p>
            <h4 className="text-slate-900 font-bold">{artisanName}</h4>
            <p className="text-sm text-slate-500">{artisanGuild}</p>
          </div>
        </div>

        {/* Quantity & Actions */}
        {artifact.stock > 0 && (
          <div className="flex flex-col gap-6 mb-10">
            <div className="flex items-center gap-4">
              <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">Quantity</span>
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <button onClick={decrement} className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer font-bold transition-colors">−</button>
                <span className="px-4 py-2 font-black text-slate-900 w-14 text-center">{quantity}</span>
                <button onClick={increment} className="px-5 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 cursor-pointer font-bold transition-colors">+</button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* FIXED: Wrapped the handlers in anonymous functions (e) => */}
              <Button 
                variant="outline" 
                className="grow !py-3" 
                onClick={(e) => handleAddToCart()}
              >
                Add to Cart
              </Button>
              <Button 
                variant="primary" 
                className="grow !py-3" 
                onClick={(e) => handleBuyNow(e, artifact)}
              >
                Buy Now
              </Button>
            </div>
          </div>
        )}

        {/* Specifications */}
        <div className="space-y-6 pt-8 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Specifications</h3>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="flex flex-col pb-2">
              <span className="text-slate-400 font-medium mb-1">Category</span>
              <span className="font-bold text-slate-900">{artifact.category}</span>
            </div>
            <div className="flex flex-col pb-2">
              <span className="text-slate-400 font-medium mb-1">Material</span>
              <span className="font-bold text-slate-900">{artifact.material}</span>
            </div>
            {artifact.weight && (
              <div className="flex flex-col pb-2">
                <span className="text-slate-400 font-medium mb-1">Weight</span>
                <span className="font-bold text-slate-900">{artifact.weight}</span>
              </div>
            )}
            {artifact.dimensions && (
              <div className="flex flex-col pb-2">
                <span className="text-slate-400 font-medium mb-1">Dimensions</span>
                <span className="font-bold text-slate-900">{artifact.dimensions}</span>
              </div>
            )}
          </div>
        </div>

        {/* Historical Info */}
        {artifact.historical_info && (
          <div className="mt-8 bg-stone-50 rounded-2xl p-6 border border-slate-100 relative overflow-hidden">
            <h3 className="text-xs font-bold text-kandyan-gold uppercase tracking-widest mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              Historical Significance
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed font-light">
              {artifact.historical_info}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}