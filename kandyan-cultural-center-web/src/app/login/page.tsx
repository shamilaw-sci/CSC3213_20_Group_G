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
        className="bg-red-600 text-white px-6 py-3 rounded"
      >
        Continue with Google
      </button>
    </div>
  );
}