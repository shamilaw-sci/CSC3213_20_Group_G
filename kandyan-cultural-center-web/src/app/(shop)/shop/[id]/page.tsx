import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ProductInteractive from './ProductInteractive'; 

export default async function ArtifactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Fetch the main artifact WITH the joined artisan data
  const { data: artifact, error } = await supabase
    .from('artifacts')
    .select('*, artisans(*)')
    .eq('id', id)
    .single();

  if (error || !artifact) notFound();

  // 2. Fetch Related Artifacts
  const { data: relatedArtifacts } = await supabase
    .from('artifacts')
    .select('*')
    .eq('category', artifact.category)
    .neq('id', artifact.id)
    .limit(4);

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <Link href="/shop" className="text-kandyan-maroon hover:text-rose-800 font-bold mb-8 inline-flex items-center gap-2 transition-colors group">
        <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Catalog
      </Link>

      {/* Top Half: Interactive Product Details */}
      <ProductInteractive artifact={artifact} />

      {/* DELIVERY & PAYMENT OPTIONS SECTION */}
      <div className="mt-24 mb-16 pt-16 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-kandyan-gold border border-slate-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
            </span>
            Delivery Options
          </h3>
          <div className="space-y-5">
            <div>
              <h4 className="font-bold text-slate-900">Pick Me Flash</h4>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">If you are in the Colombo district, you can receive your package within two hours by sending us a Pickme Flash.</p>
            </div>
            <div className="w-full h-px bg-slate-100"></div>
            <div>
              <h4 className="font-bold text-slate-900">Normal Delivery</h4>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">With this service, you can receive your package island-wide within two to four business days.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-shadow">
          <h3 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-kandyan-maroon border border-slate-100">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
            </span>
            Payment Options
          </h3>
          <div className="space-y-5">
            <div>
              <h4 className="font-bold text-slate-900">Card Payment</h4>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">You can purchase your item securely through our portal using any VISA, Mastercard, or AMEX bank card.</p>
            </div>
            <div className="w-full h-px bg-slate-100"></div>
            <div>
              <h4 className="font-bold text-slate-900">Bank Transfer</h4>
              <p className="text-sm text-slate-500 mt-1 leading-relaxed">You can purchase any item by crediting money directly to our bank account via online banking or your nearest branch.</p>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: Related Artifacts */}
      {relatedArtifacts && relatedArtifacts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-4">
            You May Also Like
            <span className="grow h-px bg-slate-200 ml-4"></span>
          </h2>
          
          {/* UPDATED: Mobile Horizontal Snap Carousel, Desktop Grid */}
          <div className="flex overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pb-6 sm:pb-0 snap-x snap-mandatory no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {relatedArtifacts.map((item) => (
              <Link 
                href={`/shop/${item.id}`} 
                key={item.id} 
                className="group min-w-[260px] sm:min-w-0 snap-start bg-white rounded-2xl p-3 border border-slate-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="bg-slate-50 rounded-xl h-56 relative overflow-hidden mb-4">
                  <Image 
                    src={item.image_url} 
                    alt={item.name} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  {item.discounted_price && item.discounted_price < item.price && (
                    <span className="absolute top-2 left-2 bg-kandyan-maroon text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest shadow-sm">
                      Sale
                    </span>
                  )}
                </div>
                <div className="px-2 pb-2">
                  <h3 className="font-bold text-slate-900 group-hover:text-kandyan-gold transition-colors line-clamp-1">{item.name}</h3>
                  <p className="text-slate-500 font-bold mt-1">
                    LKR {item.discounted_price ? item.discounted_price.toLocaleString() : item.price.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}