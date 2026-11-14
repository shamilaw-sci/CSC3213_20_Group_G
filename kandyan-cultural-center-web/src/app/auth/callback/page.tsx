'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkUserAndRedirect = async () => {
      // Get the newly logged-in user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      // Check if they have a completed profile in the database
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, full_name')
        .eq('id', user.id)
        .single();

      // If they have a phone number
      if (profile && profile.phone) {
        router.push('/');
      } else {
        router.push('/profile-setup');
      }
    };

    // Listen for the exact moment the Google session is established
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || session) {
        checkUserAndRedirect();
      }
    });

    // Run once as a fallback
    checkUserAndRedirect();

    return () => authListener.subscription.unsubscribe();
  }, [router]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-kandyan-gold rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium animate-pulse tracking-widest uppercase text-sm">Authenticating...</p>
      </div>
    </div>
  );
}