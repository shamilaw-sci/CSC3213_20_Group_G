import BookingPanel from "../components/BookingPanel";
import { workshops, shows } from "../data";

type Props = {
  params: Promise<{ id: string | string[] }> | { id: string | string[] };
};

type ScheduleSlot = {
  date: string;
  times: string[];
};

type Experience = {
  id: string;
  category: "workshop" | "show";
  title: string;
  craftsman: string;
  image: string;
  price: number;
  duration: string;
  location: string;
  description: string;
  highlights: string[];
  craftsmanDetails: {
    name: string;
    experience: string;
    specialty: string;
  };
  schedule: ScheduleSlot[];
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

  const experience = workshops.find((item) => String(item.id).toLowerCase() === id)
    || shows.find((item) => String(item.id).toLowerCase() === id);

  if (!experience) {
    return (
      <main className="min-h-screen bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-rose-600 mb-4">
            Experience not found
          </p>
          <h1 className="text-3xl font-bold">Sorry, that workshop or show does not exist.</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-r from-amber-500 to-rose-700 text-white py-14 px-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-100 mb-3">
            {experience.category === "show" ? "Show Details" : "Workshop Details"}
          </p>
          <h1 className="text-5xl font-bold tracking-tight">
            {experience.title}
          </h1>
          <p className="mt-4 max-w-3xl text-slate-100">
            {experience.description}
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/90">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              {experience.craftsman}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              {experience.duration}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              LKR {experience.price}
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid gap-10 lg:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-8">
            <img
              src={experience.image}
              alt={experience.title}
              className="w-full rounded-[32px] object-cover shadow-xl shadow-slate-200/40"
            />

            <div className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-[32px] bg-white border border-slate-200 p-7 shadow-sm">
                <h2 className="text-2xl font-bold mb-4">What to expect</h2>
                <ul className="space-y-3 text-slate-600">
                  {experience.highlights.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[32px] bg-white border border-slate-200 p-7 shadow-sm">
                {experience.category === 'show' ? (
                  <>
                    <h2 className="text-2xl font-bold mb-4">Show details</h2>
                    <div className="space-y-4 text-slate-600">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Performer</p>
                        <p className="mt-2 font-semibold text-slate-900">
                          {experience.craftsman}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Venue</p>
                        <p className="mt-2">{experience.location}</p>
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Show schedule</p>
                        <div className="mt-2 space-y-2 text-sm text-slate-700">
                          {experience.schedule.map((slot) => (
                            <div key={slot.date} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                              <p className="font-semibold">{formatDate(slot.date)}</p>
                              <p className="mt-1 text-slate-600">{slot.times.join(' · ')}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold mb-4">Craftsman details</h2>
                    <div className="space-y-4 text-slate-600">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Name</p>
                        <p className="mt-2 font-semibold text-slate-900">
                          {experience.craftsmanDetails.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Experience</p>
                        <p className="mt-2">{experience.craftsmanDetails.experience}</p>
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Specialty</p>
                        <p className="mt-2">{experience.craftsmanDetails.specialty}</p>
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Location</p>
                        <p className="mt-2">{experience.location}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>


          </div>

          <aside className="space-y-6">
            <div className="rounded-[32px] bg-white border border-slate-200 p-6 shadow-sm">
              <BookingPanel workshop={experience} />
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
