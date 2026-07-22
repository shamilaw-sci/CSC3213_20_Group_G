'use client';

import Link from "next/link";
import { useCurrency } from '@/context/CurrencyContext';

type Workshop = {
  id: string;
  title: string;
  image?: string;
  artisans?: {
    id?: string;
    name?: string;
    guild?: string;
    bio?: string;
    avatar_url?: string;
  };
  price: number;
  duration?: string;
  description?: string;
  highlights?: string[];
};

export default function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const { formatPrice } = useCurrency();
  

  const artisanName = workshop.artisans?.name || 'KCC Master Artisan';

  return (
    <Link href={`/workshops/${workshop.id}`}>
      <div className="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-[1.25rem] sm:rounded-[1.5rem] overflow-hidden shadow-[0_6px_24px_rgba(31,38,135,0.05)] hover:shadow-[0_10px_30px_rgba(31,38,135,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer w-full h-full max-w-[280px] sm:max-w-[300px] mx-auto">
        
        {/* Image Container (4:3 Ratio) */}
        <div className="aspect-[4/3] w-full relative overflow-hidden bg-slate-50 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={workshop.image || workshop.artisans?.avatar_url || '/default-workshop.jpg'}
            alt={workshop.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 bg-amber-500 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm">
            Workshop
          </div>
        </div>

        {/* Glassmorphism Bottom Section */}
        <div className="p-5 sm:p-6 flex flex-col flex-grow bg-white/20 backdrop-blur-sm border-t border-white/40">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight group-hover:text-amber-600 transition-colors line-clamp-1">
            {workshop.title}
          </h2>
          
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            By {artisanName}
          </p>

          <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 font-medium line-clamp-2">
            {workshop.artisans?.bio }
          </p>

          {/* Spacer to push pricing and button to the bottom if descriptions vary in length */}
          <div className="flex-grow"></div>

          <div className="mt-4 mb-5 border-t border-white/50 pt-4 flex items-center justify-between">
            <span className="text-xl font-black text-slate-900">{formatPrice(workshop.price)}</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{workshop.duration || 'TBD'}</span>
          </div>

          <button className="w-full rounded-[1rem] bg-white/60 hover:bg-white border border-white/80 px-4 py-3 text-sm font-bold text-amber-600 transition-all shadow-sm flex items-center justify-center gap-2 group-hover:shadow-md group-hover:border-amber-300">
            View Details
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </div>
      </div>
    </Link>
  );
}