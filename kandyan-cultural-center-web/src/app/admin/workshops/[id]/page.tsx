import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import { notFound } from "next/navigation";
import EditWorkshopForm from "./EditWorkshopForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditWorkshopPage({ params }: Props) {
  const resolvedParams = await params;
  const id = decodeURIComponent(String(resolvedParams.id || ""));

  const { data: workshop, error } = await supabaseServer
    .from("workshops")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !workshop) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900">
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-10">
        <div className="mb-6">
          <Link 
            href="/admin/workshops" 
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-amber-600 transition-colors"
          >
            ← Back to Admin Panel
          </Link>
        </div>

        <div className="mb-8 pb-6 border-b border-slate-100">
          <h1 className="text-3xl font-black tracking-tight">Modify Experience Settings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Editing Unique Record Key: <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-xs text-slate-700">{workshop.id}</span>
          </p>
        </div>

        <EditWorkshopForm workshop={workshop} />
      </div>
    </main>
  );
}