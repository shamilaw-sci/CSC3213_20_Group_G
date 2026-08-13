"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Workshop = {
  id: string;
  title: string;
  category: string;
  price: number;
  duration: string;
  no_of_guests: number;
  about?: string;
  description?: string;
  highlights?: string[];
  image?: string;
  gallery?: string[];
};

export default function EditWorkshopForm({ workshop }: { workshop: Workshop }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(workshop.title);
  const [category, setCategory] = useState(workshop.category);
  const [price, setPrice] = useState<number>(workshop.price);
  const [duration, setDuration] = useState(workshop.duration);
  const [guests, setGuests] = useState<number>(workshop.no_of_guests || 10);
  const [about, setAbout] = useState(workshop.about || workshop.description || "");
  const [highlights, setHighlights] = useState(Array.isArray(workshop.highlights) ? workshop.highlights.join(", ") : "");
  
  const [imageUrl, setImageUrl] = useState(workshop.image || "");
  const [galleryUrls, setGalleryUrls] = useState<string[]>(workshop.gallery || []);

  async function handleMainImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-main.${fileExt}`;
      const filePath = `workshops/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("workshop-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("workshop-images").getPublicUrl(filePath);
      setImageUrl(data.publicUrl);
    } catch (err: any) {
      alert("Error uploading main image: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setLoading(true);
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}-gallery-${i}.${fileExt}`;
        const filePath = `workshops/gallery/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("workshop-images")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("workshop-images").getPublicUrl(filePath);
        newUrls.push(data.publicUrl);
      }

      setGalleryUrls((prev) => [...prev, ...newUrls]);
    } catch (err: any) {
      alert("Error uploading gallery: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const parsedHighlights = highlights
      ? highlights.split(",").map((item) => item.trim()).filter(Boolean)
      : [];

    const { error } = await supabase
      .from("workshops")
      .update({
        title,
        category,
        price: Number(price),
        duration,
        no_of_guests: Number(guests),
        description: about,
        highlights: parsedHighlights,
        image: imageUrl,
        gallery: galleryUrls,
      })
      .eq("id", workshop.id);

    setLoading(false);

    if (error) {
      alert("Error updating workshop: " + error.message);
    } else {
      window.location.href = "/admin/workshops";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Workshop Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-amber-500 font-medium text-sm" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Category Label</label>
          <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-amber-500 font-medium text-sm" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Price</label>
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(Number(e.target.value))} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-amber-500 font-medium text-sm" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Duration</label>
          <input type="text" value={duration} onChange={(e) => setDuration(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-amber-500 font-medium text-sm" />
        </div>
        <div>
          <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Max Guests</label>
          <input type="number" value={guests} onChange={(e) => setGuests(Number(e.target.value))} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-amber-500 font-medium text-sm" />
        </div>
      </div>

      <div className="p-4 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Primary Hero Image</label>
        <input type="file" accept="image/*" onChange={handleMainImageUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer" />
        {imageUrl && (
          <div className="mt-3 relative w-32 h-20 rounded-lg overflow-hidden border border-slate-200 bg-white">
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      <div className="p-4 border border-dashed border-slate-200 bg-slate-50/50 rounded-2xl">
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Gallery Showcase Images</label>
        <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer" />
        
        {galleryUrls.length > 0 && (
          <div className="mt-3 grid grid-cols-4 gap-2">
            {galleryUrls.map((url, idx) => (
              <div key={idx} className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 bg-white">
                <img src={url} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs font-bold flex items-center justify-center shadow hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Highlights (Comma separated)</label>
        <input type="text" value={highlights} onChange={(e) => setHighlights(e.target.value)} placeholder="e.g. Traditional Tools, Wood Selection" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-amber-500 font-medium text-sm text-slate-700" />
      </div>

      <div>
        <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Detailed About Description</label>
        <textarea rows={5} value={about} onChange={(e) => setAbout(e.target.value)} required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-amber-500 font-medium text-sm leading-relaxed" />
      </div>

      <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
        <Link href="/admin/workshops" className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-sm text-slate-700 transition-colors">Discard Changes</Link>
        <button type="submit" disabled={loading} className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold text-sm text-white transition-all shadow-sm disabled:opacity-50">
          {loading ? "Saving Changes..." : "Push Changes Live"}
        </button>
      </div>
    </form>
  );
}