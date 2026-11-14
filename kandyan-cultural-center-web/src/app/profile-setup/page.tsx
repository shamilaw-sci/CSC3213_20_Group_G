'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const COUNTRY_DATA = [
  { name: "Afghanistan", code: "+93" }, { name: "Albania", code: "+355" }, { name: "Algeria", code: "+213" },
  { name: "Andorra", code: "+355" }, { name: "Angola", code: "+213" }, { name: "Argentina", code: "+244" },
  { name: "Armenia", code: "+374" }, { name: "Australia", code: "+61" }, { name: "Austria", code: "+43" },
  { name: "Azerbaijan", code: "+994" }, { name: "Bahamas", code: "+1242" }, { name: "Bahrain", code: "+973" },
  { name: "Bangladesh", code: "+973" }, { name: "Barbados", code: "+1246" }, { name: "Belarus", code: "+375" },
  { name: "Belgium", code: "+32" }, { name: "Belize", code: "+1242" }, { name: "Benin", code: "+229" },
  { name: "Bhutan", code: "+880" }, { name: "Bolivia", code: "+591" }, { name: "Bosnia and Herzegovina", code: "+387" },
  { name: "Botswana", code: "+267" }, { name: "Brazil", code: "+54" }, { name: "Brunei", code: "+673" },
  { name: "Bulgaria", code: "+32" }, { name: "Burkina Faso", code: "+226" }, { name: "Burundi", code: "+257" },
  { name: "Cambodia", code: "+855" }, { name: "Cameroon", code: "+237" }, { name: "Canada", code: "+1" },
  { name: "Cape Verde", code: "+238" }, { name: "Central African Republic", code: "+236" }, { name: "Chad", code: "+235" },
  { name: "Chile", code: "+56" }, { name: "China", code: "+86" }, { name: "Colombia", code: "+57" },
  { name: "Comoros", code: "+269" }, { name: "Congo", code: "+242" }, { name: "Costa Rica", code: "+506" },
  { name: "Croatia", code: "+385" }, { name: "Cuba", code: "+53" }, { name: "Cyprus", code: "+357" },
  { name: "Czech Republic", code: "+385" }, { name: "Denmark", code: "+420" }, { name: "Djibouti", code: "+253" },
  { name: "Dominican Republic", code: "+1809" }, { name: "Ecuador", code: "+593" }, { name: "Egypt", code: "+20" },
  { name: "El Salvador", code: "+503" }, { name: "Equatorial Guinea", code: "+240" }, { name: "Eritrea", code: "+291" },
  { name: "Estonia", code: "+45" }, { name: "Ethiopia", code: "+251" }, { name: "Fiji", code: "+679" },
  { name: "Finland", code: "+358" }, { name: "France", code: "+33" }, { name: "Gabon", code: "+241" },
  { name: "Gambia", code: "+220" }, { name: "Georgia", code: "+995" }, { name: "Germany", code: "+49" },
  { name: "Ghana", code: "+233" }, { name: "Greece", code: "+30" }, { name: "Guatemala", code: "+502" },
  { name: "Guinea", code: "+224" }, { name: "Haiti", code: "+509" }, { name: "Honduras", code: "+504" },
  { name: "Hungary", code: "+36" }, { name: "Iceland", code: "+354" }, { name: "India", code: "+91" },
  { name: "Indonesia", code: "+62" }, { name: "Iran", code: "+98" }, { name: "Iraq", code: "+98" },
  { name: "Ireland", code: "+353" }, { name: "Israel", code: "+972" }, { name: "Italy", code: "+39" },
  { name: "Jamaica", code: "+1876" }, { name: "Japan", code: "+81" }, { name: "Jordan", code: "+962" },
  { name: "Kazakhstan", code: "+7" }, { name: "Kenya", code: "+254" }, { name: "Kuwait", code: "+965" },
  { name: "Kyrgyzstan", code: "+7" }, { name: "Laos", code: "+856" }, { name: "Latvia", code: "+371" },
  { name: "Lebanon", code: "+961" }, { name: "Lesotho", code: "+266" }, { name: "Liberia", code: "+231" },
  { name: "Libya", code: "+218" }, { name: "Lithuania", code: "+370" }, { name: "Luxembourg", code: "+352" },
  { name: "Madagascar", code: "+261" }, { name: "Malawi", code: "+265" }, { name: "Malaysia", code: "+60" },
  { name: "Maldives", code: "+960" }, { name: "Mali", code: "+223" }, { name: "Malta", code: "+356" },
  { name: "Mauritania", code: "+222" }, { name: "Mauritius", code: "+230" }, { name: "Mexico", code: "+52" },
  { name: "Moldova", code: "+373" }, { name: "Monaco", code: "+377" }, { name: "Mongolia", code: "+976" },
  { name: "Montenegro", code: "+382" }, { name: "Morocco", code: "+212" }, { name: "Mozambique", code: "+258" },
  { name: "Myanmar", code: "+95" }, { name: "Namibia", code: "+264" }, { name: "Nepal", code: "+977" },
  { name: "Netherlands", code: "+31" }, { name: "New Zealand", code: "+64" }, { name: "Nicaragua", code: "+505" },
  { name: "Niger", code: "+227" }, { name: "Nigeria", code: "+234" }, { name: "North Korea", code: "+850" },
  { name: "Norway", code: "+47" }, { name: "Oman", code: "+968" }, { name: "Pakistan", code: "+92" },
  { name: "Panama", code: "+507" }, { name: "Papua New Guinea", code: "+675" }, { name: "Paraguay", code: "+507" },
  { name: "Peru", code: "+51" }, { name: "Philippines", code: "+63" }, { name: "Poland", code: "+48" },
  { name: "Portugal", code: "+351" }, { name: "Qatar", code: "+974" }, { name: "Romania", code: "+48" },
  { name: "Russia", code: "+7" }, { name: "Rwanda", code: "+250" }, { name: "Saudi Arabia", code: "+966" },
  { name: "Senegal", code: "+221" }, { name: "Serbia", code: "+381" }, { name: "Singapore", code: "+65" },
  { name: "Slovakia", code: "+421" }, { name: "Slovenia", code: "+386" }, { name: "Somalia", code: "+221" },
  { name: "South Africa", code: "+27" }, { name: "South Korea", code: "+82" }, { name: "Spain", code: "+34" },
  { name: "Sri Lanka", code: "+94" }, { name: "Sudan", code: "+249" }, { name: "Sweden", code: "+46" },
  { name: "Switzerland", code: "+41" }, { name: "Syria", code: "+963" }, { name: "Taiwan", code: "+886" },
  { name: "Tajikistan", code: "+992" }, { name: "Tanzania", code: "+255" }, { name: "Thailand", code: "+66" },
  { name: "Togo", code: "+228" }, { name: "Tunisia", code: "+216" }, { name: "Turkey", code: "+34" },
  { name: "Turkmenistan", code: "+993" }, { name: "Uganda", code: "+256" }, { name: "Ukraine", code: "+380" },
  { name: "United Arab Emirates", code: "+971" }, { name: "United Kingdom", code: "+44" }, { name: "United States", code: "+1" },
  { name: "Uruguay", code: "+598" }, { name: "Uzbekistan", code: "+998" }, { name: "Venezuela", code: "+58" },
  { name: "Vietnam", code: "+84" }, { name: "Yemen", code: "+967" }, { name: "Zambia", code: "+260" },
  { name: "Zimbabwe", code: "+263" }
].sort((a, b) => a.name.localeCompare(b.name)); 

