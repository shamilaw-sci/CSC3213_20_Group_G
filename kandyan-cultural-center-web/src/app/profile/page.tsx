// 'use client';

// import { useEffect, useState } from 'react';
// import { supabase } from '@/lib/supabase';

// export default function Profile() {
//   const [profile, setProfile] = useState<any>(null);

//   useEffect(() => {
//     const load = async () => {
//       const { data: userData } = await supabase.auth.getUser();

//       const { data } = await supabase
//         .from('profiles')
//         .select('*')
//         .eq('id', userData.user?.id)
//         .single();

//       setProfile(data);
//     };

//     load();
//   }, []);

//   if (!profile) return <p>Loading...</p>;

//   return (
//     <div className="p-10">
//       <h1 className="text-2xl font-bold mb-4">My Profile</h1>

//       <p><b>Name:</b> {profile.name}</p>
//       <p><b>Email:</b> {profile.email}</p>
//       <p><b>Phone:</b> {profile.phone}</p>
//     </div>
//   );
// }
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) return;

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userData.user.id)
        .single();

      setProfile(data);
    };

    load();
  }, []);

  if (!profile) return <p>Loading profile...</p>;

  return (
    <div className="p-10">
      <h1>My Profile</h1>

      <p>Name: {profile.full_name}</p>
      <p>Email: {profile.email}</p>
      <p>Phone: {profile.phone}</p>
    </div>
  );
}