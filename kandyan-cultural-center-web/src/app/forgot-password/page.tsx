'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  // Navigation State
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request');
  
  // Data State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Request Reset OTP
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setStep('verify');
    }
  };

  // 2. Verify the 6-digit OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'recovery',
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else {
      setIsLoading(false);
      setStep('reset'); // Verification succeeded, user is now "authenticated" to reset
    }
  };

  // 3. Update to the New Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setErrorMsg("Passwords do not match.");
    }
    
    setIsLoading(true);
    setErrorMsg(null);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setErrorMsg(error.message);
      setIsLoading(false);
    } else {
      // Password updated successfully! Send them back to login or home.
      window.location.href = '/login';
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
            Secure <br/><span className="text-kandyan-gold font-serif italic font-light">Recovery</span>
          </h2>
          <div className="w-12 h-1 bg-white/20 mb-6"></div>
          <p className="text-white/80 text-lg max-w-md font-light leading-relaxed">
            Regain access to your account securely to continue your journey through Kandyan heritage.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Portal */}
      <div className="flex flex-col justify-center items-center p-8 lg:p-24 relative overflow-y-auto">
        <Link href="/login" className="absolute top-8 left-8 lg:top-12 lg:left-12 text-slate-400 hover:text-kandyan-maroon transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-widest group">
          <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Login
        </Link>

        <div className="w-full max-w-sm space-y-8 py-10">
          
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-kandyan-gold text-white flex items-center justify-center font-black text-3xl mx-auto shadow-lg shadow-amber-500/30">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-6">
                {step === 'request' && 'Reset Password'}
                {step === 'verify' && 'Check Your Email'}
                {step === 'reset' && 'Create New Password'}
              </h1>
              <p className="text-slate-500 mt-2 font-light text-sm">
                {step === 'request' && 'Enter your email to receive a recovery code.'}
                {step === 'verify' && `We sent a 6-digit code to ${email}`}
                {step === 'reset' && 'Please enter your new secure password.'}
              </p>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 text-xs font-medium p-4 rounded-xl text-center">
              {errorMsg}
            </div>
          )}

          {/* STEP 1: REQUEST OTP */}
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
              </div>
              <button type="submit" disabled={isLoading || !email} className="w-full bg-slate-900 text-white py-3.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-md mt-2 disabled:opacity-50">
                {isLoading ? 'Sending...' : 'Send Recovery Code'}
              </button>
            </form>
          )}

          {/* STEP 2: VERIFY OTP */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">6-Digit Code</label>
                <input type="text" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full bg-white border border-slate-200 text-slate-900 text-2xl tracking-[0.5em] text-center font-mono font-black rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" placeholder="000000" />
              </div>
              <button type="submit" disabled={isLoading || otp.length < 6} className="w-full bg-kandyan-gold text-white py-3.5 rounded-full font-bold text-sm hover:bg-amber-600 transition-all shadow-md mt-4 disabled:opacity-50">
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 'reset' && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">New Password</label>
                <input type="password" minLength={6} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-1 block">Confirm Password</label>
                <input type="password" minLength={6} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-kandyan-gold" />
              </div>
              <button type="submit" disabled={isLoading || !newPassword || !confirmPassword} className="w-full bg-slate-900 text-white py-3.5 rounded-full font-bold text-sm hover:bg-slate-800 transition-all shadow-md mt-4 disabled:opacity-50">
                {isLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}