'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    load();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (!user) {
    return <Link href="/login">Login</Link>;
  }

  return (
    <div className="relative">
      <div onClick={() => setOpen(!open)} className="flex gap-2 cursor-pointer">
        <Image
          src={user.user_metadata?.avatar_url || '/default.png'}
          width={30}
          height={30}
          alt="avatar"
          className="rounded-full"
        />
        <span>{user.user_metadata?.full_name || user.email}</span>
      </div>

      {open && (
        <div className="absolute right-0 bg-white text-black shadow rounded w-40">
          <Link href="/profile" className="block p-2">Profile</Link>
          <button onClick={logout} className="w-full text-left p-2">
            Logout
          </button>
        </div>
      )}
    </div>
  );
}