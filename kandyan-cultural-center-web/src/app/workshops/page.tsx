import WorkshopCard from "./components/WorkshopCard";
import { workshops } from "./data";

export default function WorkshopsPage() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-10">
      <h1 className="text-4xl font-bold mb-8">
        Traditional Craft Workshops
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        {workshops.map((workshop) => (
          <WorkshopCard key={workshop.id} workshop={workshop} />
        ))}
      </div>
    </main>
  );
}