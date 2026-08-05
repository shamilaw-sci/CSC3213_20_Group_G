'use client';

import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete() {
    if (confirm("Are you sure you want to delete this workshop? This action cannot be undone.")) {
      const { error } = await supabase.from('workshops').delete().eq('id', id);
      
      if (error) {
        alert(`Failed to delete: ${error.message}`);
      } else {
        router.refresh(); // Dynamically update the server component list
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-3 py-1.5 rounded-lg transition-colors"
    >
      Delete
    </button>
  );
}