'use client';

import { useEffect, useState } from "react";
import WorkshopCard from "./components/WorkshopCard";
import { workshops, shows } from "./data";

const tabs = [
  { id: "workshops", label: "Workshops" },
  { id: "shows", label: "Shows" },
];

export default function WorkshopsPage() {
  const [activeTab, setActiveTab] = useState<"workshops" | "shows">("workshops");
  const [currentSlide, setCurrentSlide] = useState(0);
  const items = activeTab === "shows" ? shows : workshops;

  const headerData = {
    workshops: {
      title: "Discover traditional workshops",
      description:
        "Join hands-on artisan classes for woodwork, brass craft, and mask carving. Learn from master craftsmen and take home a cultural keepsake.",
      images: ["/ad.jpg", "/story2.png"],
      topics: ["Wood carving", "Brass art", "Mask painting"],
    },
    shows: {
      title: "Experience cultural shows",
      description:
        "Reserve your seat for vibrant Kandyan performances, live drumming, and heritage processions in a memorable cultural setting.",
      images: ["/hero3.png", "/hero1.png"],
      topics: ["Kandyan dance", "Live drumming", "Heritage procession"],
    },
  };

  const currentHeader = headerData[activeTab];

  useEffect(() => {
    setCurrentSlide(0);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % currentHeader.images.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [activeTab, currentHeader.images.length]);

  return (
    <main className="w-full">
      <section className="relative overflow-hidden w-full rounded-b-[32px] bg-slate-950 shadow-xl shadow-slate-200/20 mb-10 min-h-[360px]">
        <div className="absolute inset-0">
          {currentHeader.images.map((image, index) => (
            <div
              key={image}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[1200ms] ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
              style={{ backgroundImage: `url('${image}')` }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/15 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 mx-auto px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-14 max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.35em] text-rose-300 mb-3">
              Shows & Workshops
            </p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              {currentHeader.title}
            </h1>
            <p className="text-base md:text-lg text-slate-200 max-w-xl mb-6">
              {currentHeader.description}
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "workshops" | "shows")}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-rose-700 text-white shadow-lg shadow-rose-700/20"
                      : "border border-white/20 bg-white/10 text-white hover:bg-white/15"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {currentHeader.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-100"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-10">
        <div className="grid md:grid-cols-3 gap-8">
          {items.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </div>
      </div>
    </main>
  );
}