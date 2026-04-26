'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      setProfile(data);
    };

    load();
  }, []);

  if (!profile) return <p className="text-center mt-20">Loading...</p>;

return (
  <div className="min-h-screen bg-[var(--color-kandyan-bg)] py-10 px-4">
    
    <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-[var(--shadow-kandyan-soft)] overflow-hidden">

      {/* 🔶 COVER */}
      <div className="h-48 bg-gradient-to-r from-[var(--color-kandyan-gold)] to-[var(--color-kandyan-maroon)]"></div>

      {/* 🔶 CONTENT */}
      <div className="px-8 pb-10 relative">

        {/* AVATAR */}
        <img
          src={profile.avatar_url}
          alt="avatar"
          className="w-28 h-28 rounded-full border-4 border-white shadow-md absolute -top-14 left-8"
        />

        {/* NAME + EMAIL */}
        <div className="mt-20 ml-36">
          <h2 className="text-3xl font-bold text-[var(--color-kandyan-maroon)]">
            {profile.full_name}
          </h2>
          <p className="text-gray-500">{profile.email}</p>
        </div>

        {/* EDIT BUTTON */}
        <div className="absolute right-8 top-20">
          <button className="bg-[var(--color-kandyan-maroon)] hover:bg-[var(--color-kandyan-maroon-dark)] text-white px-5 py-2 rounded-lg font-semibold shadow-[var(--shadow-kandyan-button)]">
            Edit
          </button>
        </div>

        {/* INFO SECTION */}
        <div className="mt-10 grid md:grid-cols-2 gap-6">

          <div className="bg-gray-50 p-6 rounded-xl">
            <p className="text-sm text-gray-500">Phone</p>
            <p className="text-lg font-semibold">
              {profile.phone || 'Not provided'}
            </p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <p className="text-sm text-gray-500">Account Type</p>
            <p className="text-lg font-semibold">User</p>
          </div>

          <div className="bg-gray-50 p-6 rounded-xl">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-green-600 font-semibold text-lg">Active</p>
          </div>

        </div>

      </div>
    </div>

  </div>
);
}