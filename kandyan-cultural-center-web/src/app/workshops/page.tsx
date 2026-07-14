import { supabaseServer } from '@/lib/supabase';
import WorkshopCard from './components/WorkshopCard';

export const metadata = {
  title: 'Crafts Workshops | Kandyan Cultural Center',
  description: 'Learn, Create and Experience authentic Kandyan artifacts and traditional crafts.',
};

export default async function WorkshopsPage() {
  const { data: workshops, error } = await supabaseServer.from('workshops').select('*, artisans(id,name,guild,bio,avatar_url)').order('title');

  if (error || !workshops || workshops.length === 0) {
    return (
      <main className="relative min-h-screen flex items-center justify-center bg-[#F8F9FA]">
          {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        </div>

        {/* --- MAIN SCROLLING CONTENT --- */}
        <div className="relative z-10 w-full pb-24"></div>
        <div className="mx-auto max-w-xl px-6 text-center relative z-10 bg-white/60 backdrop-blur-xl border border-white/80 p-12 rounded-[3rem] shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-600 mb-4">Workshops unavailable</p>
          <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Unable to load workshops right now.</h1>
          <p className="text-slate-500 font-medium">Please try again later.</p>
        </div>
      </main>
    );
  }

  const workshop = workshops[0];

  return (
    <main className="min-h-screen bg-slate-50">
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* --- MAIN SCROLLING CONTENT --- */}
      <section className="flex flex-col justify-center items-center px-4 md:px-12 pt-24 pb-16 top-0">
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] max-w-6xl w-full text-center relative overflow-hidden ">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-amber-400/12 blur-[40px] rounded-full pointer-events-none"></div>
          <div className="relative z-10 ">
            <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4 flex items-center justify-center gap-4">
              <span className="w-10 h-px bg-amber-600"></span> Workshops <span className="w-10 h-px bg-amber-600"></span>
            </h2>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">Create, Learn & Experience</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg font-light leading-relaxed">{'Join a focused session led by an experienced instructor — book your spot with one simple flow.'}</p>
          </div>
        </div>
      </section>
        {/* Featured Workshop Card */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 pb-20">
          <div className="w-full sm:max-w-md">
            <WorkshopCard workshop={workshop} />
          </div>
        </section>
    </main>
  );
}