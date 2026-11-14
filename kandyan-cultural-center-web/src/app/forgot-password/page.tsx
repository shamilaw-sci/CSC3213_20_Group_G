'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function ForgotPasswordPage() {
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

  // Request otp
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

  // Verify
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
      setStep('reset'); // Verification succeeded, can reset
    }
  };

  // Update to the New Password
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
      // Password updated successfully.. Send them back to login.
      window.location.href = '/login';
    }
  };

  const glassInputClass = "w-full bg-white/50 backdrop-blur-md border border-white/80 text-slate-900 text-sm rounded-2xl px-4 py-3.5 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition-all shadow-sm placeholder:text-slate-400 font-medium";
  const primaryBtnClass = "w-full bg-amber-600 hover:bg-amber-500 text-white py-3.5 sm:py-4 rounded-[1.25rem] font-bold text-sm sm:text-base transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <main className="relative min-h-screen flex flex-col justify-center items-center px-4 sm:px-8 pt-32 md:pt-40 pb-12 bg-[#F8F9FA]">
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] p-8 sm:p-10 flex flex-col">
        
        <div className="text-center space-y-3 mb-8">
          <div className="w-16 h-16 rounded-[1.25rem] bg-amber-100 text-amber-600 border border-amber-200/50 flex items-center justify-center mx-auto shadow-sm">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-4">
              {step === 'request' && 'Reset Password'}
              {step === 'verify' && 'Check Your Email'}
              {step === 'reset' && 'Create New Password'}
            </h1>
            <p className="text-slate-500 mt-2 font-medium text-sm">
              {step === 'request' && 'Enter your email to receive a recovery code.'}
              {step === 'verify' && `We sent a 6-digit code to ${email}`}
              {step === 'reset' && 'Please enter your new secure password.'}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-rose-50/80 backdrop-blur-sm border border-rose-200 text-rose-600 text-xs font-bold px-4 py-3 rounded-xl text-center shadow-sm">
            {errorMsg}
          </div>
        )}

        {/* step 1: request otp */}
        {step === 'request' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
            <form onSubmit={handleRequestReset} className="space-y-6">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Email Address</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={glassInputClass} />
              </div>
              <button type="submit" disabled={isLoading || !email} className={primaryBtnClass}>
                {isLoading ? 'Sending...' : 'Send Recovery Code'}
              </button>
            </form>
            <p className="text-center text-sm font-medium text-slate-500 pt-2">
              Remember your password? <Link href="/login" className="text-amber-600 font-extrabold hover:underline">Log in</Link>
            </p>
          </div>
        )}

        {/* step 2: verify otp */}
        {step === 'verify' && (
          <form onSubmit={handleVerifyOTP} className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div>
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-2 block text-center">6-Digit Code</label>
              <input type="text" maxLength={6} required value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full bg-white/70 backdrop-blur-md border border-white/80 text-slate-900 text-3xl tracking-[0.5em] text-center font-mono font-black rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner" placeholder="••••••" />
            </div>
            <button type="submit" disabled={isLoading || otp.length < 6} className={primaryBtnClass}>
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}

        {/* step 3: reset password */}
        {step === 'reset' && (
          <form onSubmit={handleUpdatePassword} className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">New Password</label>
                <input type="password" minLength={6} required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={glassInputClass} />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 mb-1 block">Confirm Password</label>
                <input type="password" minLength={6} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className={glassInputClass} />
              </div>
            </div>
            <button type="submit" disabled={isLoading || !newPassword || !confirmPassword} className={primaryBtnClass}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

      </div>
    </main>
  );
}