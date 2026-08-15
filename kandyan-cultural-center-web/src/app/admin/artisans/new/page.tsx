"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function NewArtisanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [name, setName] = useState("");
  const [guild, setGuild] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `artisan-${Date.now()}.${fileExt}`;
      const filePath = `artisans/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("workshop-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("workshop-images").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (err: any) {
      alert("Error uploading avatar: " + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Artisan Name is mandatory.");
      return;
    }

    setLoading(true);

    // Enforce smart default fallbacks when fields are left blank
    const payload = {
      name: name.trim(),
      guild: guild.trim() || "Kandyan Heritage Guild",
      bio: bio.trim() || "A master craftsman dedicated to preserving authentic Kandyan traditional art forms.",
      avatar_url: avatarUrl || "/default-workshop.jpg",
    };

    const { error } = await supabase.from("artisans").insert([payload]);

    setLoading(false);

    if (error) {
      alert("Error creating artisan: " + error.message);
    } else {
      router.push("/admin/artisans");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-10">
        
        <div className="mb-8 pb-6 border-b border-slate-100">
          <Link
            href="/admin/artisans"
            className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-amber-600 transition-colors"
          >
            ← Back to Artisans
          </Link>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Add Master Artisan</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Only Name is required — Guild, Bio, and Avatar will apply defaults if left blank.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Master Sunil Jayasuriya"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Craft Guild
              </label>
              <input
                type="text"
                value={guild}
                onChange={(e) => setGuild(e.target.value)}
                placeholder="Default: Kandyan Heritage Guild"
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Avatar Upload Block */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Profile Avatar Image
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center justify-center">
              {avatarUrl ? (
                <div className="text-center">
                  <img
                    src={avatarUrl}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-amber-400 mx-auto shadow-sm mb-2"
                  />
                  <button
                    type="button"
                    onClick={() => setAvatarUrl("")}
                    className="text-xs font-bold text-rose-500 hover:underline"
                  >
                    Remove and select another
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer text-center py-4 block w-full">
                  <span className="text-sm font-semibold text-amber-600 block mb-1">
                    {uploadingAvatar ? "Uploading avatar..." : "Choose Profile Photo"}
                  </span>
                  <span className="text-xs text-slate-400">
                    Default placeholder applied if skipped
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                    disabled={uploadingAvatar}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Artisan Biography
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Default: A master craftsman dedicated to preserving authentic Kandyan traditional art forms."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <Link
              href="/admin/artisans"
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-sm text-slate-700 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading || uploadingAvatar}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-sm text-white transition-all shadow-sm disabled:opacity-50"
            >
              {loading ? "Saving Artisan..." : "Save Artisan"}
            </button>
          </div>

        </form>
      </div>
    </main>
  );
}