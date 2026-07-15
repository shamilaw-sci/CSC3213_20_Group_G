import Link from "next/link";
import { supabaseServer } from '@/lib/supabase';
import GallerySection from "./GallerySection";
import WorkshopPrice from "./WorkshopPrice";

type Props = {
  params: Promise<{ id: string | string[] }> | { id: string | string[] };
};

type Experience = {
  id: string;
  category: string;
  title: string;
  craftsman: string;
  image: string;
  gallery: string[];
  price: number;
  duration: string;
  description: string;
  about?: string;
  no_of_guests: number;
  highlights: string[];
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default async function WorkshopDetailsPage({ params }: Props) {
  const resolvedParams = (await params) as { id: string | string[] };
  const rawId = Array.isArray(resolvedParams.id) ? resolvedParams.id.join("/") : resolvedParams.id;
  const id = decodeURIComponent(String(rawId || "")).toLowerCase();

  const [{ data: experience, error }, { data: relatedWorkshops }] = await Promise.all([
    supabaseServer.from('workshops').select('*, artisans(id,name,guild,bio,avatar_url)').eq('id', id).single(),
    supabaseServer.from('workshops').select('*').neq('id', id).limit(3),
  ]);

  if (error || !experience) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center relative overflow-hidden">
        {/* --- FIXED BACKGROUND --- */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        {/* --- ERROR MESSAGE CARD --- */}
        <div className="relative z-10 max-w-md mx-auto px-6 text-center bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/80 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-600 mb-4">Workshop not found</p>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Sorry, that workshop does not exist.</h1>
          <Link href="/workshops" className="text-amber-600 font-bold hover:underline">Return to Workshops</Link>
        </div>
      </main>
    );
  }

  const categoryLabel = experience?.category
    ? String(experience.category).replace(/^[a-z]/, (c) => c.toUpperCase())
    : 'Wood Craft Workshop';

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 relative">
      {/* --- FIXED BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-28 pb-24">
        
        {/* --- GLOBAL TOP BACK BUTTON --- */}
        <div className="mb-8">
          <Link 
            href="/workshops" 
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-amber-600 transition-colors bg-white hover:bg-amber-50/50 px-5 py-2.5 rounded-xl border border-slate-200/60 shadow-sm group"
          >
            <svg 
              className="w-4 h-4 transform transition-transform group-hover:-translate-x-1" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Workshops
          </Link>
        </div>

        {/* --- 2 COLUMN GRID CONTENT --- */}
        <div className="grid gap-10 lg:grid-cols-[1.6fr_0.9fr]">
          
          {/* Main left column */}
          <div className="space-y-8">
            
            {/* Interactive gallery component */}
            <GallerySection 
              initialImage={experience.image}
              gallery={experience.gallery}
              title={experience.title}
            />

            {/* About Workshop */}
            <div className="rounded-[2.5rem] bg-white/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(31,38,135,0.04)] border border-white/80">
              <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">About this workshop</h2>
              <p className="text-slate-700 leading-relaxed font-normal whitespace-pre-line">{experience.about || experience.description}</p>
            </div>

            {/* What you'll learn */}
            <div className="rounded-[20px] bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-4 tracking-tight">What you'll learn</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {experience.highlights?.map((h: string) => (
                  <div key={h} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 shadow-sm flex items-start gap-3">
                    <span className="flex-shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">✓</span>
                    <p className="text-sm font-medium text-slate-700 pt-0.5">{h}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Workshop information grid */}
            <div className="rounded-[20px] bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold mb-4 tracking-tight">Workshop details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InfoCard label="Duration" value={experience.duration} />
                <InfoCard label="Skill level" value="Beginner" />
                <InfoCard label="Max participants" value={experience.no_of_guests} />
                <InfoCard label="Language" value="English / Sinhala" />
              </div>
            </div>

            {/* Related Workshops */}
            {relatedWorkshops && relatedWorkshops.length > 0 && (
              <div className="pt-8 border-t border-slate-200/60">
                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Related Experiences</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {relatedWorkshops.map((w: any) => (
                    <Link href={`/workshops/${w.id}`} key={w.id} className="group rounded-[2rem] bg-white/50 backdrop-blur-md p-3 border border-white/80 shadow-sm hover:shadow-[0_10px_30px_rgba(31,38,135,0.05)] transition-all flex flex-col">
                      <div className="overflow-hidden rounded-[1.5rem] bg-slate-50 mb-3 aspect-square">
                        <img src={w.image} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <div className="px-2 pb-2 flex flex-col flex-grow">
                        <h4 className="font-bold text-slate-900 text-sm mb-1 group-hover:text-amber-600 transition-colors line-clamp-2">{w.title}</h4>
                        <p className="text-xs font-bold text-slate-500 mt-auto pt-2"><WorkshopPrice price={w.price} /></p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar Right Side */}
          <aside className="lg:sticky lg:top-28 self-start w-full space-y-6">
            <div className="rounded-[2.5rem] bg-white/70 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(31,38,135,0.04)] border border-white/90">
              <div className="flex flex-col gap-4">
                
                <div className="pb-1">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/50 inline-block mb-2">
                    {categoryLabel}
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
                    {experience.title}
                  </h1>
                </div>

                <div className="pb-4 border-b border-slate-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Starting from</p>
                  <div className="text-3xl font-black text-slate-900 tracking-tight"><WorkshopPrice price={experience.price} /></div>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration</p>
                  <p className="font-bold text-slate-900 bg-white px-3 py-1 text-sm rounded-lg border border-slate-100 shadow-sm">{experience.duration}</p>
                </div>

                <Link 
                  href={`/workshops/checkout?workshop=${encodeURIComponent(experience.id)}`} 
                  className="w-full text-center rounded-[1.25rem] bg-amber-600 hover:bg-amber-500 px-4 py-3 text-white font-bold transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-0.5 text-base flex items-center justify-center gap-2"
                >
                  Book Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </Link>

                <div className="text-center flex items-center justify-center gap-2 mt-1">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p className="text-xs font-bold text-slate-500">Includes materials & instructor</p>
                </div>
              </div>
            </div>

            {/* Artisan Information Card */}
            <div className="rounded-[20px] bg-white/80 p-5 text-slate-800 shadow-sm border border-slate-100 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <img
                  src={experience.artisans?.avatar_url || '/default-workshop.jpg'}
                  alt={experience.artisans?.name || 'Artisan'}
                  className="h-12 w-12 rounded-full object-cover border-2 border-amber-400"
                />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Instructor</p>
                  <h3 className="text-sm font-bold text-slate-900">{experience.artisans?.name || 'Master artisan'}</h3>
                  <p className="text-xs text-slate-400">{experience.artisans?.guild || 'Traditional crafts guild'}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600 border-t border-slate-100 pt-3">
                {experience.artisans?.bio || 'A skilled artisan with years of experience guiding guests through an authentic hands-on cultural craft workshop.'}
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Mobile Sticky CTA Bar */}
      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-md px-6 py-4 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] flex flex-col items-center gap-3 text-center">
        {/* Centered Text Info */}
        <div className="w-full max-w-xs">
          <span className="block text-sm font-bold font-black text-slate-900 truncate tracking-tight">
            {experience.title}
          </span>
          <span className="block text-base font-bold text-amber-600 mt-0.5">
            <WorkshopPrice price={experience.price} />
          </span>
        </div>

        {/* Centered Full-Width Button */}
        <Link
          href={`/workshops/checkout?workshop=${encodeURIComponent(experience.id)}`}
          className="w-full inline-flex items-center justify-center rounded-2xl bg-amber-600 py-3.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(217,119,6,0.2)] transition-all active:scale-[0.98] active:bg-amber-700"
          aria-label="Book this workshop"
        >
          Book Now
        </Link>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[1.25rem] border border-slate-100 p-4 bg-slate-50/50 backdrop-blur-sm shadow-sm flex flex-col justify-center items-center text-center hover:bg-white transition-colors">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1.5">{label}</p>
      <p className="font-black text-slate-900 text-sm leading-tight">{value}</p>
    </div>
  );
}