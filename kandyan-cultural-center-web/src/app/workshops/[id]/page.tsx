import Link from "next/link";
import { supabaseServer } from '@/lib/supabase';

type Props = {
  params: Promise<{ id: string | string[] }> | { id: string | string[] };
};

export default async function WorkshopDetailsPage({ params }: Props) {
  const resolvedParams = (await params) as { id: string | string[] };
  const rawId = Array.isArray(resolvedParams.id) ? resolvedParams.id.join("/") : resolvedParams.id;
  const id = decodeURIComponent(String(rawId || "")).toLowerCase();

  const [{ data: experience, error }, { data: relatedWorkshops }] = await Promise.all([
    supabaseServer.from('workshops').select('*').eq('id', id).single(),
    supabaseServer.from('workshops').select('*').neq('id', id).limit(3),
  ]);

  if (error || !experience) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 text-center bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/80 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-600 mb-4">Workshop not found</p>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Sorry, that workshop does not exist.</h1>
          <Link href="/workshops" className="text-amber-600 font-bold hover:underline">Return to Workshops</Link>
        </div>
      </main>
    );
  }

  const headerLabel = experience?.category
    ? String(experience.category).replace(/^[a-z]/, (c) => c.toUpperCase())
    : 'Experience';

  return (
    <main className="relative min-h-screen bg-[#F8F9FA] pb-24">
      
      {/* --- FIXED BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      <div className="relative z-10 w-full pt-28">
        
        {/* Navigation & Header */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
          <Link 
            href="/workshops" 
            className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-white/80 text-slate-600 hover:text-amber-600 font-bold px-5 py-2.5 rounded-full mb-8 transition-all shadow-sm group hover:bg-white text-sm"
          >
            <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to Workshops
          </Link>

          <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 md:p-12 rounded-[3rem] shadow-[0_15px_40px_rgba(31,38,135,0.05)] w-full">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black tracking-widest uppercase mb-6 shadow-sm border border-amber-200/50">
              {headerLabel}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-5 tracking-tight">{experience.title}</h1>
            <p className="max-w-3xl text-lg text-slate-600 font-medium leading-relaxed">{experience.description}</p>
          </div>
        </div>

        {/* Stepper (Glassmorphism Styled) */}
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-10">
          <ol className="flex items-center gap-3 sm:gap-6 text-xs sm:text-sm overflow-x-auto no-scrollbar pb-2">
            <li className="flex items-center gap-2 text-amber-600 shrink-0">
              <span className="h-7 w-7 flex items-center justify-center rounded-full bg-amber-500 text-white font-black shadow-[0_4px_10px_rgba(245,158,11,0.3)] border-2 border-white">1</span>
              <span className="font-bold uppercase tracking-wider">Workshop Details</span>
            </li>
            <li className="flex items-center gap-2 text-slate-400 shrink-0 opacity-60">
              <span className="h-7 w-7 flex items-center justify-center rounded-full border-2 border-white/80 bg-white/50 font-bold">2</span>
              <span className="font-bold uppercase tracking-wider">Booking</span>
            </li>
            <li className="flex items-center gap-2 text-slate-400 shrink-0 opacity-60">
              <span className="h-7 w-7 flex items-center justify-center rounded-full border-2 border-white/80 bg-white/50 font-bold">3</span>
              <span className="font-bold uppercase tracking-wider">Payment</span>
            </li>
            <li className="flex items-center gap-2 text-slate-400 shrink-0 opacity-60">
              <span className="h-7 w-7 flex items-center justify-center rounded-full border-2 border-white/80 bg-white/50 font-bold">4</span>
              <span className="font-bold uppercase tracking-wider">Confirmation</span>
            </li>
          </ol>
        </div>

        {/* Main Content Grid */}
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.6fr_0.9fr] items-start">
            
            {/* Main Column */}
            <div className="space-y-8">
              
              {/* Image Gallery */}
              <div className="rounded-[2.5rem] bg-white/50 backdrop-blur-md p-4 shadow-[0_10px_30px_rgba(31,38,135,0.05)] border border-white/80">
                <div className="overflow-hidden rounded-[2rem] bg-slate-50 border border-slate-100/50 shadow-inner">
                  <img src={experience.gallery?.[0] ?? experience.image} alt="featured" className="w-full h-[24rem] md:h-[32rem] object-cover transition-transform duration-700 hover:scale-105" />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {experience.gallery.slice(1, 5).map((img) => (
                    <div key={img} className="overflow-hidden rounded-2xl border border-white/80 shadow-sm bg-slate-50">
                      <img src={img} alt="thumb" className="w-full h-20 sm:h-28 object-cover transform transition-transform duration-500 hover:scale-110 cursor-pointer" />
                    </div>
                  ))}
                </div>
              </div>

              {/* About Workshop */}
              <div className="rounded-[2.5rem] bg-white/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(31,38,135,0.05)] border border-white/80">
                <h2 className="text-2xl font-black text-slate-900 mb-5 tracking-tight">About this workshop</h2>
                <p className="text-slate-700 leading-relaxed font-medium">{experience.about || experience.description}</p>
              </div>

              {/* Highlights */}
              <div className="rounded-[2.5rem] bg-white/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(31,38,135,0.05)] border border-white/80">
                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Highlights</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {experience.highlights.map((h) => (
                    <div key={h} className="flex items-start gap-4 p-4 rounded-[1.5rem] bg-white/50 border border-white shadow-sm hover:bg-white transition-colors">
                      <div className="flex items-center justify-center h-10 w-10 shrink-0 rounded-[14px] bg-amber-100 text-amber-600 border border-amber-200/50 shadow-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                      <div className="text-sm font-bold text-slate-700 mt-2">{h}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Workshop Information */}
              <div className="rounded-[2.5rem] bg-white/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(31,38,135,0.05)] border border-white/80">
                <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Workshop Information</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <InfoCard label="Duration" value={experience.duration} />
                  <InfoCard label="Skill level" value="Beginner" />
                  <InfoCard label="Max Size" value="8 People" />
                  <InfoCard label="Language" value="Eng / Sin" />
                </div>
                
                <div className="mt-6 pt-6 border-t border-white/60 flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-0.5">Craftsman</p>
                    <p className="text-sm font-black text-slate-900">{experience.craftsman}</p>
                  </div>
                </div>
              </div>

              {/* Related Workshops */}
              {relatedWorkshops && relatedWorkshops.length > 0 && (
                <div className="pt-8 border-t border-white/60">
                  <h3 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Related Experiences</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {relatedWorkshops.map((w) => (
                      <Link href={`/workshops/${w.id}`} key={w.id} className="group rounded-[2rem] bg-white/50 backdrop-blur-md p-3 border border-white/80 shadow-sm hover:shadow-[0_10px_30px_rgba(31,38,135,0.05)] transition-all flex flex-col">
                        <div className="overflow-hidden rounded-[1.5rem] bg-slate-50 mb-4 aspect-square">
                          <img src={w.image} alt={w.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                        <div className="px-2 pb-2 flex flex-col flex-grow">
                          <h4 className="font-extrabold text-slate-900 text-sm mb-1 group-hover:text-amber-600 transition-colors line-clamp-1">{w.title}</h4>
                          <p className="text-xs font-bold text-slate-500 mt-auto">LKR {w.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sticky Sidebar */}
            <aside className="lg:sticky lg:top-32 self-start w-full">
              <div className="rounded-[2.5rem] bg-white/70 backdrop-blur-2xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(31,38,135,0.05)] border border-white/80">
                <div className="flex flex-col gap-6">
                  
                  <div className="pb-6 border-b border-white/60">
                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Starting from</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tight">LKR {experience.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pb-6 border-b border-white/60">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration</p>
                    <p className="font-black text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-100 shadow-sm">{experience.duration}</p>
                  </div>

                  <Link 
                    href={`/workshops/checkout?workshop=${encodeURIComponent(experience.id)}`} 
                    className="w-full text-center rounded-[1.25rem] bg-amber-600 hover:bg-amber-500 px-6 py-4 text-white font-bold transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
                  >
                    Reserve Spot
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </Link>

                  <div className="text-center flex items-center justify-center gap-2 mt-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="text-xs font-bold text-slate-500">Includes materials & instructor</p>
                  </div>
                  
                </div>
              </div>
            </aside>
            
          </div>
        </section>
      </div>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/80 p-4 bg-white/50 backdrop-blur-sm shadow-sm flex flex-col justify-center items-center text-center hover:bg-white transition-colors">
      <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5">{label}</p>
      <p className="font-black text-slate-900 text-sm leading-tight">{value}</p>
    </div>
  );
}