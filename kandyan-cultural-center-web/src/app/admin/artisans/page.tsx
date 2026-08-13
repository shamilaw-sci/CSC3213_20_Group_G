import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import DeleteArtisanButton from "./DeleteArtisanButton";

export const revalidate = 0;

// 1. Define the exact shape of an Artisan row from Supabase
type Artisan = {
  id: string;
  name: string;
  guild?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
};

export default async function AdminArtisansPage() {
  const { data: artisans, error } = await supabaseServer
    .from("artisans")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    return (
      <div className="p-8 text-center text-rose-600 font-bold">
        Error loading artisans: {error.message}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 space-y-10 text-slate-900">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-10">
        
        {/* Header Action Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Artisans Directory</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage master instructors and traditional craft guild members
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/admin/artisans/earnings"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              Artisan Workshop Earnings
            </Link>

            <Link
              href="/admin/artisans/new"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-4 py-2.5 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              + Add New Artisan
            </Link>

            <Link
              href="/admin/workshops"
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider transition-all"
            >
              ← Workshop Panel
            </Link>
          </div>
        </div>

        {/* Artisans Grid */}
        {artisans?.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl">
            <p className="text-slate-400 font-medium mb-4">No artisans found in the directory.</p>
            <Link href="/admin/artisans/new" className="text-amber-600 font-bold hover:underline">
              Add your first artisan →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 2. Explicitly type the parameter here: (artisan: Artisan) */}
            {artisans?.map((artisan: Artisan) => (
              <div
                key={artisan.id}
                className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 flex flex-col justify-between hover:shadow-md hover:bg-white transition-all group"
              >
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={artisan.avatar_url || "/default-workshop.jpg"}
                      alt={artisan.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shrink-0 bg-white"
                    />
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                        {artisan.name}
                      </h3>
                      <span className="inline-block mt-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest bg-amber-100 text-amber-800 border border-amber-200/60">
                        {artisan.guild || "Kandyan Heritage Guild"}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-6">
                    {artisan.bio ||
                      "A master craftsman dedicated to preserving authentic Kandyan traditional art forms."}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {artisan.id.slice(0, 8)}...
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/artisans/${artisan.id}`}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteArtisanButton id={artisan.id} name={artisan.name} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}