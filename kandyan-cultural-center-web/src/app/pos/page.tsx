'use client';

import { useState, FormEvent } from 'react';
import { usePOS } from '../../context/POSContext';

interface Cashier {
  id: string;
  name: string;
}

export default function POSPage() {
  const { cartTotal } = usePOS();
  
  // App State
  const [activeCashier, setActiveCashier] = useState<Cashier | null>(null);
  
  // UI State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Handle the form submission
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault(); // Prevent the page from refreshing
    
    if (username === 'cashier1' && password === '123456') {
      // Success!
      setActiveCashier({
        id: 'emp-101',
        name: 'Cashier 1',
      });
      // Reset form and close modal
      setIsLoginModalOpen(false);
      setUsername('');
      setPassword('');
      setLoginError('');
    } else {
      // Failure
      setLoginError('Invalid username or password.');
    }
  };

  const handleLogout = () => {
    setActiveCashier(null);
    setIsDropdownOpen(false); // Close the dropdown when logging out
  };

  return (
    <div className="flex flex-col h-screen bg-stone-100 font-sans relative">
      
      {/* --- LOGIN MODAL --- */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 overflow-hidden transform transition-all">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🔐
              </div>
              <h3 className="text-2xl font-black text-stone-800">Cashier Login</h3>
              <p className="text-stone-500 mt-2">Enter your terminal credentials</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-200">
                  {loginError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Username</label>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all"
                  placeholder="e.g., cashier1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-transparent transition-all"
                  placeholder="••••••"
                  required
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsLoginModalOpen(false)}
                  className="flex-1 py-3 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg transition-colors shadow-md"
                >
                  Unlock Terminal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TOP ACTION BAR --- */}
      <header className="relative flex justify-between items-center bg-white px-6 py-4 shadow-sm border-b border-stone-200 z-30 shrink-0">
        
        {/* Left: Logo Area */}
        <div className="flex items-center w-1/4">
          <div className="w-12 h-12 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-inner">
            KAA
          </div>
          <span className="ml-3 font-semibold text-stone-600 hidden md:block">
            POS Terminal
          </span>
        </div>

        {/* Center: Association Name */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-1/2 text-center">
          <h1 className="text-xl md:text-2xl font-black text-stone-800 tracking-wide">
            The Kandyan Art Association
          </h1>
        </div>

        {/* Right: Cashier Details / Login Button */}
        <div className="flex items-center justify-end w-1/4 relative">
          {activeCashier ? (
            <div>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 font-semibold rounded-lg border border-stone-200 transition-colors shadow-sm"
              >
                <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mr-3 font-bold text-sm">
                  {activeCashier.name.charAt(0)}
                </div>
                <span className="mr-2">{activeCashier.name}</span>
                <span className="text-xs text-stone-400">▼</span>
              </button>

              {/* User Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  {/* Invisible overlay to close dropdown when clicking outside */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
                      <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Active Session</p>
                    </div>
                    <ul className="py-2">
                      <li>
                        <button 
                          className="w-full text-left px-4 py-2 text-stone-700 hover:bg-stone-100 transition-colors"
                          onClick={() => {
                            setIsDropdownOpen(false);
                            // Future: Add settings or history toggle here
                          }}
                        >
                          ⚙️ Settings (Coming Soon)
                        </button>
                      </li>
                      <li>
                        <button 
                          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors"
                          onClick={handleLogout}
                        >
                          🚪 Log Out
                        </button>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg transition-colors shadow-md"
            >
              Log In
            </button>
          )}
        </div>
      </header>

      {/* --- MAIN BODY AREA --- */}
      {!activeCashier ? (
        
        <div className="flex flex-1 items-center justify-center bg-stone-200/50 p-6 z-10">
          <div className="text-center max-w-xl bg-white p-10 rounded-2xl shadow-lg border border-stone-200">
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-white shadow-sm">
              <span className="text-5xl opacity-50">🔒</span>
            </div>
            <h2 className="text-3xl font-black text-stone-800 mb-4">
              Terminal Locked
            </h2>
            <p className="text-stone-600 text-lg leading-relaxed mb-8">
              Welcome to the Kandyan Art Association Store. Please log in as a cashier to continue with the POS system.
            </p>
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="px-8 py-3 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg transition-colors shadow-md text-lg"
            >
              Unlock Terminal Now
            </button>
          </div>
        </div>

      ) : (

        <div className="flex flex-1 overflow-hidden z-10">
          {/* Left Side: Product Discovery */}
          <div className="flex-[2.5] p-6 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-stone-800">Merchandise</h2>
            </div>
            
            <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-stone-200 overflow-y-auto">
              <p className="text-stone-400 text-center mt-10">
                Product grid will go here...
              </p>
            </div>
          </div>

          {/* Right Side: Cart Sidebar */}
          <div className="flex-[1] min-w-[350px] bg-white border-l border-stone-200 p-6 flex flex-col shadow-[-4px_0_24px_-8px_rgba(0,0,0,0.05)]">
            <h2 className="text-xl font-bold text-stone-800 mb-6 pb-4 border-b border-stone-100">
              Current Order
            </h2>
            
            <div className="flex-1 overflow-y-auto">
              <p className="text-stone-400 text-center mt-10">
                Scanned items will appear here...
              </p>
            </div>
            
            <div className="mt-auto pt-6 border-t border-stone-200">
              <div className="flex justify-between items-end mb-6">
                <span className="text-lg font-medium text-stone-500">Total</span>
                <span className="text-4xl font-black text-amber-700">
                  Rs. {cartTotal.toFixed(2)}
                </span>
              </div>
              <button className="w-full py-5 bg-stone-900 hover:bg-stone-800 text-white text-xl font-black rounded-xl transition-all shadow-lg active:scale-[0.98]">
                CHARGE
              </button>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}