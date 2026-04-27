'use client';

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import Link from 'next/link';

export default function UserMenu() {
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false); // <-- NEW: Tracks broken images
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    load();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const logout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <Link 
        href="/login"
        className="bg-[var(--color-kandyan-maroon)] hover:bg-[var(--color-kandyan-maroon-dark)] text-white px-5 py-2.5 rounded-xl font-bold shadow-[var(--shadow-kandyan-button)] transition-all whitespace-nowrap text-sm"
      >
        Sign in / Sign up
      </Link>
    );
  }

  // Determine if we should show the actual image or the fallback SVG
  const hasValidAvatar = user.user_metadata?.avatar_url && !imgError;

  return (
    <div className="relative inline-block text-left" ref={menuRef}>

      {/* 🔶 USER BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 cursor-pointer p-1 rounded-full hover:bg-white/10 transition outline-none"
        aria-expanded={open}
      >
        {/* --- NEW: Conditional Avatar Rendering --- */}
        {hasValidAvatar ? (
          <Image
            src={user.user_metadata.avatar_url}
            width={36}
            height={36}
            alt="User avatar"
            className="rounded-full border-2 border-white/20 object-cover w-9 h-9"
            onError={() => setImgError(true)} // Trips the fallback if the URL breaks
          />
        ) : (
          <div className="w-9 h-9 rounded-full border-2 border-white/20 bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 shadow-sm">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
            </svg>
          </div>
        )}
        
        {/* Animated Chevron Arrow */}
        <svg 
          className={`w-4 h-4 text-slate-300 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {/* 🔶 DROPDOWN */}
      {open && (
        <div className="absolute right-0 mt-4 w-56 bg-white text-slate-800 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Signed in as</p>
            <p className="text-sm font-bold text-slate-900 truncate">
              {user.user_metadata?.full_name || user.email}
            </p>
          </div>

          <div className="py-2">
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="block px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[var(--color-kandyan-maroon)] transition-colors"
            >
              My Profile & Orders
            </Link>
            <Link
              href="/profile-setup"
              onClick={() => setOpen(false)}
              className="block px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-[var(--color-kandyan-maroon)] transition-colors"
            >
              Account Settings
            </Link>
          </div>

          <div className="border-t border-slate-100 py-1.5 bg-slate-50">
            <button
              onClick={logout}
              className="block w-full text-left px-5 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-100 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}