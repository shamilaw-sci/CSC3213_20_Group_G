'use client';

import Link from "next/link";
import { useCurrency } from '@/context/CurrencyContext';


type Workshop = {
  id: string;
  title: string;
  craftsman: string;
  image: string;
  price: number;
  duration: string;
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

export default function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const { formatPrice } = useCurrency();
  return (
    <Link href={`/workshops/${workshop.id}`}>
      <div className="group cursor-pointer overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm transition hover:shadow-xl max-w-sm mx-0 inline-block">
        <div className="relative h-64 overflow-hidden bg-slate-100">
          <img
            src={workshop.image}
            alt={workshop.title}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>

        <div className="p-4 sm:p-5">
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {workshop.title}
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600 line-clamp-2">
            {workshop.description}
          </p>

          <div className="mt-4 text-sm text-slate-500">
            <span>{formatPrice(workshop.price)}</span>
          </div>

          <button className="mt-5 w-full rounded-2xl bg-rose-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-rose-800">
            More details →
          </button>
        </div>
      </div>
    </Link>
  );
}
