"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function DeleteArtisanButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to remove artisan "${name}"? Any workshops assigned to them will have their artisan field set to empty.`
    );
    if (!confirmed) return;

    setLoading(true);
    const { error } = await supabase.from("artisans").delete().eq("id", id);
    setLoading(false);

    if (error) {
      alert("Error deleting artisan: " + error.message);
    } else {
      router.refresh();
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </button>
  );
}