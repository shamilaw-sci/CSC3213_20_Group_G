import Link from "next/link";
import { supabaseServer } from "@/lib/supabase";
import WorkshopPrice from "@/components/WorkshopPrice"; // Adjust path if needed
import DeleteButton from "./DeleteButton";
import BlockedSlotsManager from "@/components/BlockedSlotsManager"; // Path to your newly created component

export const revalidate = 0; // Ensure fresh data on every load

export default async function AdminWorkshopsPage() {
  // Fetch all workshops ordered by creation date
  const { data: workshops, error } = await supabaseServer
    .from("workshops")
    .select("id, title, price, duration, category")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-600 font-bold">Error loading workshops: {error.message}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 space-y-10">
      
      {/* 1. Workshops Table Card */}
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Workshop Admin Panel</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your Kandyan Cultural Center experiences</p>
          </div>
          <Link
            href="/admin/workshops/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-3 text-white font-bold text-sm transition-all shadow-sm"
          >
            + Add New Workshop
          </Link>
        </div>

        {/* Workshops Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {workshops?.map((workshop: { id: string; title: string; category: string; duration: string; price: number }) => (
                <tr key={workshop.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-4 px-4 font-bold text-slate-900">{workshop.title}</td>
                  <td className="py-4 px-4 text-slate-600">{workshop.category || "N/A"}</td>
                  <td className="py-4 px-4 text-slate-600">{workshop.duration}</td>
                  <td className="py-4 px-4 font-semibold text-slate-700">
                    <WorkshopPrice price={workshop.price} />
                  </td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <Link
                      href={`/admin/workshops/${workshop.id}`}
                      className="inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/70 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit
                    </Link>
                    <DeleteButton id={workshop.id} />
                  </td>
                </tr>
              ))}
              {workshops?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No workshops found. Create your first one above!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Blocked Dates & Time Slots Section */}
      <BlockedSlotsManager />

    </main>
  );
}