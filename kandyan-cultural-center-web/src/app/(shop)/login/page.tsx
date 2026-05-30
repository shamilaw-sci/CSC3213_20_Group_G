'use client';

import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function LoginPage() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Dynamically gets the URL so it works on localhost AND Netlify!
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-stone-50 selection:bg-kandyan-gold selection:text-white">
      
      {/* LEFT SIDE: Cultural Imagery (Hidden on mobile) */}
      <div className="hidden lg:block relative w-full h-full overflow-hidden">
        {/* Using your existing story image as a beautiful dark backdrop */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/story1.png" 
          alt="Kandyan Heritage" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Elegant Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
        
        {/* Overlay Content */}
        <div className="absolute bottom-20 left-0 p-16 w-full">
          <h2 className="text-white text-5xl font-black tracking-tight mb-4 leading-tight">
            Preserving <br/>
            <span className="text-kandyan-gold font-serif italic font-light">The Heritage</span>
          </h2>
          <div className="w-12 h-1 bg-white/20 mb-6"></div>
          <p className="text-white/80 text-lg max-w-md font-light leading-relaxed">
            Log in to access your digital cultural portal, manage your artifact orders, and book exclusive workshops.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Minimalist Login Form */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-24 relative">
        
        {/* Back to Home Link */}
        <Link 
          href="/" 
          className="absolute top-8 left-8 lg:top-12 lg:left-12 text-slate-400 hover:text-kandyan-maroon transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Site
        </Link>

        {/* Login Container */}
        <div className="w-full max-w-sm space-y-12">
          
          {/* Logo & Header */}
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-kandyan-gold text-white flex items-center justify-center font-black text-3xl mx-auto shadow-lg shadow-amber-500/30">
              K
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-6">Welcome Back</h1>
              <p className="text-slate-500 mt-2 font-light">Sign in to your Cultural Center account</p>
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-8">
            <button
              onClick={login}
              className="w-full flex items-center justify-center gap-4 bg-white border border-slate-200 px-8 py-4 rounded-full shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-kandyan-gold transition-all duration-300 font-bold text-slate-700 cursor-pointer group"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5 group-hover:scale-110 transition-transform"
              />
              Continue with Google
            </button>

            {/* Decorative Divider */}
            <div className="flex items-center gap-4 opacity-60">
              <div className="h-px bg-slate-200 flex-grow"></div>
              <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold">Secure Portal</span>
              <div className="h-px bg-slate-200 flex-grow"></div>
            </div>
          </div>

          {/* Legal Footer */}
          <p className="text-center text-xs text-slate-400 font-light leading-relaxed pt-8">
            By signing in, you agree to our <br/>
            <Link href="#" className="underline hover:text-kandyan-gold transition-colors">Terms of Service</Link> and <Link href="#" className="underline hover:text-kandyan-gold transition-colors">Privacy Policy</Link>.
          </p>
        </div>
      </div>

    </div>
  );
}