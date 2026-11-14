import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import type { Announcement } from '@/types/announcement.types';

export const revalidate = 0;

export const metadata = {
  title: 'Events & News | Kandyan Cultural Center',
  description: 'Upcoming cultural events and the latest news from the Kandyan Cultural Center.',
};

type Filter = 'all' | 'event' | 'news';

const FILTERS: { value: Filter; label: string; href: string }[] = [
  { value: 'all', label: 'All', href: '/events' },
  { value: 'event', label: 'Events', href: '/events?type=event' },
  { value: 'news', label: 'News', href: '/events?type=news' },
];

// Dates are Sri Lanka local, so "past event" flips at local midnight.
const todayColombo = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Colombo' });

const formatDate = (isoDate: string, opts: Intl.DateTimeFormatOptions) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });

const formatPosted = (timestamp: string) =>
  new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Colombo',
  });

function Background() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
    </div>
  );
}

function AnnouncementCard({ item, today }: { item: Announcement; today: string }) {
  const isEvent = item.type === 'event';
  const isPast = isEvent && !!item.event_date && item.event_date < today;

  return (
    <article
      className={`group bg-white/40 backdrop-blur-xl border border-white/60 rounded-[1.5rem] overflow-hidden shadow-[0_6px_24px_rgba(31,38,135,0.05)] hover:shadow-[0_10px_30px_rgba(31,38,135,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col ${
        isPast ? 'opacity-75' : ''
      }`}
    >
      <div className={`h-1.5 w-full ${isEvent ? 'bg-amber-500' : 'bg-slate-800'}`}></div>

      <div className="p-6 sm:p-7 flex flex-col flex-grow bg-white/20 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest shadow-sm ${
              isEvent ? 'bg-amber-500' : 'bg-slate-800'
            }`}
          >
            {isEvent ? 'Event' : 'News'}
          </span>
          {isPast && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Past event</span>
          )}
        </div>

        <div className="mt-5 flex items-start gap-4">
          {isEvent && item.event_date && (
            <div className="shrink-0 w-16 rounded-2xl bg-amber-50 border border-amber-200/60 py-2 text-center shadow-sm">
              <p className="text-2xl font-black text-amber-600 leading-none">
                {formatDate(item.event_date, { day: 'numeric' })}
              </p>
              <p className="mt-1 text-[10px] font-extrabold text-amber-700 uppercase tracking-widest">
                {formatDate(item.event_date, { month: 'short' })}
              </p>
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 leading-tight group-hover:text-amber-600 transition-colors break-words">
              {item.title}
            </h2>
            {isEvent && item.event_date && (
              <p className="mt-1 text-xs font-bold text-slate-500">
                {formatDate(item.event_date, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600 font-medium whitespace-pre-line break-words">
          {item.description}
        </p>

        <div className="flex-grow"></div>

        <p className="mt-5 pt-4 border-t border-white/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Posted {formatPosted(item.created_at)}
        </p>
      </div>
    </article>
  );
}

export default async function EventsPage({ searchParams }: { searchParams?: { type?: string } }) {
  const filter: Filter = searchParams?.type === 'event' || searchParams?.type === 'news' ? searchParams.type : 'all';

  // Anon client on purpose: RLS only exposes active rows. The .eq() is belt-and-braces.
  let query = supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (filter !== 'all') query = query.eq('type', filter);

  const { data, error } = await query;
  const items = (data ?? []) as Announcement[];
  const today = todayColombo();

  return (
    <main className="relative min-h-screen bg-slate-50">
      <Background />

      <section className="relative z-10 flex flex-col justify-center items-center px-4 md:px-12 pt-24 pb-10">
        <div className="bg-white/40 backdrop-blur-xl border border-white/60 p-8 md:p-14 rounded-[3rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] max-w-6xl w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-amber-400/12 blur-[40px] rounded-full pointer-events-none"></div>
          <div className="relative z-10">
            <h2 className="text-amber-600 font-bold tracking-widest uppercase text-xs mb-4 flex items-center justify-center gap-4">
              <span className="w-10 h-px bg-amber-600"></span> What&apos;s Happening <span className="w-10 h-px bg-amber-600"></span>
            </h2>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-rose-600">Events &amp; News</span>
            </h1>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg font-light leading-relaxed">
              Performances, festivals and updates from the Kandyan Cultural Center.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 pb-20">
        <nav aria-label="Filter announcements" className="flex justify-center gap-2 mb-8">
          {FILTERS.map((f) => {
            const active = f.value === filter;
            return (
              <Link
                key={f.value}
                href={f.href}
                aria-current={active ? 'page' : undefined}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold border shadow-sm transition-all ${
                  active
                    ? 'bg-amber-500 text-white border-amber-400 shadow-[0_4px_10px_rgba(217,119,6,0.3)]'
                    : 'bg-white/60 text-slate-600 border-white/80 hover:bg-white hover:text-amber-600'
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </nav>

        {error ? (
          <div className="mx-auto max-w-xl text-center bg-white/60 backdrop-blur-xl border border-white/80 p-12 rounded-[3rem] shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-rose-600 mb-4">Unavailable</p>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">We couldn&apos;t load announcements.</h2>
            <p className="text-slate-500 font-medium">Please refresh the page in a moment.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="mx-auto max-w-xl text-center bg-white/60 backdrop-blur-xl border border-white/80 p-12 rounded-[3rem] shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.3em] text-amber-600 mb-4">Nothing here yet</p>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">No announcements right now.</h2>
            <p className="text-slate-500 font-medium">Check back soon for upcoming events and news.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <AnnouncementCard key={item.id} item={item} today={today} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}