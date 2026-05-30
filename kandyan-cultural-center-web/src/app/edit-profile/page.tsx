'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';

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
      <div className="h-screen flex items-center justify-center text-slate-500 font-bold">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-kandyan-bg)] py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-[var(--shadow-kandyan-soft)] overflow-hidden p-8 sm:p-12">

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">Edit Profile</h1>
          <p className="text-slate-500 mb-8">Update your profile information</p>

          {errorMsg && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-kandyan-maroon px-4 py-3 rounded-xl text-sm font-medium">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Avatar Upload */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 block">
                Profile Picture
              </label>
              <div className="flex flex-col sm:flex-row gap-6">
                {avatarPreview && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-24 h-24 rounded-full object-cover bg-slate-100"
                  />
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-[var(--color-kandyan-gold)] file:text-white hover:file:bg-[var(--color-kandyan-gold-dark)] cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 mt-2">Max 5MB, JPG/PNG</p>
                </div>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-transparent border-b border-slate-300 py-2 sm:py-3 focus:outline-none focus:border-kandyan-gold text-slate-900"
                placeholder="John Doe"
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                Email
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-slate-50 border-b border-slate-300 py-2 sm:py-3 focus:outline-none text-slate-600 cursor-not-allowed"
              />
              <p className="text-xs text-slate-400 mt-2">Email cannot be changed</p>
            </div>

            {/* Country */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                Country
              </label>
              <div className="relative">
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-transparent border-b border-slate-300 py-2 sm:py-3 focus:outline-none focus:border-kandyan-gold text-slate-900 appearance-none pr-8"
                >
                  {COUNTRY_DATA.map((c) => (
                    <option key={c.code} value={c.name}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
                <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 block">
                Phone Number
              </label>
              <div className="flex w-full bg-transparent border-b border-slate-300 focus-within:border-kandyan-gold">
                <div className="flex items-center pr-3 border-r border-slate-300 py-2 sm:py-3">
                  <span className="text-slate-900 font-medium">{currentDialCode}</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2 sm:py-3 pl-3 bg-transparent focus:outline-none text-slate-900"
                  placeholder="123 456 7890"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-8">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-8 py-4 border-2 border-slate-300 text-slate-900 font-bold rounded-xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 px-8 py-4 bg-[var(--color-kandyan-maroon)] hover:bg-[var(--color-kandyan-maroon-dark)] text-white font-bold rounded-xl shadow-[var(--shadow-kandyan-button)] transition-all disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
