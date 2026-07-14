import Link from "next/link";
import { supabaseServer } from '@/lib/supabase';

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
      <main className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* --- MAIN SCROLLING CONTENT --- */}
      <div className="relative z-10 w-full pb-24"></div>
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
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      {/* --- MAIN SCROLLING CONTENT --- */}
      <div className="relative z-10">
      
      {/* Hero / Image banner */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-16 relative z-10">
          <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] max-w-6xl w-full text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-amber-400/20 blur-[50px] rounded-full pointer-events-none"></div>
            <div className="relative z-10">
              <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4 flex items-center justify-center gap-4">
                <span className="w-12 h-px bg-amber-600"></span> {headerLabel} <span className="w-12 h-px bg-amber-600"></span>
              </h2>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">{experience.title}</span>
              </h1>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg font-light leading-relaxed">{experience.description}</p>
            </div>
          </div>
        </div>

        

      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_0.9fr]">
          {/* Main column */}
          <div className="space-y-8">
            {/* Image gallery: featured + thumbnails */}
            <div className="rounded-[20px] bg-white p-4 shadow-sm border border-slate-100">
              <div className="overflow-hidden rounded-[20px] bg-slate-100">
                <img src={experience.gallery?.[0] ?? experience.image} alt="featured" className="w-full h-[28rem] md:h-[34rem] object-cover rounded-[20px] transition-transform duration-300 hover:scale-105" />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {experience.gallery.slice(1, 5).map((img) => (
                  <div key={img} className="overflow-hidden rounded-[12px] border border-slate-100">
                    <img src={img} alt="thumb" className="w-full h-28 object-cover transform transition-transform duration-300 hover:scale-110" />
                  </div>
                ))}
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-5 tracking-tight">{experience.title}</h1>
            <p className="max-w-3xl text-lg text-slate-600 font-medium leading-relaxed">{experience.description}</p>
          </div>
        </div>

              {/* About Workshop */}
              <div className="rounded-[2.5rem] bg-white/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(31,38,135,0.05)] border border-white/80">
                <h2 className="text-2xl font-black text-slate-900 mb-5 tracking-tight">About this workshop</h2>
                <p className="text-slate-700 leading-relaxed font-medium">{experience.about || experience.description}</p>
              </div>

            {/* What you'll learn */}
            <div className="rounded-[20px] bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-xl font-semibold mb-4">What you'll learn</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {experience.highlights.map((h) => (
                  <div key={h} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 shadow-sm">
                    <div className="flex items-center gap-3 text-amber-600">
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold">✓</span>
                      <p className="text-sm font-medium text-slate-800">{h}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workshop information cards */}
            <div className="rounded-[20px] bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-xl font-semibold mb-4">Workshop information</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <InfoCard label="Duration" value={experience.duration} />
                <InfoCard label="Skill level" value="Beginner" />
                <InfoCard label="Max participants" value={experience.no_of_guests} />
                <InfoCard label="Language" value="English / Sinhala" />
                <InfoCard label="Craftsman" value={experience.artisans?.name} />
              </div>

              {/* About Workshop */}
              <div className="rounded-[2.5rem] bg-white/60 backdrop-blur-xl p-8 sm:p-10 shadow-[0_10px_30px_rgba(31,38,135,0.05)] border border-white/80">
                <h2 className="text-2xl font-black text-slate-900 mb-5 tracking-tight">About this workshop</h2>
                <p className="text-slate-700 leading-relaxed font-medium">{experience.about || experience.description}</p>
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
          </div>

          {/* Sticky Sidebar */}
          <aside className="lg:col-start-2 lg:row-start-1 lg:sticky lg:top-28 self-start w-full">
            <div className="rounded-[2.5rem] bg-white/70 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(31,38,135,0.05)] border border-white/80">
              <div className="flex flex-col gap-4">
                <div className="pb-4 border-b border-white/60">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Starting from</p>
                  <p className="text-3xl font-black text-slate-900 tracking-tight">LKR {experience.price.toLocaleString()}</p>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-white/60">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Duration</p>
                  <p className="font-bold text-slate-900 bg-white px-2 py-1 text-sm rounded-lg border border-slate-100 shadow-sm">{experience.duration}</p>
                </div>
              )}
            </div>

                <Link href={`/workshops/checkout?workshop=${encodeURIComponent(experience.id)}`} className="w-full text-center rounded-[1.25rem] bg-amber-600 hover:bg-amber-500 px-4 py-3 text-white font-bold transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] transform hover:-translate-y-1 text-base flex items-center justify-center gap-2">
                  Book Now
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </Link>

                <div className="text-center flex items-center justify-center gap-2 mt-2">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                  <p className="text-xs font-bold text-slate-500">Includes materials & instructor</p>
                </div>
              </div>

              {/* <Link href={`/workshops/checkout?workshop=${encodeURIComponent(experience.id)}`} className="mt-6 block w-full text-center rounded-lg bg-[#072146] hover:bg-[#031426] px-5 py-3 text-white font-semibold transition">
                Book Now
              </Link>

              <div className="mt-4 text-sm text-slate-600">
                <p>Includes materials and instructor</p>
              </div> */}
            </div>

            <div className="mt-6 rounded-[20px] bg-white/80 p-5 text-slate-800 shadow-[0_10px_30px_rgba(31,38,135,0.05)] border border-white/80 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <img
                  src={experience.artisans?.avatar_url || '/default-workshop.jpg'}
                  alt={experience.artisans?.name || 'Artisan'}
                  className="h-14 w-14 rounded-full object-cover border-2 border-amber-400"
                />
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-amber-600">Artisan</p>
                  <h3 className="text-base font-semibold text-slate-900">{experience.artisans?.name || 'Master artisan'}</h3>
                  <p className="text-xs text-slate-500">{experience.artisans?.guild || 'Traditional crafts guild'}</p>
                </div>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-slate-600">
                {experience.artisans?.bio || 'A skilled artisan with years of experience guiding guests through an authentic hands-on cultural craft workshop.'}
              </p>
            </div>
          </aside>
        </div>
      </section>

      <div className="md:hidden fixed inset-x-0 bottom-0 z-50 border-t border-slate-200 bg-white p-4 shadow-xl">
        <Link
          href={`/workshops/checkout?workshop=${encodeURIComponent(experience.id)}`}
          className="block w-full rounded-full bg-amber-600 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition hover:bg-amber-700"
          aria-label="Book this workshop"
        >
          Book Now
        </Link>
      </div>
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