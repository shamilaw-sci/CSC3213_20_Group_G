'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const verifyAdmin = async () => {
      // 1. Check if logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      // 2. Check if the user is an admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (!profile?.is_admin) {
        // Intruder! Kick them to the homepage
        router.push('/');
        return;
      }

      // 3. User is verified!
      setIsAuthorized(true);
      setIsLoading(false);
    };

    verifyAdmin();
  }, [router]);

  // Light theme loading screen
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
          <p className="text-amber-600 font-bold tracking-widest uppercase text-sm">Verifying Admin...</p>
        </div>
      </div>
    );
  }

  // Prevent rendering children if not authorized
  if (!isAuthorized) return null;

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden relative">
      
      {/* --- FIXED BACKGROUND FOR GLASS BLUR EFFECT --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-[#F8F9FA] to-rose-50 opacity-80"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-amber-200/30 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-rose-200/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Mobile Backdrop Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation (Glassmorphism) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white/70 backdrop-blur-2xl border-r border-white/80 text-slate-600 flex flex-col shadow-[20px_0_50px_rgba(31,38,135,0.03)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 lg:h-20 flex items-center justify-between px-6 lg:px-8 border-b border-white/60 shrink-0 bg-white/40">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-[0.6rem] bg-amber-100 flex items-center justify-center text-amber-600 font-black text-sm shadow-sm border border-amber-200/50">K</div>
             <span className="text-slate-900 font-extrabold tracking-widest uppercase text-sm">Admin</span>
          </div>
          {/* Close button for mobile */}
          <button 
            className="lg:hidden text-slate-400 hover:text-rose-600 p-2 bg-white/50 rounded-full shadow-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 lg:py-8 space-y-2 overflow-y-auto no-scrollbar">
          <SidebarLink href="/admin" icon="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" label="Dashboard" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="pt-6 pb-2">
            <p className="px-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">E-commerce</p>
          </div>
          <SidebarLink href="/admin/orders" icon="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" label="Orders & POS" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarLink href="/admin/inventory" icon="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" label="Inventory" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarLink href="/admin/reports" icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" label="Financial Reports" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="pt-6 pb-2">
            <p className="px-4 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Facilities</p>
          </div>
          <SidebarLink href="/admin/hall-bookings" icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" label="Hall Bookings" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
          <SidebarLink href="/admin/workshops" icon="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" label="Workshops" pathname={pathname} onClick={() => setIsMobileMenuOpen(false)} />
        </nav>

        <div className="p-4 border-t border-white/60 shrink-0 bg-white/40">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/50 hover:bg-white border border-transparent hover:border-white/80 transition-all text-sm font-bold text-slate-700 hover:text-amber-600 shadow-sm">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Mobile Header Bar (Glassmorphism) */}
        <header className="lg:hidden flex items-center justify-between bg-white/60 backdrop-blur-md border-b border-white/80 px-4 h-16 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 font-black text-sm shadow-sm border border-amber-200/50">K</div>
             <span className="text-slate-900 font-extrabold tracking-widest uppercase text-sm">Admin Panel</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="text-slate-500 hover:text-amber-600 focus:outline-none p-2 -mr-2 bg-white/60 rounded-xl border border-white/80 shadow-sm transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto relative no-scrollbar">
          {children}
        </main>

      </div>
    </div>
  );
}

// Updated SidebarLink to match Light Glass Theme
function SidebarLink({ href, icon, label, pathname, onClick }: { href: string, icon: string, label: string, pathname: string | null, onClick: () => void }) {
  const isActive = href === '/admin' ? pathname === href : pathname?.startsWith(href);

  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-bold shadow-sm border ${
        isActive 
          ? 'bg-amber-500 text-white border-amber-400 shadow-[0_4px_10px_rgba(217,119,6,0.3)]' 
          : 'bg-transparent border-transparent hover:bg-white hover:border-white/80 hover:text-amber-600 text-slate-600'
      }`}
    >
      <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? "2.5" : "2"} d={icon}></path>
      </svg>
      {label}
    </Link>
  );
}