export default function ProfileSetup() {
  const router = useRouter();
  
  // User & Form State
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  
  // Verification State
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const currentDialCode = useMemo(() => {
    return COUNTRY_DATA.find(c => c.name === country)?.code || '+';
  }, [country]);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        router.push('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, full_name')
        .eq('id', currentUser.id)
        .single();

      if (profile && profile.phone && profile.full_name) {
        router.push('/'); 
        return;
      }

      setUser(currentUser);
      setName(currentUser.user_metadata?.name || currentUser.user_metadata?.full_name || '');
      setIsLoading(false);
    };

    loadUser();
  }, [router]);

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    const cleanPhone = phone.replace(/^0+/, '');
    const formattedPhone = `${currentDialCode}${cleanPhone}`;

    const { error } = await supabase.auth.updateUser({
      phone: formattedPhone
    });

    setIsSaving(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setStep('verify');
    }
  };

  const handleVerifyAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    const cleanPhone = phone.replace(/^0+/, '');
    const formattedPhone = `${currentDialCode}${cleanPhone}`;

    const { error: verifyError } = await supabase.auth.verifyOtp({
      type: 'phone_change',
      phone: formattedPhone,
      token: otp
    });

    if (verifyError) {
      setErrorMsg(verifyError.message);
      setIsSaving(false);
      return;
    }

    const { error: dbError } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: name,
      phone: formattedPhone,
      country: country,
      avatar_url: user.user_metadata?.avatar_url,
    });

    setIsSaving(false);

    if (dbError) {
      setErrorMsg("Profile saved, but database error: " + dbError.message);
    } else {
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const glassInputClass = "w-full bg-white/50 backdrop-blur-md border border-white/80 text-slate-900 text-sm sm:text-base rounded-2xl px-4 py-3.5 sm:py-4 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition-all shadow-sm placeholder:text-slate-400 font-medium";
  const primaryBtnClass = "w-full bg-amber-600 hover:bg-amber-500 text-white py-3.5 sm:py-4 rounded-[1.25rem] font-bold text-sm sm:text-base transition-all shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <main className="relative min-h-screen flex flex-col justify-center items-center p-24 md:pt-32 sm:p-8 bg-[#F8F9FA]">
      
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-xl bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] p-8 sm:p-12">
        
        <div className="text-center mb-8 sm:mb-10">
          <div className="w-16 h-16 rounded-[1.25rem] bg-amber-100 text-amber-600 border border-amber-200/50 flex items-center justify-center mx-auto shadow-sm mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">Complete Profile</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-3 font-medium">Just a few more details to secure your account.</p>
        </div>

        {errorMsg && (
          <div className="mb-8 bg-rose-50/80 backdrop-blur-sm border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold text-center shadow-sm">
            {errorMsg}
          </div>
        )}

        {step === 'details' ? (
          /* step 1: enter details */
          <form onSubmit={handleSendVerification} className="space-y-6 sm:space-y-7">
            
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className={glassInputClass}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-widest pl-1">Country</label>
              <div className="relative">
                <select
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={`${glassInputClass} appearance-none pr-10 cursor-pointer`}
                >
                  {COUNTRY_DATA.map((c) => (
                    <option key={c.name} value={c.name} className="bg-white">{c.name}</option>
                  ))}
                </select>
                <svg className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-widest pl-1">Mobile Number</label>
              <div className={`flex w-full bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition-all shadow-sm overflow-hidden`}>
                <div className="flex items-center justify-center px-4 border-r border-white/60 bg-white/40">
                  <span className="text-slate-900 font-bold text-sm sm:text-base">{currentDialCode}</span>
                </div>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={country === 'Sri Lanka' ? "77 123 4567" : "123 456 7890"}
                  className="w-full py-3.5 sm:py-4 px-4 bg-transparent text-slate-900 focus:outline-none font-medium text-sm sm:text-base placeholder:text-slate-400"
                />
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold pt-1 pl-1">We will send a secure OTP to verify this number.</p>
            </div>

            <button type="submit" className={`${primaryBtnClass} mt-4`} disabled={isSaving}>
              {isSaving ? 'Sending OTP...' : 'Send Verification Code'}
            </button>
          </form>

        ) : (

          /* step 2: verify otp */
          <form onSubmit={handleVerifyAndSave} className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="text-center mb-6">
              <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                We sent a 6-digit code to <br/>
                <span className="font-black text-slate-900 text-lg bg-white/60 px-3 py-1 rounded-lg border border-white shadow-sm inline-block mt-2">
                  {currentDialCode} {phone.replace(/^0+/, '')}
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <input 
                required
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-white/70 backdrop-blur-md border border-white/80 py-4 sm:py-5 rounded-2xl text-slate-900 text-center text-3xl sm:text-4xl tracking-[0.4em] sm:tracking-[0.6em] font-black focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition-all shadow-inner" 
                placeholder="••••••" 
              />
            </div>

            <div className="space-y-4 pt-4">
              <button type="submit" className={primaryBtnClass} disabled={isSaving || otp.length < 6}>
                {isSaving ? 'Verifying & Saving...' : 'Verify & Complete Profile'}
              </button>
              
              <button 
                type="button" 
                onClick={() => { setStep('details'); setErrorMsg(''); }} 
                className="w-full text-xs font-bold text-slate-500 hover:text-amber-600 transition-colors py-2"
              >
                Change mobile number
              </button>
            </div>
          </form>
        )}

      </div>
    </main>
  );
}