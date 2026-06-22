import Link from "next/link";
import { workshops } from "../data";

type Props = {
  params: Promise<{ id: string | string[] }> | { id: string | string[] };
};

type Experience = {
  id: string;
  category: "workshop";
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

  const experience = workshops.find((item) => String(item.id).toLowerCase() === id);

  if (!experience) {
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
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-70 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent" />
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-16 relative z-10">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.35em] text-amber-300 mb-3">Wood Craft Workshop</p>
            <h1 className="text-5xl font-bold leading-tight mb-5">{experience.title}</h1>
            <p className="max-w-2xl text-lg text-slate-200 mb-8">{experience.description}</p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-12 sm:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="overflow-hidden rounded-[32px] border border-slate-200">
              <img src={experience.image} alt={experience.title} className="h-72 w-full object-cover" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 mt-6">
              {experience.gallery.slice(1, 3).map((image) => (
                <div key={image} className="overflow-hidden rounded-[28px] border border-slate-200">
                  <img src={image} alt={experience.title} className="h-44 w-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] bg-white border border-slate-200 p-8 shadow-sm">
              <p className="text-sm uppercase tracking-[0.25em] text-slate-500 mb-4">Price</p>
              <p className="text-4xl font-bold text-slate-900">LKR {experience.price}</p>
            </div>
            <div className="rounded-[32px] bg-white border border-slate-200 p-8 shadow-sm space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500 mb-3">Craftsman</p>
                <p className="font-semibold text-slate-900">{experience.craftsman}</p>
              </div>
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-500 mb-3">What you'll learn</p>
                <ul className="space-y-2 text-sm text-slate-600">
                  {experience.highlights.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-1.5 h-2 w-2 rounded-full bg-rose-600 flex-shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Link href={`/workshops/checkout?workshop=${experience.id}`} className="flex items-center justify-center rounded-full bg-rose-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-rose-600/25 transition hover:bg-rose-700">
              Book Now
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
