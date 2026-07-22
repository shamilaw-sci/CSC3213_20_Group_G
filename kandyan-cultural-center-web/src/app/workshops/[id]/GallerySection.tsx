"use client";

import { useState } from "react";

type GalleryProps = {
  initialImage: string;
  gallery: string[];
  title: string;
};

export default function GallerySection({ initialImage, gallery, title }: GalleryProps) {
  // Use client state now that we are safely inside a "use client" file
  const [activeImage, setActiveImage] = useState(gallery?.[0] ?? initialImage);

  return (
    <div className="rounded-[24px] bg-white p-4 shadow-sm border border-slate-100/80">
      <div className="overflow-hidden rounded-[18px] bg-slate-100 relative">
        <img 
          src={activeImage} 
          alt={title} 
          className="w-full h-[28rem] md:h-[34rem] object-cover rounded-[18px] transition-all duration-300" 
        />
      </div>

      {/* Thumbnails display block */}
      {gallery && gallery.length > 0 && (
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
          {gallery.map((img, index) => (
            <button 
              key={img} 
              type="button"
              onClick={() => setActiveImage(img)}
              className={`overflow-hidden rounded-[12px] border-2 aspect-square transition-all cursor-pointer bg-slate-50 ${
                activeImage === img ? 'border-amber-500' : 'border-transparent hover:border-amber-400'
              }`}
            >
              <img 
                src={img} 
                alt={`view-${index + 1}`} 
                className="w-full h-full object-cover pointer-events-none transform transition-transform duration-300 hover:scale-110" 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}