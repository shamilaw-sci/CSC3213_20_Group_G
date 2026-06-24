import Link from "next/link";
import { useCurrency } from '@/context/CurrencyContext';

// schedule removed

type Workshop = {
  id: string;
  title: string;
  craftsman: string;
  image: string;
  price: number;
  duration: string;
  description: string;
  location: string;
  highlights: string[];
  // schedule removed
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const { formatPrice } = useCurrency();
  return (
    <Link href={`/workshops/${workshop.id}`}>
      <div className="group cursor-pointer overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition hover:shadow-xl">
        <div className="h-72 overflow-hidden bg-slate-100">
          <img src={workshop.image} alt={workshop.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div className="p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{workshop.title}</h2>
              <p className="mt-2 text-sm text-slate-500">{workshop.craftsman}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-rose-700">{formatPrice(workshop.price)}</p>
              <p className="text-xs text-slate-400">{workshop.duration}</p>
            </div>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-600">{workshop.description}</p>

          <div className="mt-6 grid gap-2">
            {workshop.highlights.slice(0, 3).map((item) => (
              <span key={item} className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                {item}
              </span>
            ))}
          </div>

          {/* schedule removed */}
        </div>
      </div>
    </Link>
  );
}
