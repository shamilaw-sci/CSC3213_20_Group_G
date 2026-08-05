'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Artisan {
  id: string;
  name: string;
}

export default function NewWorkshopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const [categoryType, setCategoryType] = useState<"wood" | "brass" | "other">("wood");
  const [customCategory, setCustomCategory] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    price: "",
    artisan_id: "",
    duration: "2",
    description: "",
    no_of_guests: "10",
    highlights: "",
  });

  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  useEffect(() => {
    async function fetchArtisans() {
      const { data, error } = await supabase
        .from("artisans")
        .select("id, name")
        .order("name", { ascending: true });
      
      if (!error && data) {
        setArtisans(data);
        if (data.length > 0) {
          setFormData(prev => ({ ...prev, artisan_id: data[0].id }));
        }
      }
    }
    fetchArtisans();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadImageFile = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `workshops/${fileName}`;

    // FIXED TYPO: Changed 'workshop -images' to 'workshop-images'
    const { error: uploadError } = await supabase.storage
      .from('workshop-images')
      .upload(filePath, file);

    if (uploadError) {
      alert(`Upload failed: ${uploadError.message}`);
      return null;
    }

    const { data } = supabase.storage.from('workshop-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingCover(true);
    const url = await uploadImageFile(e.target.files[0]);
    if (url) setCoverImageUrl(url);
    setUploadingCover(false);
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingGallery(true);
    const uploadedUrls: string[] = [...galleryUrls];

    for (let i = 0; i < e.target.files.length; i++) {
      const url = await uploadImageFile(e.target.files[i]);
      if (url) uploadedUrls.push(url);
    }

    setGalleryUrls(uploadedUrls);
    setUploadingGallery(false);
  };

  const removeGalleryImage = (indexToRemove: number) => {
    setGalleryUrls(galleryUrls.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coverImageUrl) {
      alert("Please upload a cover image first!");
      return;
    }

    const finalCategory = categoryType === "other" 
      ? customCategory.trim().toLowerCase() 
      : categoryType;

    if (!finalCategory) {
      alert("Please specify a category!");
      return;
    }

    setLoading(true);

    const highlightsArray = formData.highlights
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item !== "");

    const formattedDuration = formData.duration 
      ? `${formData.duration.trim()} Hours` 
      : "2 Hours";

    // REMOVED manual 'id' generation so Supabase automatically assigns a UUID
    const payload = {
      title: formData.title,
      category: finalCategory,
      price: parseFloat(formData.price),
      artisan_id: formData.artisan_id || null,
      duration: formattedDuration,
      description: formData.description,
      no_of_guests: parseInt(formData.no_of_guests, 10),
      image: coverImageUrl,
      highlights: highlightsArray,
      gallery: galleryUrls
    };

    const { error } = await supabase.from("workshops").insert([payload]);

    setLoading(false);
    if (error) {
      alert(`Error saving workshop: ${error.message}`);
    } else {
      router.push("/admin/workshops");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-10">
        <div className="mb-6">
          <Link href="/admin/workshops" className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-amber-600 transition-colors">
            ← Back to List
          </Link>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Create New Workshop</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Workshop Title</label>
              <input required type="text" name="title" value={formData.title} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none" placeholder="Traditional Wood Carving Masterclass" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Category</label>
              <select 
                value={categoryType} 
                onChange={(e) => setCategoryType(e.target.value as "wood" | "brass" | "other")} 
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none bg-white"
              >
                <option value="wood">Wood Craft</option>
                <option value="brass">Brass Work</option>
                <option value="other">Other...</option>
              </select>

              {categoryType === "other" && (
                <input
                  required
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Type custom category..."
                  className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Assigned Artisan</label>
              <select name="artisan_id" value={formData.artisan_id} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none bg-white">
                {artisans.map((artisan) => (
                  <option key={artisan.id} value={artisan.id}>{artisan.name}</option>
                ))}
                {artisans.length === 0 && <option value="">No artisans found</option>}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Price (LKR)</label>
              <input 
                required 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                placeholder="5000" 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Duration</label>
              <div className="relative flex items-center">
                <input 
                  required 
                  type="number" 
                  step="0.5"
                  name="duration" 
                  value={formData.duration} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-slate-200 p-3 pr-16 text-sm focus:border-amber-500 focus:outline-none" 
                  placeholder="2"
                />
                <span className="absolute right-4 text-xs font-bold text-slate-400 pointer-events-none">Hours</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Max Guests</label>
              <input required type="number" name="no_of_guests" value={formData.no_of_guests} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Cover Image</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center justify-center">
              {coverImageUrl ? (
                <div className="text-center">
                  <img src={coverImageUrl} alt="Cover Preview" className="h-32 w-auto object-cover rounded-xl mx-auto shadow-sm mb-2" />
                  <button type="button" onClick={() => setCoverImageUrl("")} className="text-xs font-bold text-rose-500 hover:underline">Remove and select another</button>
                </div>
              ) : (
                <label className="cursor-pointer text-center py-4 block w-full">
                  <span className="text-sm font-semibold text-amber-600 block mb-1">
                    {uploadingCover ? "Uploading file..." : "Choose Cover Image from Device"}
                  </span>
                  <span className="text-xs text-slate-400">Supports JPG, PNG formats</span>
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploadingCover} />
                </label>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Description</label>
            <textarea required name="description" rows={4} value={formData.description} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none" placeholder="Provide a detailed breakdown of the complete workshop experience..." />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">What they'll learn (Comma separated)</label>
            <input type="text" name="highlights" value={formData.highlights} onChange={handleChange} className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none" placeholder="Chisel grip techniques, Brass embossing patterns" />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Workshop Gallery Showcase</label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50/50">
              <label className="cursor-pointer block text-center w-full mb-4">
                <span className="text-sm font-semibold text-slate-700 block">
                  {uploadingGallery ? "Processing images..." : "+ Select Gallery Images from Device"}
                </span>
                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" disabled={uploadingGallery} />
              </label>

              {galleryUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-2">
                  {galleryUrls.map((url, index) => (
                    <div key={index} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100 border border-slate-200">
                      <img src={url} alt={`Gallery index ${index}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute inset-0 bg-rose-600/80 text-white font-bold text-xs opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploadingCover || uploadingGallery}
            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 px-4 transition-colors disabled:opacity-50 text-sm"
          >
            {loading ? "Publishing Experience..." : "Publish Workshop"}
          </button>
        </form>
      </div>
    </main>
  );
}