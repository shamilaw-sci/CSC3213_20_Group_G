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

export default function EditProfile() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Sri Lanka');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const currentDialCode = useMemo(() => {
    return COUNTRY_DATA.find(c => c.name === country)?.code || '+';
  }, [country]);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();

      if (!currentUser) {
        router.push('/login');
        return;
      }

      setUser(currentUser);
      setEmail(currentUser.email || '');

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();

      if (error || !profileData) {
        setErrorMsg('Failed to load profile');
        setIsLoading(false);
        return;
      }

      setFullName(profileData.full_name || '');
      setPhone(profileData.phone || '');
      setCountry(profileData.country || 'Sri Lanka');
      setAvatarPreview(profileData.avatar_url || '');
      setIsLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB');
      return;
    }

    setAvatarFile(file);
    const preview = URL.createObjectURL(file);
    setAvatarPreview(preview);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || fullName.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters');
      return;
    }

    setIsSaving(true);

    try {
      let avatarUrl = avatarPreview;

      // Upload new avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) {
          setErrorMsg('Failed to upload avatar: ' + uploadError.message);
          setIsSaving(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // Extract phone number without dial code
      const phoneNumber = phone.replace(currentDialCode, '').trim();
      const fullPhoneNumber = phoneNumber ? `${currentDialCode}${phoneNumber}` : '';

      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: fullName.trim(),
          phone: fullPhoneNumber,
          country: country,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (updateError) {
        setErrorMsg('Failed to update profile: ' + updateError.message);
        setIsSaving(false);
        return;
      }

      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => {
        router.push('/profile');
      }, 1500);
    } catch (error: any) {
      setErrorMsg('An error occurred: ' + error.message);
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // --- REUSABLE GLASS CLASSES ---
  const glassInputClass = "w-full bg-white/50 backdrop-blur-md border border-white/80 text-slate-900 text-sm rounded-2xl px-4 py-3.5 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition-all shadow-sm placeholder:text-slate-400 font-medium";

  return (
    <main className="relative min-h-screen pt-32 md:pt-40 pb-24 px-4 sm:px-8 bg-[#F8F9FA]">
      
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        <div className="bg-white/60 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] border border-white/80 overflow-hidden p-8 sm:p-12">

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 tracking-tight">Edit Profile</h1>
          <p className="text-slate-500 font-medium mb-8">Update your profile information and avatar.</p>

          {errorMsg && (
            <div className="mb-8 bg-rose-50/80 backdrop-blur-sm border border-rose-200 text-rose-600 px-4 py-3 rounded-xl text-sm font-bold shadow-sm">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-8 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl text-sm font-bold shadow-sm">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Avatar Upload */}
            <div className="bg-white/40 p-6 rounded-[2rem] border border-white/80 shadow-sm">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4 block">
                Profile Picture
              </label>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {avatarPreview ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.25rem] object-cover bg-white shadow-sm border border-white/80 shrink-0"
                  />
                ) : (
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.25rem] bg-white/60 flex items-center justify-center text-slate-300 shadow-sm border border-white/80 shrink-0">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                  </div>
                )}
                <div className="flex-1 w-full text-center sm:text-left mt-2 sm:mt-0">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200 cursor-pointer file:transition-colors focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-3 font-bold uppercase tracking-widest">Max 5MB, JPG/PNG</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 block">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={glassInputClass}
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 block">
                  Email <span className="text-[8px] font-medium lowercase">(Read Only)</span>
                </label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full bg-slate-100/50 backdrop-blur-sm border border-slate-200/50 py-3.5 px-4 rounded-2xl text-slate-400 cursor-not-allowed text-sm font-medium"
                />
              </div>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 block">
                Country
              </label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className={`${glassInputClass} appearance-none pr-10 cursor-pointer`}
                >
                  {COUNTRY_DATA.map((c) => (
                    <option key={c.name} value={c.name} className="bg-white">
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest pl-1 block">
                Phone Number
              </label>
              <div className="flex w-full bg-white/50 backdrop-blur-md border border-white/80 rounded-2xl focus-within:ring-2 focus-within:ring-amber-400 focus-within:border-amber-400 transition-all shadow-sm overflow-hidden">
                <div className="flex items-center justify-center px-4 border-r border-white/60 bg-white/40">
                  <span className="text-slate-900 font-bold text-sm sm:text-base">{currentDialCode}</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-3.5 px-4 bg-transparent text-slate-900 focus:outline-none font-medium text-sm placeholder:text-slate-400"
                  placeholder="123 456 7890"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-white/60">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-8 py-4 bg-white/60 hover:bg-white text-slate-700 border border-white/80 font-bold rounded-2xl transition-all shadow-sm text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-8 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(217,119,6,0.25)] hover:shadow-[0_12px_25px_rgba(217,119,6,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-50 text-sm"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}