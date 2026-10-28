import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ProductInteractive from './ProductInteractive'; 

export default async function ArtifactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch parent artifact
  const { data: artifact, error } = await supabase
    .from('artifacts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !artifact) notFound();

  // 2. Fetch variants WITH their specific artisans joined
  const { data: variants } = await supabase
    .from('artifact_variants')
    .select('*, artisans(*)')
    .eq('artifact_id', id)
    .order('created_at', { ascending: true });

  // 3. Fetch Related Artifacts
  const { data: relatedArtifacts } = await supabase
    .from('catalog_view')
    .select('*')
    .eq('category', artifact.category)
    .neq('artifact_id', artifact.id) 
    .limit(4);

  return (
    <main className="relative w-full min-h-screen bg-[#F8F9FA]">
      
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 py-12 max-w-7xl pt-28">
        
        {/* Glassmorphic Back Button */}
        <Link 
          href="/shop" 
          className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-white/80 text-slate-600 hover:text-amber-600 font-bold px-5 py-2.5 rounded-full mb-8 transition-all shadow-sm group hover:bg-white"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Catalog
        </Link>

        {/* Pass data to Interactive Component */}
        <ProductInteractive artifact={artifact} variants={variants || []} />

        {/* STORE GUARANTEES & DELIVERY FEATURES (Glassmorphism) */}
        <div className="mt-24 mb-16 pt-16 border-t border-white/60 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          {/* 1. Quick Delivery */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/80 shadow-[0_8px_30px_rgba(31,38,135,0.04)] hover:shadow-[0_12px_40px_rgba(31,38,135,0.08)] hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
            <span className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 border border-amber-200/50 shadow-sm mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </span>
            <h4 className="font-extrabold text-slate-900 text-lg mb-2">Quick Delivery</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">Get your items fast with our express island-wide dispatch.</p>
          </div>

          {/* 2. Low Cost Shipping */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/80 shadow-[0_8px_30px_rgba(31,38,135,0.04)] hover:shadow-[0_12px_40px_rgba(31,38,135,0.08)] hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
            <span className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200/50 shadow-sm mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg>
            </span>
            <h4 className="font-extrabold text-slate-900 text-lg mb-2">Low Cost Delivery</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">Enjoy highly affordable, budget-friendly shipping rates to anywhere in Sri Lanka.</p>
          </div>

          {/* 3. Secure Payments */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/80 shadow-[0_8px_30px_rgba(31,38,135,0.04)] hover:shadow-[0_12px_40px_rgba(31,38,135,0.08)] hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
            <span className="w-14 h-14 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 border border-rose-200/50 shadow-sm mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </span>
            <h4 className="font-extrabold text-slate-900 text-lg mb-2">Secure Payments</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">100% safe and encrypted checkout with card payments.</p>
          </div>

          {/* 4. Authentic Crafts */}
          <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-white/80 shadow-[0_8px_30px_rgba(31,38,135,0.04)] hover:shadow-[0_12px_40px_rgba(31,38,135,0.08)] hover:-translate-y-1 transition-all flex flex-col items-center text-center group">
            <span className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 border border-indigo-200/50 shadow-sm mb-4 sm:mb-5 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
            </span>
            <h4 className="font-extrabold text-slate-900 text-lg mb-2">Authentic Handcrafts</h4>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">Directly supporting local Sri Lankan artisans with every cultural artifact purchased.</p>
          </div>

        </div>

        {/* BOTTOM SECTION: Related Artifacts (Matched to new Catalog Design) */}
        {relatedArtifacts && relatedArtifacts.length > 0 && (
          <div className="mt-16 pb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-10 flex items-center justify-center gap-6">
              <span className="hidden sm:block grow h-px bg-white/80 max-w-xs"></span>
              You May Also Like
              <span className="hidden sm:block grow h-px bg-white/80 max-w-xs"></span>
            </h2>
            
            {/* Same responsive grid as the shop page */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {relatedArtifacts.map((item) => (
                <Link 
                  href={`/shop/${item.artifact_id}?variant=${item.variant_id}`} 
                  key={item.variant_id} 
                  className="group bg-white/40 backdrop-blur-xl border border-white/60 rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden shadow-[0_8px_32px_rgba(31,38,135,0.05)] hover:shadow-[0_12px_40px_rgba(31,38,135,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-square w-full relative overflow-hidden bg-slate-50">
                    <Image 
                      src={item.image_url} 
                      alt={item.product_name} 
                      fill 
                      className="object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    {item.discounted_price && item.discounted_price < item.price && (
                      <span className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-rose-600 text-white text-[9px] sm:text-[10px] font-black px-2.5 py-1.5 rounded-md uppercase tracking-widest shadow-sm">
                        Sale
                      </span>
                    )}
                  </div>
                  
                  <div className="p-3 sm:p-5 flex flex-col flex-grow bg-white/20 backdrop-blur-sm border-t border-white/40">
                    <h3 className="text-sm sm:text-lg font-extrabold text-slate-900 mb-0.5 sm:mb-1 line-clamp-1 group-hover:text-amber-600 transition-colors">
                      {item.product_name}
                    </h3>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-500 mb-2 sm:mb-3">
                      {item.color_name}
                    </p>
                    <div className="mt-auto">
                      <span className="text-base sm:text-xl font-black text-slate-900">
                        LKR {item.discounted_price ? item.discounted_price.toLocaleString() : item.price.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}