import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { notFound } from "next/navigation";
import EditArtisanForm from "./EditArtisanForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditArtisanPage({ params }: Props) {
  const resolvedParams = await params;
  const id = decodeURIComponent(resolvedParams.id);

  const { data: artisan, error } = await supabaseServer
    .from("artisans")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !artisan) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-10">
        <div className="mb-6">
          <Link
            href="/admin/artisans"
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-amber-600 transition-colors"
          >
            ← Back to Artisans
          </Link>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Edit Artisan Profile</h1>
        </div>

        <EditArtisanForm artisan={artisan} />
      </div>
    </main>
  );
}