import { supabase } from '@/lib/supabase';
import ArtifactCatalog from './ArtifactCatalog';

export const metadata = {
  title: 'Crafts Shop | Kandyan Culture Connect',
  description: 'Purchase authentic Kandyan artifacts and traditional crafts.',
};

export interface Artifact {
  id: string;
  name: string;
  price: number;
  stock: number;
  category: string;
  image_url: string;
  discounted_price?: number; // Added to match our recent database upgrade!
}

export default async function ShopPage() {
  const { data: artifacts, error } = await supabase
    .from('artifacts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center text-kandyan-maroon font-bold">
        Error loading the shop. Please check your connection.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-kandyan-bg">
      {/* Shop Hero Header */}
      <section className="bg-slate-950 py-20 relative overflow-hidden">
        {/* Soft maroon glow instead of generic rose */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-kandyan-maroon/20 rounded-full blur-[100px]"></div>
        <div className="container mx-auto px-6 max-w-7xl relative z-10">
          <h2 className="text-kandyan-gold font-bold tracking-widest uppercase text-sm mb-4 flex items-center gap-3">
            <span className="w-8 h-px bg-kandyan-gold"></span> Authentic Collection
          </h2>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            The <span className="text-kandyan-maroon">Crafts Shop</span>
          </h1>
          <p className="text-slate-400 mt-4 max-w-2xl text-lg font-light">
            Support local artisans by bringing a piece of Kandyan heritage into your home. Each item is handcrafted using century-old techniques.
          </p>
        </div>
      </section>

      {/* Catalog Section */}
      <div className="container mx-auto px-6 max-w-7xl py-16">
        <ArtifactCatalog initialArtifacts={artifacts || []} />
      </div>
    </main>
  );
}