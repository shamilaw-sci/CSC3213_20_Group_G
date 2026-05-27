import Link from "next/link";

type ScheduleSlot = {
  date: string;
  times: string[];
};

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

export default function WorkshopCard({
  workshop,
}: {
  workshop: Workshop;
}) {
  return (
    <Link href={`/workshops/${workshop.id}`}>
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition cursor-pointer">

        <img
          src={workshop.image}
          alt={workshop.title}
          className="w-full h-64 object-cover"
        />

        <div className="p-5">
          <h2 className="text-xl font-bold">{workshop.title}</h2>

          <p className="text-gray-500 mt-1">
            {workshop.craftsman}
          </p>

          <p className="mt-2 text-sm text-gray-600">
            {workshop.description}
          </p>

          <div className="mt-4 text-sm text-slate-600">
            <div className="font-medium text-slate-800 mb-2">What you will learn</div>
            <div className="flex flex-wrap gap-2">
              {workshop.highlights.slice(0, 2).map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-3 font-semibold">
            LKR {workshop.price}
          </div>

          <div className="text-sm text-gray-500">
            {workshop.duration}
          </div>

          <div className="mt-4 text-sm text-slate-600">
            <div className="font-medium text-slate-800 mb-2">Next dates</div>
            <div className="flex flex-wrap gap-2">
              {workshop.schedule.slice(0, 2).map((slot) => (
                <span
                  key={slot.date}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1"
                >
                  {formatDate(slot.date)}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}