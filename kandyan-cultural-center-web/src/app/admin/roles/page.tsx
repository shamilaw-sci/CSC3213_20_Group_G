'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'super_admin' | 'admin' | 'cashier' | 'customer';
};

export default function RoleManagementPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Auth State
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile) setCurrentUserRole(profile.role);
      }
      fetchUsers('');
    };
    initAuth();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchUsers(searchTerm);
    }, 400); 
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const fetchUsers = async (search = '') => {
    setIsLoading(true);
    let query = supabase
      .from('profiles')
      .select('id, full_name, email, phone, role')
      .order('full_name', { ascending: true })
      .limit(50);

    if (search.trim()) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
    } else {
      query = query.in('role', ['super_admin', 'admin', 'cashier']);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching users:', error.message || error);
    } else {
      setUsers(data as Profile[]);
    }
    setIsLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (userId === currentUserId) {
      alert("You cannot change your own role.");
      return;
    }

    const confirmChange = window.confirm(`Are you sure you want to change this user's role to ${newRole.toUpperCase()}?`);
    if (!confirmChange) return;

    setUpdatingId(userId);

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert(`Failed to update role: ${error.message}`);
    } else {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    }
    
    setUpdatingId(null);
  };

  // Helper to determine if the dropdown should be locked
  const isDropdownDisabled = (targetUserRole: string, targetUserId: string) => {
    if (targetUserId === currentUserId) return true;
    if (targetUserRole === 'super_admin' && currentUserRole !== 'super_admin') return true;
    if (targetUserRole === 'admin' && currentUserRole !== 'super_admin') return true;
    return false;
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              Staff & Roles
              {currentUserRole === 'super_admin' && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-1 rounded border border-indigo-200 uppercase tracking-widest">Super Admin Mode</span>
              )}
            </h1>
            <p className="text-sm text-slate-500 mt-1">Manage system access levels. Search an email to find customers.</p>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm">
            ← Back to Dashboard
          </Link>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="relative flex-1">
            <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input
              type="text"
              placeholder="Search by name or email to find customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400 transition-all font-medium text-sm"
            />
          </div>
          {isLoading && <div className="w-5 h-5 border-2 border-slate-300 border-t-amber-600 rounded-full animate-spin shrink-0"></div>}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          {users.length === 0 && !isLoading ? (
            <div className="p-16 text-center text-slate-500 font-medium">No users found matching your search.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-4 px-6">User Details</th>
                    <th className="py-4 px-6">Contact</th>
                    <th className="py-4 px-6 text-center">Current Role</th>
                    <th className="py-4 px-6 text-right">Assign New Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {users.map((user) => {
                    const isDisabled = isDropdownDisabled(user.role, user.id);
                    
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-extrabold text-slate-900">{user.full_name || 'Unnamed User'}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {user.id.slice(0, 8)}...</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-slate-700">{user.email || 'No email saved'}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{user.phone || 'No phone'}</div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                            user.role === 'super_admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            user.role === 'admin' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            user.role === 'cashier' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {user.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <select
                            disabled={isDisabled || updatingId === user.id}
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            title={isDisabled ? "You need higher clearance to edit this role." : "Change user role"}
                            className={`bg-white border px-3 py-2 rounded-xl text-xs font-bold outline-none shadow-sm transition-all ${
                              updatingId === user.id ? 'opacity-50 cursor-wait' : 
                              isDisabled ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' : 
                              'border-slate-200 hover:border-amber-400 cursor-pointer'
                            }`}
                          >
                            <option value="customer">Customer</option>
                            <option value="cashier">Cashier (POS Access)</option>
                            
                            {/* Normal Admins see this option as disabled */}
                            <option value="admin" disabled={currentUserRole !== 'super_admin'}>
                              Admin
                            </option>
                            
                            {/* Only Super Admins can see the Super Admin option */}
                            {(currentUserRole === 'super_admin' || user.role === 'super_admin') && (
                              <option value="super_admin" disabled={currentUserRole !== 'super_admin'}>
                                Super Admin
                              </option>
                            )}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}