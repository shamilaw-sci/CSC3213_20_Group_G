'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function ProfileSetup() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();

      const u = data.user;
      setUser(u);

      // ✅ AUTO FILL FIX HERE
      if (u) {
        setName(u.user_metadata?.name || u.user_metadata?.full_name || '');
      }
    };

    loadUser();
  }, []);

const save = async () => {
  //alert("SAVE CLICKED"); // 👈 MUST SHOW

  // if (!user) {
  //   alert("USER NOT LOADED");
  //   return;
  // }

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: name,
    phone: phone,
    avatar_url: user.user_metadata?.avatar_url,
  });

  if (error) {
    //alert("ERROR: " + error.message);
    console.log(error);
    return;
  }

  // alert("SUCCESS");
    window.location.href = '/';
};

  return (
    <div className="h-screen flex flex-col items-center justify-center gap-4">
      <h1>Complete Profile</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Full Name"
        className="border p-2"
      />

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone"
        className="border p-2"
      />

      <button
        type="button"
        onClick={() => {
        console.log("🔥 BUTTON CLICKED");
        save();
  }}
        className="bg-green-600 text-white px-4 py-2"
      >
        Save
      </button>
    </div>
  );
}