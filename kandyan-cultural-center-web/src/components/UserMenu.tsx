// 'use client';

// import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabase';
// import Image from 'next/image';
// import Link from 'next/link';

// export default function UserMenu() {
//   const [user, setUser] = useState<any>(null);
//   const [open, setOpen] = useState(false);

//   useEffect(() => {
//     const load = async () => {
//       const { data } = await supabase.auth.getUser();
//       setUser(data.user);
//     };

//     load();
//   }, []);

//   const logout = async () => {
//     await supabase.auth.signOut();
//     window.location.href = '/login';
//   };

//   if (!user) {
//     return <Link href="/login">Sign in / Sign up</Link>;
//   }

//   return (
//     <div className="relative">
//       <div onClick={() => setOpen(!open)} className="flex gap-2 cursor-pointer">
//         <Image
//           src={user.user_metadata?.avatar_url || '/default.png'}
//           width={30}
//           height={30}
//           alt="avatar"
//           className="rounded-full"
//         />
//         <span>{user.user_metadata?.full_name || user.email}</span>
//       </div>

//       {open && (
//         <div className="absolute right-0 bg-white text-black shadow rounded w-40">
//           <Link href="/profile" className="block p-2">Profile</Link>
//           <button onClick={logout} className="w-full text-left p-2">
//             Logout
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
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

  // 🔶 NOT LOGGED IN
  if (!user) {
    return (
      <Link
        href="/login"
        className="bg-[var(--color-kandyan-maroon)] hover:bg-[var(--color-kandyan-maroon-dark)] text-white px-5 py-2 rounded-lg font-semibold shadow-[var(--shadow-kandyan-button)] transition-all whitespace-nowrap"
      >
        Sign in / Sign up
      </Link>
    );
  }

  return (
    <div className="relative inline-block text-left">

      {/* 🔶 USER BUTTON */}
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 cursor-pointer px-2 py-1 rounded-lg hover:bg-white/10 transition whitespace-nowrap"
      >
        <Image
          src={user.user_metadata?.avatar_url || '/default.png'}
          width={32}
          height={32}
          alt="avatar"
          className="rounded-full border border-white/20"
        />

        <span className="text-sm font-medium">
          {user.user_metadata?.full_name || user.email}
        </span>
      </div>

      {/* 🔶 DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white text-black rounded-xl shadow-lg overflow-hidden z-50">

          <Link
            href="/profile"
            className="block px-4 py-2 hover:bg-gray-100 transition"
          >
            Profile
          </Link>

          <button
            onClick={logout}
            className="w-full text-left px-4 py-2 hover:bg-gray-100 transition"
          >
            Logout
          </button>

        </div>
      )}
    </div>
  );
}