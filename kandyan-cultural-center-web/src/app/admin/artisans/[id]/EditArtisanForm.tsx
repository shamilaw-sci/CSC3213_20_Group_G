"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Artisan = {
  id: string;
  name: string;
  guild?: string;
  bio?: string;
  avatar_url?: string;
};

export default function EditArtisanForm({ artisan }: { artisan: Artisan }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [name, setName] = useState(artisan.name);
  const [guild, setGuild] = useState(artisan.guild || "");
  const [bio, setBio] = useState(artisan.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(artisan.avatar_url || "");

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `artisan-${Date.now()}.${fileExt}`;
      const filePath = `artisans/${fileName}`;

      // 🚨 UPDATED TO NEW artisan-images BUCKET
      const { error: uploadError } = await supabase.storage
        .from("artisan-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("artisan-images").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (err: any) {
      alert("Error uploading avatar: " + err.message);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);

    const payload = {
      name: name.trim(),
      guild: guild.trim() || "Kandyan Heritage Guild",
      bio: bio.trim() || "A master craftsman dedicated to preserving authentic Kandyan traditional art forms.",
      avatar_url: avatarUrl || "/default-workshop.jpg",
    };

    const { error } = await supabase
      .from("artisans")
      .update(payload)
      .eq("id", artisan.id);

    setLoading(false);

    if (error) {
      alert("Error updating artisan: " + error.message);
    } else {
      router.push("/admin/artisans");
      router.refresh();
    }
  };

  return (
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
            className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
      </div>

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
          className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-sm text-white transition-all shadow-sm disabled:opacity-50"
        >
          {loading ? "Saving..." : "Update Artisan"}
        </button>
      </div>
    </form>
  );
}