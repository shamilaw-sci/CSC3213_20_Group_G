// 'use client';

// import { supabase } from '@/lib/supabase';

// export default function LoginPage() {

//   const handleLogin = async () => {
//     await supabase.auth.signInWithOAuth({
//       provider: 'google',
//       options: {
//         redirectTo: 'https://bsrhrbijqiviwohuaigy.supabase.co/auth/v1/callback',
//       },
//     });
//   };

//   return (
//     <div className="flex items-center justify-center h-screen">
//       <button
//         onClick={handleLogin}
//         className="bg-red-500 text-white px-6 py-3 rounded-lg"
//       >
//         Continue with Google
//       </button>
//     </div>
//   );
//}
'use client';

import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const login = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    });
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <button
        onClick={login}
      //   className="flex items-center gap-3 bg-white border border-gray-200 px-6 py-3 rounded-xl shadow-[var(--shadow-kandyan-soft)] hover:shadow-[var(--shadow-kandyan-hover)] transition-all font-semibold text-gray-700 hover:scale-105"
      // >
      //   Continue with Google
       className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 px-6 py-3 rounded-xl shadow-[var(--shadow-kandyan-soft)] hover:shadow-[var(--shadow-kandyan-hover)] transition-all font-semibold text-gray-700 hover:scale-105"
      >
        <img
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="google"
          className="w-5 h-5"
        />
        Log in with Google
      </button>
    </div>
  );
}