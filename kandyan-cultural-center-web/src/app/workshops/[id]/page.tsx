import Link from "next/link";
import { supabaseServer } from '@/lib/supabaseServer';

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
  location: string;
  description: string;
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
    supabaseServer.from('workshops').select('*').eq('id', id).single(),
    supabaseServer.from('workshops').select('*').neq('id', id).limit(3),
  ]);

  if (error || !experience) {
    return (
      <main className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-600 mb-4">
            Workshop not found
          </p>
          <h1 className="text-3xl font-bold">Sorry, that workshop does not exist.</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      {/* Hero / Colored Header (no image) */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-80 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16 relative z-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300 mb-3">Wood Craft Workshop</p>
            <h1 className="text-5xl font-bold leading-tight mb-5">{experience.title}</h1>
            <p className="max-w-2xl text-lg text-slate-200 mb-8">{experience.description}</p>
          </div>
        </div>
      </section>

      {/* Stepper */}
      <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 mt-6">
        <ol className="flex items-center gap-4 text-sm">
          <li className="flex items-center gap-2 text-amber-600">
            <span className="h-6 w-6 flex items-center justify-center rounded-full bg-amber-600 text-white font-semibold">1</span>
            <span className="font-semibold">Workshop Details</span>
          </li>
          <li className="flex items-center gap-2 text-slate-500">
            <span className="h-6 w-6 flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700">2</span>
            <span>Booking</span>
          </li>
          <li className="flex items-center gap-2 text-slate-500">
            <span className="h-6 w-6 flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700">3</span>
            <span>Payment</span>
          </li>
          <li className="flex items-center gap-2 text-slate-500">
            <span className="h-6 w-6 flex items-center justify-center rounded-full border border-slate-300 bg-white text-slate-700">4</span>
            <span>Confirmation</span>
          </li>
        </ol>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.6fr_0.9fr]">
          {/* Main column */}
          <div className="space-y-8">
            {/* Image gallery: featured + thumbnails */}
            <div className="rounded-[20px] bg-white p-4 shadow-sm border border-slate-100">
              <div className="overflow-hidden rounded-[20px]">
                <img src={experience.gallery?.[0] ?? experience.image} alt="featured" className="w-full h-96 object-cover rounded-[20px] transition-transform duration-300 hover:scale-105" />
              </div>
              <div className="mt-4 grid grid-cols-4 gap-3">
                {experience.gallery.slice(1, 5).map((img) => (
                  <div key={img} className="overflow-hidden rounded-[12px] border border-slate-100">
                    <img src={img} alt="thumb" className="w-full h-28 object-cover transform transition-transform duration-300 hover:scale-110" />
                  </div>
                ))}
              </div>
            </div>

            {/* About Workshop */}
            <div className="rounded-[20px] bg-white p-8 shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold mb-4">About this workshop</h2>
              <p className="text-slate-700 leading-relaxed">{experience.description}</p>
            </div>

            {/* Highlights */}
            <div className="rounded-[20px] bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-xl font-semibold mb-4">Highlights</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {experience.highlights.map((h) => (
                  <div key={h} className="flex items-start gap-3 p-3 rounded-lg border border-slate-50 shadow-sm">
                    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-amber-50 text-amber-600">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17l-5-5" stroke="#9A6B13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="text-sm text-slate-700">{h}</div>
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
                <InfoCard label="Max participants" value="8" />
                <InfoCard label="Language" value="English / Sinhala" />
              </div>
            </div>

            {/* Masonry gallery */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Photo gallery</h3>
              <div className="columns-2 md:columns-3 gap-4 space-y-4">
                {experience.gallery.map((img) => (
                  <div key={img} className="break-inside rounded-lg overflow-hidden border border-slate-100 shadow-sm">
                    <img src={img} alt="gallery" className="w-full object-cover" style={{ minHeight: 120 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* Related workshops */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Related workshops</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(relatedWorkshops || []).map((w) => (
                  <div key={w.id} className="rounded-[16px] bg-white p-3 border border-slate-100 shadow-sm">
                    <img src={w.image} alt={w.title} className="w-full h-40 object-cover rounded-[12px]" />
                    <div className="mt-3">
                      <h4 className="font-semibold">{w.title}</h4>
                      <p className="text-sm text-slate-500 mt-1">LKR {w.price}</p>
                      <Link href={`/workshops/${w.id}`} className="inline-block mt-3 rounded-md bg-amber-600 px-3 py-2 text-sm text-white">View details</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Price & CTA column */}
          <aside className="sticky top-20 self-start">
            <div className="w-full max-w-md">
              <div className="rounded-[16px] bg-white p-6 shadow-lg border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Starting from</p>
                    <p className="text-3xl font-bold text-amber-600">LKR {experience.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Duration</p>
                    <p className="font-semibold">{experience.duration}</p>
                  </div>
                </div>

                <Link href={`/workshops/checkout?workshop=${encodeURIComponent(experience.id)}`} className="mt-6 block w-full text-center rounded-lg bg-[#072146] hover:bg-[#031426] px-5 py-3 text-white font-semibold transition">
                  Book Now
                </Link>

                <div className="mt-4 text-sm text-slate-600">
                  <p>Includes materials and instructor</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 p-3 bg-white shadow-sm text-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-medium text-slate-700">{value}</p>
    </div>
  );
}
