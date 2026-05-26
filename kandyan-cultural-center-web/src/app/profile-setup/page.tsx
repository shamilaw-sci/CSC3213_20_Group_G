'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

// --- COMPREHENSIVE COUNTRY & DIAL CODE LIST ---
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
].sort((a, b) => a.name.localeCompare(b.name)); // Ensures perfect alphabetical order

export default function ProfileSetup() {
  const router = useRouter();
  
  // --- User & Form State ---
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  
  // --- Verification State ---
  const [step, setStep] = useState<'details' | 'verify'>('details');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Automatically derive the correct dial code based on the selected country
  const currentDialCode = useMemo(() => {
    return COUNTRY_DATA.find(c => c.name === country)?.code || '+';
  }, [country]);

  // 1. Load the user from Google Auth
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        router.push('/login');
        return;
      }

      // NEW BOUNCER LOGIC: Check if they are already fully set up
      const { data: profile } = await supabase
        .from('profiles')
        .select('phone, full_name')
        .eq('id', currentUser.id)
        .single();

      if (profile && profile.phone && profile.full_name) {
        router.push('/'); // Kick them back to the homepage
        return;
      }

      setUser(currentUser);
      setName(currentUser.user_metadata?.name || currentUser.user_metadata?.full_name || '');
      setIsLoading(false);
    };

    loadUser();
  }, [router]);

  // 2. Step One: Send the SMS Verification Code
  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    // Strip leading zeros from the phone input and prepend the dial code
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

  // 3. Step Two: Verify Code & Save Profile
  const handleVerifyAndSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg('');

    const cleanPhone = phone.replace(/^0+/, '');
    const formattedPhone = `${currentDialCode}${cleanPhone}`;

    // A. Verify the code
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

    // B. Save to Database
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-kandyan-gold rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-kandyan-gold selection:text-white">
      
      {/* Background Soft Orbs */}
      <div className="absolute top-0 right-0 w-64 sm:w-[500px] h-64 sm:h-[500px] bg-amber-400/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 sm:w-[500px] h-64 sm:h-[500px] bg-rose-700/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Main Card (Mobile optimized padding) */}
      <div className="w-full max-w-xl bg-white rounded-[2rem] p-6 sm:p-10 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 relative z-10">
        
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Complete Profile</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-2 font-light">Just a few more details to set up your account.</p>
        </div>

        {errorMsg && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-kandyan-maroon px-4 py-3 rounded-xl text-sm font-medium text-center">
            {errorMsg}
          </div>
        )}

        {step === 'details' ? (
          /* --- STEP 1: ENTER DETAILS --- */
          <form onSubmit={handleSendVerification} className="space-y-6 sm:space-y-8">
            
            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-transparent border-b border-slate-300 py-2 sm:py-3 text-slate-900 focus:outline-none focus:border-kandyan-gold transition-colors font-medium text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Country</label>
              <div className="relative">
                <select
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 py-2 sm:py-3 text-slate-900 focus:outline-none focus:border-kandyan-gold transition-colors font-medium text-sm sm:text-base cursor-pointer appearance-none pr-8"
                >
                  {COUNTRY_DATA.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {/* Custom modern chevron for the dropdown */}
                <svg className="w-4 h-4 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
              {/* Flex wrapper allows variable width dial codes to fit perfectly */}
              <div className="flex w-full bg-transparent border-b border-slate-300 focus-within:border-kandyan-gold transition-colors group">
                <div className="flex items-center justify-center pr-3 border-r border-slate-300 mr-3 py-2 sm:py-3">
                  <span className="text-slate-900 font-bold text-sm sm:text-base tracking-wide">{currentDialCode}</span>
                </div>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={country === 'Sri Lanka' ? "77 123 4567" : "123 456 7890"}
                  className="w-full py-2 sm:py-3 bg-transparent text-slate-900 focus:outline-none font-medium tracking-wide text-sm sm:text-base"
                />
              </div>
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium pt-1">We will send a secure OTP to verify this number.</p>
            </div>

            <Button variant="primary" type="submit" className="w-full rounded-full !py-3.5 sm:!py-4 mt-2 sm:mt-4 text-sm sm:text-base" disabled={isSaving}>
              {isSaving ? 'Sending OTP...' : 'Send Verification Code'}
            </Button>
          </form>

        ) : (

          /* --- STEP 2: VERIFY OTP --- */
          <form onSubmit={handleVerifyAndSave} className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-right-4">
            <div className="text-center mb-2">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-amber-50 rounded-full flex items-center justify-center text-kandyan-gold mx-auto mb-4">
                <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">We sent a 6-digit code to <br/><span className="font-bold text-slate-900">{currentDialCode} {phone.replace(/^0+/, '')}</span></p>
            </div>

            <div className="space-y-2 px-4 sm:px-8">
              <input 
                required
                type="text" 
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-transparent border-b-2 border-slate-300 py-2 sm:py-3 text-slate-900 text-center text-2xl sm:text-3xl tracking-[0.3em] sm:tracking-[0.5em] font-black focus:outline-none focus:border-kandyan-gold transition-colors" 
                placeholder="••••••" 
              />
            </div>

            <div className="space-y-3 pt-2">
              <Button variant="primary" type="submit" className="w-full rounded-full !py-3.5 sm:!py-4 text-sm sm:text-base" disabled={isSaving}>
                {isSaving ? 'Verifying & Saving...' : 'Verify & Complete Profile'}
              </Button>
              
              <button 
                type="button" 
                onClick={() => { setStep('details'); setErrorMsg(''); }} 
                className="w-full text-[10px] sm:text-xs font-bold text-slate-400 hover:text-kandyan-maroon transition-colors py-2"
              >
                Change mobile number
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}