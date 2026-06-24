'use client';

import Link from "next/link";
import { workshops } from "./data";

export default function WorkshopsPage() {
  const workshop = workshops[0];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-400 mb-3">Wood Craft Workshop</p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">{workshop.title}</h1>
          <p className="max-w-3xl text-base text-slate-300 mb-10">A single focused wood craft session with a master craftsman. Learn how to carve a keepsake, explore Kandyan woodcraft techniques, and book your spot with one simple flow.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-10">
        <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_0.7fr] items-center">
            <div>
              <div className="overflow-hidden rounded-[28px] border border-slate-200">
                <img src={workshop.image} alt={workshop.title} className="h-72 w-full object-cover" />
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-slate-900">Wood Craft Workshop</h2>
              <p className="text-slate-600">The workshop page now shows only the wood craft experience. There are no show/workshop tabs anymore — just a flexible booking path for this single workshop.</p>
              <Link href={`/workshops/${workshop.id}`} className="inline-flex items-center justify-center rounded-full bg-rose-600 px-7 py-4 text-base font-semibold text-white shadow-lg shadow-rose-600/20 transition hover:bg-rose-700">
                More details
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
