'use client';

import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

interface ImageUploadProps {
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => void;
  bucketName?: string;
}

export default function ImageUpload({ currentImageUrl, onUploadSuccess, bucketName = 'artifact-images' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || '');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Client-side Image Compression
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new window.Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1200; // Optimal web resolution
          
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Canvas conversion failed'));
          }, 'image/jpeg', 0.8); // 80% quality JPEG
        };
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');

    try {
      // 1. Show immediate local preview
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);

      // 2. Compress the image
      const compressedBlob = await compressImage(file);

      // 3. Upload to Supabase Storage
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, compressedBlob, { contentType: 'image/jpeg' });

      if (uploadError) throw uploadError;

      // 4. Get the public URL and pass it to the parent form
      const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(fileName);
      onUploadSuccess(publicData.publicUrl);

    } catch (err: any) {
      setError(err.message || 'Failed to upload image.');
      setPreview(currentImageUrl || ''); // Revert on failure
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-6">
        
        {/* Preview Box */}
        <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden relative shrink-0 flex items-center justify-center">
          {preview ? (
            <Image src={preview} alt="Preview" fill className="object-cover" />
          ) : (
            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center backdrop-blur-sm">
              <div className="w-6 h-6 border-2 border-white/30 border-t-amber-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <div className="flex-1">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            ref={fileInputRef} 
            className="hidden" 
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2 bg-white border border-slate-200 hover:border-amber-500 hover:text-amber-600 text-slate-600 font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {isUploading ? 'Uploading & Resizing...' : 'Choose Image'}
          </button>
          <p className="text-[10px] text-slate-400 mt-2 font-medium">Auto-resizes to max 1200px (JPEG).</p>
          {error && <p className="text-xs text-rose-500 mt-1 font-bold">{error}</p>}
        </div>
      </div>
    </div>
  );
}