"use client";

import { useState } from 'react';
import Image from 'next/image';
import Button from '@/components/Button';
import { useCart } from '@/context/CartContext';

export default function ProductInteractive({ artifact }: { artifact: any }) {
  const allImages = [artifact.image_url, ...(artifact.gallery_images || [])].filter(Boolean);
  const { addToCart } = useCart();
  const [mainImage, setMainImage] = useState(allImages[0]);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const increment = () => setQuantity(prev => (prev < artifact.stock ? prev + 1 : prev));
  const decrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const hasDiscount = artifact.discounted_price && artifact.discounted_price < artifact.price;

  // SEO Friendly Share Function
  const handleShare = async () => {
    const shareData = {
      title: `${artifact.name} | Kandyan Cultural Center`,
      text: `Check out this authentic ${artifact.name} handcrafted in Sri Lanka!`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback for desktop browsers
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Add to Cart Handler
  const handleAddToCart = () => {
  addToCart({
    id: artifact.id,
    name: artifact.name,
    price: hasDiscount ? artifact.discounted_price : artifact.price,
    image_url: artifact.image_url,
    quantity: quantity
  });
};

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-6">
      
      {/* LEFT COLUMN: Image Gallery */}
      <div className="flex flex-col gap-4">
        <div className="bg-slate-100 rounded-2xl h-[500px] lg:h-[600px] relative overflow-hidden shadow-lg border border-slate-200">
          <Image src={mainImage} alt={artifact.name} fill className="object-cover" />
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
          {allImages.slice(0, 5).map((img, index) => (
            <button 
              key={index} 
              onClick={() => setMainImage(img)}
              className={`relative w-24 h-24 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                mainImage === img 
                  ? 'border-kandyan-gold scale-105 shadow-md' 
                  : 'border-transparent hover:border-slate-300 hover:scale-105'
              }`}
            >
              <Image src={img} alt={`Gallery image ${index + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Details & Actions */}
      <div className="flex flex-col justify-start">
        
        {/* Title & Share Button */}
        <div className="flex justify-between items-start gap-4 mb-2">
          <h1 className="text-4xl font-bold text-slate-900">{artifact.name}</h1>
          <button 
            onClick={handleShare}
            className="flex flex-col items-center justify-center text-slate-400 hover:text-kandyan-gold transition-colors p-2 shrink-0 group relative"
            title="Share this artifact"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
            <span className="text-[10px] font-bold uppercase tracking-wider">{copied ? 'Copied!' : 'Share'}</span>
          </button>
        </div>
        
        {/* Pricing Logic */}
        <div className="flex items-end gap-4 mb-6">
          {hasDiscount ? (
            <>
              <p className="text-3xl text-kandyan-gold font-bold">LKR {artifact.discounted_price.toLocaleString()}</p>
              <p className="text-xl text-slate-400 line-through mb-1">LKR {artifact.price.toLocaleString()}</p>
            </>
          ) : (
            <p className="text-3xl text-kandyan-gold font-bold">LKR {artifact.price.toLocaleString()}</p>
          )}
        </div>

        {/* Stock Indicator */}
        <div className="mb-6">
          {artifact.stock > 10 ? (
            <span className="text-green-700 font-medium bg-green-50 px-3 py-1.5 rounded-full text-sm border border-green-200 shadow-sm">✓ {artifact.stock} in stock</span>
          ) : artifact.stock > 0 ? (
            <span className="text-kandyan-maroon font-bold bg-rose-50 px-3 py-1.5 rounded-full text-sm border border-rose-200 shadow-sm">⏳ Only {artifact.stock} left in stock!</span>
          ) : (
            <span className="text-slate-500 font-medium bg-slate-100 px-3 py-1.5 rounded-full text-sm border border-slate-200 shadow-sm">❌ Out of stock</span>
          )}
        </div>
        
        {/* Description */}
        <p className="text-slate-600 mb-8 leading-relaxed text-lg">
          {artifact.description}
        </p>

        {/* --- NEW: ARTIST PLACEHOLDER DIV --- */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-4 mb-8 hover:border-kandyan-gold transition-colors cursor-pointer group">
          <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm shrink-0">
            {/* Fallback Avatar SVG */}
            <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
          </div>
          <div>
            <p className="text-xs font-bold text-kandyan-maroon uppercase tracking-widest mb-1">The Artisan</p>
            <h4 className="text-slate-900 font-bold group-hover:text-kandyan-gold transition-colors">{artifact.artisan || "Master Craftsman"}</h4>
            <p className="text-sm text-slate-500">Kandyan Heritage Guild</p>
          </div>
        </div>

        {/* Quantity & Actions */}
        {artifact.stock > 0 && (
          <div className="flex flex-col gap-6 mb-10">
            <div className="flex items-center gap-4">
              <span className="text-slate-700 font-bold">Quantity:</span>
              <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden shadow-sm bg-white">
                <button onClick={decrement} className="px-5 py-3 bg-slate-50 hover:bg-slate-100 hover:text-kandyan-maroon text-slate-600 transition-colors cursor-pointer font-bold">−</button>
                <span className="px-4 py-2 font-black text-slate-900 w-14 text-center">{quantity}</span>
                <button onClick={increment} className="px-5 py-3 bg-slate-50 hover:bg-slate-100 hover:text-kandyan-gold text-slate-600 transition-colors cursor-pointer font-bold">+</button>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" className="grow" onClick={handleAddToCart}>Add to Cart</Button>
              <Button variant="primary" className="grow">Buy Now</Button>
            </div>
          </div>
        )}

        {/* --- NEW: ADDITIONAL INFORMATION TABS/GRID --- */}
        <div className="space-y-6 pt-8 border-t border-slate-200">
          <h3 className="text-xl font-bold text-slate-900">Specifications</h3>
          
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="flex flex-col border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-medium mb-1">Category</span>
              <span className="font-bold text-slate-900">{artifact.category}</span>
            </div>
            <div className="flex flex-col border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-medium mb-1">Material</span>
              <span className="font-bold text-slate-900">{artifact.material}</span>
            </div>
            <div className="flex flex-col border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-medium mb-1">Weight</span>
              <span className="font-bold text-slate-900">{artifact.weight || 'N/A'}</span>
            </div>
            <div className="flex flex-col border-b border-slate-100 pb-2">
              <span className="text-slate-400 font-medium mb-1">Dimensions</span>
              <span className="font-bold text-slate-900">{artifact.dimensions || 'N/A'}</span>
            </div>
          </div>

          {artifact.colors && artifact.colors.length > 0 && (
            <div className="pt-2">
              <span className="text-slate-400 font-medium text-sm block mb-2">Available Colors / Tones</span>
              <div className="flex gap-2">
                {artifact.colors.map((color: string, i: number) => (
                  <span key={i} className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200">
                    {color}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* --- NEW: HISTORICAL SIGNIFICANCE --- */}
        {artifact.historical_info && (
          <div className="mt-8 bg-amber-50/50 rounded-2xl p-6 border border-amber-100/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-kandyan-gold/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
            <h3 className="text-sm font-bold text-kandyan-gold uppercase tracking-widest mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
              Historical Significance
            </h3>
            <p className="text-slate-700 text-sm leading-relaxed relative z-10">
              {artifact.historical_info}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}