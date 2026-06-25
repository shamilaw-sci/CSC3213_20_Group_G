import { supabaseServer } from '@/lib/supabaseServer';
import WorkshopCard from './components/WorkshopCard';

export default async function WorkshopsPage() {
  const { data: workshops, error } = await supabaseServer.from('workshops').select('*').order('title');

  if (error || !workshops || workshops.length === 0) {
    return (
      <main className="min-h-screen bg-slate-50 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-600 mb-4">Workshops unavailable</p>
          <h1 className="text-3xl font-bold">Unable to load workshops right now.</h1>
          <p className="mt-4 text-slate-600">Please try again later.</p>
        </div>
      </main>
    );
  }

  const workshop = workshops[0];

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 text-white py-20">
        <div className="mx-auto max-w-5xl px-6 sm:px-10">
          <p className="text-sm uppercase tracking-[0.35em] text-amber-400 mb-3">{workshop.category === 'workshop' ? 'Wood Craft Workshop' : 'Experience'}</p>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">{workshop.title}</h1>
          <p className="max-w-3xl text-base text-slate-300 mb-10">A single focused wood craft session with a master craftsman. Learn how to carve a keepsake, explore Kandyan woodcraft techniques, and book your spot with one simple flow.</p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-20 sm:px-10">
        <WorkshopCard workshop={workshop} />
      </section>
    </main>
  );
}
