'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  
  const [view, setView] = useState<'login' | 'signup' | 'otp' | 'complete'>('login');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '', // Added Confirm Password
    otp: '',
    fullName: '' 
  });

  const [isAgreed, setIsAgreed] = useState(false);
  const [showCheckboxError, setShowCheckboxError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('phone, full_name')
          .eq('id', session.user.id)
          .single();

        if (!profile?.phone) {
          setUserId(session.user.id);
          setFormData(prev => ({
            ...prev,
            fullName: profile?.full_name || session.user.user_metadata?.full_name || ''
          }));
          setView('complete');
        } else {
          router.push('/');
        }
      }
    };
    checkUserStatus();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const triggerErrorAnimation = () => {
    setShowCheckboxError(true);
    setTimeout(() => setShowCheckboxError(false), 2000);
  };

  // --- 1. LOGIN ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
    } else {
      window.location.href = '/'; 
    }
  };

  // --- 2. SIGNUP ---
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAgreed) return triggerErrorAnimation();
    
    // NEW: Password Confirmation Check
    if (formData.password !== formData.confirmPassword) {
      setAuthError("Passwords do not match. Please try again.");
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone: formData.phone,
        }
      }
    });

    setIsLoading(false);
    if (error) {
      // NEW: Friendly "Email already exists" check
      if (error.message.toLowerCase().includes("already registered")) {
        setAuthError("This email is already linked to an account. Please log in.");
      } else {
        setAuthError(error.message);
      }
    } else {
      setView('otp'); 
    }
  };

  // --- 3. VERIFY OTP ---
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);

    const { error } = await supabase.auth.verifyOtp({
      email: formData.email,
      token: formData.otp,
      type: 'signup',
    });

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
    } else {
      window.location.href = '/';
    }
  };

  // --- 4. GOOGLE AUTH ---
  const handleGoogleLogin = async () => {
    if (view === 'signup' && !isAgreed) return triggerErrorAnimation();
    
    setAuthError(null);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/login`, 
      },
    });
  };

  // --- 5. COMPLETE PROFILE ---
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: formData.fullName, phone: formData.phone })
      .eq('id', userId);

    if (error) {
      setAuthError(error.message);
      setIsLoading(false);
    } else {
      window.location.href = '/';
    }
  };


  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-stone-50 selection:bg-kandyan-gold selection:text-white">
      
      {/* LEFT SIDE: Cultural Imagery */}
      <div className="hidden lg:block relative w-full h-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/story1.png" alt="Kandyan Heritage" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent"></div>
        <div className="absolute bottom-20 left-0 p-16 w-full">
          <h2 className="text-white text-5xl font-black tracking-tight mb-4 leading-tight">
            Preserving <br/><span className="text-kandyan-gold font-serif italic font-light">The Heritage</span>
          </h2>
          <div className="w-12 h-1 bg-white/20 mb-6"></div>
          <p className="text-white/80 text-lg max-w-md font-light leading-relaxed">
            Log in to access your digital cultural portal, manage your artifact orders, and book exclusive workshops.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Dynamic Auth Portal */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-24 relative overflow-y-auto">
        <Link href="/" className="absolute top-8 left-8 lg:top-12 lg:left-12 text-slate-400 hover:text-kandyan-maroon transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest group">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Site
        </Link>

        <div className="w-full max-w-sm space-y-8 py-10">
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-kandyan-gold text-white flex items-center justify-center font-black text-3xl mx-auto shadow-lg shadow-amber-500/30">K</div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-6">
                {view === 'login' && 'Welcome Back'}
                {view === 'signup' && 'Create Account'}
                {view === 'otp' && 'Verify Email'}
                {view === 'complete' && 'Complete Profile'}
              </h1>
              <p className="text-slate-500 mt-2 font-light text-sm">
                {view === 'login' && 'Sign in to your Cultural Center account'}
                {view === 'signup' && 'Join us to access exclusive features'}
                {view === 'otp' && `We sent a 6-digit code to ${formData.email}`}
                {view === 'complete' && 'Almost there! Add your phone number.'}
              </p>
            </div>
          </div>

          {authError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium p-4 rounded-xl text-center">
              {authError}
            </div>
          )}

          {/* VIEW: LOGIN */}
          {view === 'login' && (
            <div className="space-y-6">
              <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-4 bg-white border border-slate-200 px-8 py-3.5 rounded-full font-bold text-slate-700 hover:shadow-md hover:border-kandyan-gold transition-all duration-300 group">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Sign in with Google
              </button>

              <div className="flex items-center gap-4 opacity-40">
                <div className="h-px bg-slate-300 flex-grow"></div>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black">OR CONTINUE WITH EMAIL</span>
                <div className="h-px bg-slate-300 flex-grow"></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
                </div>
                <div className="relative">
                  <div className="flex justify-between items-end mb-1 px-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                    <Link href="/forgot-password" className="text-[10px] font-bold text-kandyan-gold hover:text-amber-600 hover:underline">Forgot Password?</Link>
                  </div>
                  <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
                </div>
                <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-3.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-md mt-2 disabled:opacity-50">
                  {isLoading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 pt-2">
                Don't have an account? <button onClick={() => setView('signup')} className="text-kandyan-gold font-bold hover:underline">Sign up</button>
              </p>
            </div>
          )}

          {/* VIEW: SIGNUP */}
          {view === 'signup' && (
            <div className="space-y-6">
              
              <label className={`flex items-start gap-3 p-4 rounded-xl cursor-pointer transition-all duration-300 border relative ${showCheckboxError ? 'bg-rose-50 border-rose-300 animate-[shake_0.2s_ease-in-out_0s_2]' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                <div className="relative flex items-center justify-center mt-0.5 shrink-0 w-5 h-5">
                  <input type="checkbox" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" checked={isAgreed} onChange={(e) => {setIsAgreed(e.target.checked); if(e.target.checked) setShowCheckboxError(false);}} />
                  <div className={`absolute inset-0 rounded flex items-center justify-center border-2 transition-all duration-200 ${isAgreed ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-300'}`}>
                    <svg className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${isAgreed ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </div>
                </div>
                <span className={`text-xs leading-relaxed select-none ${showCheckboxError ? 'text-rose-700' : 'text-slate-500'}`}>
                  I agree to the <Link href="/terms-and-conditions" className="font-bold underline hover:text-amber-600" target="_blank">Terms</Link>, <Link href="/privacy-policy" className="font-bold underline hover:text-amber-600" target="_blank">Privacy</Link>, and <Link href="/refund-policy" className="font-bold underline hover:text-amber-600" target="_blank">Return Policy</Link>.
                </span>
              </label>

              <button onClick={handleGoogleLogin} className={`w-full flex items-center justify-center gap-4 bg-white border px-8 py-3.5 rounded-full font-bold transition-all duration-300 group ${isAgreed ? 'border-slate-200 text-slate-700 hover:shadow-md hover:border-kandyan-gold cursor-pointer' : 'border-slate-200 text-slate-400 opacity-70 cursor-not-allowed'}`}>
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className={`w-5 h-5 ${isAgreed ? 'group-hover:scale-110 transition-transform' : 'grayscale'}`} />
                Sign up with Google
              </button>

              <div className="flex items-center gap-4 opacity-40">
                <div className="h-px bg-slate-300 flex-grow"></div>
                <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black">OR CONTINUE WITH EMAIL</span>
                <div className="h-px bg-slate-300 flex-grow"></div>
              </div>

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">First Name</label>
                    <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Last Name</label>
                    <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Phone Number</label>
                  <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Email</label>
                  <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
                </div>
                
                {/* NEW: Password & Confirm Password side-by-side */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Password</label>
                    <input type="password" name="password" minLength={6} required value={formData.password} onChange={handleInputChange} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Confirm</label>
                    <input type="password" name="confirmPassword" minLength={6} required value={formData.confirmPassword} onChange={handleInputChange} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
                  </div>
                </div>

                <button type="submit" disabled={isLoading} className="w-full bg-slate-900 text-white py-3.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-md mt-4 disabled:opacity-50">
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 pt-2">
                Already have an account? <button onClick={() => setView('login')} className="text-kandyan-gold font-bold hover:underline">Log in</button>
              </p>
            </div>
          )}

          {/* VIEW: VERIFY OTP */}
          {view === 'otp' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">6-Digit Code</label>
                <input type="text" maxLength={6} required value={formData.otp} onChange={(e) => setFormData(prev => ({...prev, otp: e.target.value.replace(/\D/g, '')}))} className="w-full bg-white border border-slate-200 text-slate-900 text-2xl tracking-[0.5em] text-center font-mono font-black rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" placeholder="000000" />
              </div>
              <button type="submit" disabled={isLoading || formData.otp.length < 6} className="w-full bg-kandyan-gold text-white py-3.5 rounded-full font-bold text-sm hover:bg-amber-600 transition-all shadow-md disabled:opacity-50 mt-4">
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
            </form>
          )}

          {/* VIEW: COMPLETE GOOGLE PROFILE */}
          {view === 'complete' && (
            <form onSubmit={handleCompleteProfile} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Full Name (From Google)</label>
                <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Phone Number *</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="e.g. +94 77 123 4567" className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
              </div>
              <button type="submit" disabled={isLoading || !formData.phone} className="w-full bg-kandyan-gold text-white py-3.5 rounded-full font-bold text-sm hover:bg-amber-600 transition-all shadow-md disabled:opacity-50 mt-4">
                {isLoading ? 'Saving...' : 'Save & Enter Store'}
              </button>
            </form>
          )}

        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }`}} />
    </div>
  );
}