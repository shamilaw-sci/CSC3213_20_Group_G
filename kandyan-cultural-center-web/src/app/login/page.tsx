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
    confirmPassword: '', 
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

  // --- REUSABLE GLASS CLASSES ---
  const glassInputClass = "w-full bg-white/50 backdrop-blur-md border border-white/80 text-slate-900 text-sm rounded-2xl px-4 py-3.5 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition-all shadow-sm placeholder:text-slate-400";
  const primaryBtnClass = "w-full bg-amber-600 hover:bg-amber-500 text-white py-3.5 rounded-[1.25rem] font-bold text-sm transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <main className="relative min-h-screen flex flex-col justify-center items-center p-24 md:pt-32 sm:p-8 bg-[#F8F9FA]">
      
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] p-8 sm:p-10 flex flex-col">
        
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 rounded-[1.25rem] bg-amber-100 text-amber-600 border border-amber-200/50 flex items-center justify-center font-black text-3xl mx-auto shadow-sm">
            K
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-4">
              {view === 'login' && 'Welcome Back'}
              {view === 'signup' && 'Create Account'}
              {view === 'otp' && 'Verify Email'}
              {view === 'complete' && 'Complete Profile'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium text-sm">
              {view === 'login' && 'Sign in to your Cultural Center account'}
              {view === 'signup' && 'Join us to access exclusive features'}
              {view === 'otp' && `We sent a 6-digit code to ${formData.email}`}
              {view === 'complete' && 'Almost there! Add your phone number.'}
            </p>
          </div>
        </div>

        {authError && (
          <div className="mb-6 bg-rose-50/80 backdrop-blur-sm border border-rose-200 text-rose-600 text-xs font-bold px-4 py-3 rounded-xl text-center shadow-sm">
            {authError}
          </div>
        )}

        {/* VIEW: LOGIN */}
        {view === 'login' && (
          <div className="space-y-6">
            <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white/60 backdrop-blur-md border border-white/80 px-6 py-3.5 rounded-[1.25rem] font-bold text-slate-700 hover:bg-white hover:border-amber-300 transition-all shadow-sm group cursor-pointer">
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Sign in with Google
            </button>

            <div className="flex items-center gap-4 opacity-50">
              <div className="h-px bg-slate-300 flex-grow"></div>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Or continue with email</span>
              <div className="h-px bg-slate-300 flex-grow"></div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Email</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className={glassInputClass} />
              </div>
              <div className="relative">
                <div className="flex justify-between items-end mb-1 px-1">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Password</label>
                  <Link href="/forgot-password" className="text-[10px] font-extrabold text-amber-600 hover:underline">Forgot Password?</Link>
                </div>
                <input type="password" name="password" required value={formData.password} onChange={handleInputChange} className={glassInputClass} />
              </div>
              <button type="submit" disabled={isLoading} className={`${primaryBtnClass} mt-2`}>
                {isLoading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-sm font-medium text-slate-500 pt-2">
              Don't have an account? <button onClick={() => setView('signup')} className="text-amber-600 font-extrabold hover:underline">Sign up</button>
            </p>
          </div>
        )}

        {/* VIEW: SIGNUP */}
        {view === 'signup' && (
          <div className="space-y-6">
            
            <label className={`flex items-start gap-3 p-4 rounded-[1.25rem] cursor-pointer transition-all duration-300 border relative bg-white/50 backdrop-blur-sm ${showCheckboxError ? 'border-rose-400 bg-rose-50/50 animate-[shake_0.2s_ease-in-out_0s_2]' : 'border-white/80 hover:border-amber-300 shadow-sm'}`}>
              <div className="relative flex items-center justify-center mt-0.5 shrink-0 w-5 h-5">
                <input type="checkbox" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" checked={isAgreed} onChange={(e) => {setIsAgreed(e.target.checked); if(e.target.checked) setShowCheckboxError(false);}} />
                <div className={`absolute inset-0 rounded flex items-center justify-center border-2 transition-all duration-200 ${isAgreed ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-300'}`}>
                  <svg className={`w-3.5 h-3.5 text-white transition-transform duration-200 ${isAgreed ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </div>
              </div>
              <span className={`text-xs font-medium leading-relaxed select-none ${showCheckboxError ? 'text-rose-600' : 'text-slate-600'}`}>
                I agree to the <Link href="/terms-and-conditions" className="font-extrabold text-slate-800 hover:text-amber-600 transition-colors" target="_blank">Terms</Link>, <Link href="/privacy-policy" className="font-extrabold text-slate-800 hover:text-amber-600 transition-colors" target="_blank">Privacy</Link>, and <Link href="/refund-policy" className="font-extrabold text-slate-800 hover:text-amber-600 transition-colors" target="_blank">Return Policy</Link>.
              </span>
            </label>

            <button onClick={handleGoogleLogin} className={`w-full flex items-center justify-center gap-3 bg-white/60 backdrop-blur-md border px-6 py-3.5 rounded-[1.25rem] font-bold transition-all duration-300 group shadow-sm ${isAgreed ? 'border-white/80 text-slate-700 hover:bg-white hover:border-amber-300 cursor-pointer' : 'border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'}`}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className={`w-5 h-5 ${isAgreed ? 'group-hover:scale-110 transition-transform' : 'grayscale'}`} />
              Sign up with Google
            </button>

            <div className="flex items-center gap-4 opacity-50">
              <div className="h-px bg-slate-300 flex-grow"></div>
              <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black">Or continue with email</span>
              <div className="h-px bg-slate-300 flex-grow"></div>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">First Name</label>
                  <input type="text" name="firstName" required value={formData.firstName} onChange={handleInputChange} className={glassInputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Last Name</label>
                  <input type="text" name="lastName" required value={formData.lastName} onChange={handleInputChange} className={glassInputClass} />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Phone Number</label>
                <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} className={glassInputClass} />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Email</label>
                <input type="email" name="email" required value={formData.email} onChange={handleInputChange} className={glassInputClass} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Password</label>
                  <input type="password" name="password" minLength={6} required value={formData.password} onChange={handleInputChange} className={glassInputClass} />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Confirm</label>
                  <input type="password" name="confirmPassword" minLength={6} required value={formData.confirmPassword} onChange={handleInputChange} className={glassInputClass} />
                </div>
              </div>

              <button type="submit" disabled={isLoading} className={`${primaryBtnClass} mt-4`}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-sm font-medium text-slate-500 pt-2">
              Already have an account? <button onClick={() => setView('login')} className="text-amber-600 font-extrabold hover:underline">Log in</button>
            </p>
          </div>
        )}

        {/* VIEW: VERIFY OTP */}
        {view === 'otp' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-2 block text-center">6-Digit Code</label>
              <input type="text" maxLength={6} required value={formData.otp} onChange={(e) => setFormData(prev => ({...prev, otp: e.target.value.replace(/\D/g, '')}))} className="w-full bg-white/70 backdrop-blur-md border border-white/80 text-slate-900 text-3xl tracking-[0.5em] text-center font-mono font-black rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner" placeholder="••••••" />
            </div>
            <button type="submit" disabled={isLoading || formData.otp.length < 6} className={`${primaryBtnClass} mt-6`}>
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
            </button>
          </form>
        )}

        {/* VIEW: COMPLETE GOOGLE PROFILE */}
        {view === 'complete' && (
          <form onSubmit={handleCompleteProfile} className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Full Name</label>
              <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} className={glassInputClass} />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Phone Number *</label>
              <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} placeholder="e.g. +94 77 123 4567" className={glassInputClass} />
            </div>
            <button type="submit" disabled={isLoading || !formData.phone} className={`${primaryBtnClass} mt-4`}>
              {isLoading ? 'Saving...' : 'Save & Enter Portal'}
            </button>
          </form>
        )}

      </div>
      <style dangerouslySetInnerHTML={{__html: `@keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }`}} />
    </main>
  );
}