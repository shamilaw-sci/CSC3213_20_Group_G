import { supabase } from '@/lib/supabase';
import ArtifactCatalog from './ArtifactCatalog';

export const metadata = {
  title: 'Crafts Shop | Kandyan Cultural Center',
  description: 'Purchase authentic Kandyan artifacts and traditional crafts.',
};

export interface CatalogItem {
  variant_id: string;
  artifact_id: string;
  product_name: string;
  category: string;
  color_name: string;
  price: number;
  discounted_price?: number;
  image_url: string;
  stock: number;
}

export const revalidate = 0; 

export default async function ShopPage() {
  const { data: catalogItems, error } = await supabase
    .from('catalog_view')
    .select('*');

  if (error) {
    console.error("Supabase Error:", error);
    return (
      <div className="flex h-screen items-center justify-center text-rose-600 font-bold bg-[#F8F9FA]">
        Error loading the shop. Please check your connection.
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#F8F9FA]">
      
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* --- MAIN SCROLLING CONTENT --- */}
      <div className="relative z-10 w-full pb-24">
        
        {/* Shop Hero Header (Glassmorphism) */}
        <section className="flex flex-col justify-center items-center px-4 md:px-12 pt-32 pb-16 top-0">
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] max-w-4xl w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-400/20 blur-[50px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4 flex items-center justify-center gap-4">
                <span className="w-12 h-px bg-amber-600"></span> Authentic Collection <span className="w-12 h-px bg-amber-600"></span>
              </h2>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
                The <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">Crafts Shop</span>
              </h1>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg font-light leading-relaxed">
                Support local artisans by bringing a piece of Kandyan heritage into your home. Each item is handcrafted using century-old techniques.
              </p>
            </div>
          </div>
        </section>

        {/* Catalog Section */}
        <div className="container mx-auto px-4 max-w-7xl">
          <ArtifactCatalog initialArtifacts={catalogItems || []} />
        </div>

      </div>
    </main>
  );
}