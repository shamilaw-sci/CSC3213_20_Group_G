'use client';

import { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import ProductGrid from '../../components/pos/ProductGrid';
import CartSidebar from '../../components/pos/CartSidebar';
import CameraScanner from '../../components/pos/CameraScanner'; 
import CalculatorModal from '../../components/pos/CalculatorModal';
import HistoryModal from '../../components/pos/HistoryModal';
import { supabase } from '../../lib/supabase'; 

export default function POSPage() {
  const { cartTotal, setCashierId } = usePOS();
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  // --- AUTH & ACCESS STATE ---
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [cashierName, setCashierName] = useState<string>('Cashier');
  const [userRole, setUserRole] = useState<string>(''); 
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
  // --- UI & POS STATE ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true); 

  // --- SORTING & FILTERING STATE ---
  const [sortBy, setSortBy] = useState<string>('name-asc');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [outOfStockOnly, setOutOfStockOnly] = useState<boolean>(false);

  // --- SESSION-ENDING ---
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);

  // --- 1. SUPABASE AUTH & RBAC CHECK ---
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          window.location.replace('/');
          return;
        }

        const currentUserId = session.user.id;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role, full_name')
          .eq('id', currentUserId)
          .single();

        if (profileError || !profile) {
          window.location.replace('/');
          return;
        }

        if (profile.role === 'admin' || profile.role === 'cashier') {
          setHasAccess(true);
          setCashierName(profile.full_name || 'Cashier'); 
          setUserRole(profile.role);
          
          if (setCashierId) setCashierId(currentUserId); 
        } else {
          window.location.replace('/');
        }
      } catch (err) {
        console.error("Access verification failed:", err);
        window.location.replace('/');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [setCashierId]);

  // --- 2. HANDLERS ---
  const handleLogout = async () => {
    // 1. Safety Check: Prevent logout if there are unsynced orders
    const queue = JSON.parse(localStorage.getItem('kaa_offline_queue') || '[]');
    if (queue.length > 0) {
      if (!isOnline) {
        setLogoutMessage(`Cannot end session. The network is offline and ${queue.length} orders are waiting to be saved. Please reconnect.`);
      } else {
        setLogoutMessage(`Syncing ${queue.length} pending orders to the database. Please wait a moment and try again.`);
      }
      return; 
    }

    // 2. If clear, proceed with Supabase logout
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    setIsLogoutConfirmOpen(false);
    window.location.reload(); 
  };

  const toggleNetwork = () => setIsOnline(!isOnline);

  const handleBarcodeScanned = (barcode: string) => {
    console.log("Scanned Barcode value:", barcode);
    setSearchQuery(barcode); 
    setIsCameraActive(false); 
    alert(`Barcode scanned: ${barcode}`);
  };

  // ==========================================
  // VIEW 1: STEALTH LOADING STATE
  // ==========================================
  if (loading) {
    return <div className="min-h-screen bg-stone-100"></div>;
  }

  // ==========================================
  // VIEW 2: THE INVISIBLE WALL
  // ==========================================
  if (!hasAccess) {
    return null; 
  }

  // ==========================================
  // VIEW 3: THE ACCOUNTABILITY GATEWAY
  // ==========================================
  if (hasAccess && !disclaimerAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-900 font-sans p-4 z-[100]">
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="bg-amber-700 p-6 text-center">
            <div className="w-16 h-16 bg-white text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-white tracking-wide">Session Accountability</h2>
          </div>
          <div className="p-8">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-6">
              <div className="flex justify-between border-b border-stone-200 pb-2 mb-2">
                <span className="text-stone-500 font-semibold text-sm">Active User:</span>
                <span className="font-bold text-stone-800">{cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold text-sm">Clearance Level:</span>
                <span className="font-bold text-amber-700 uppercase">{userRole}</span>
              </div>
            </div>
            <p className="text-stone-600 text-sm leading-relaxed mb-8 text-justify">
              By proceeding, you acknowledge that you are operating under your personal credentials. 
              <strong> All sales, discounts, and inventory modifications will be permanently logged to this account. </strong> 
              You are fully responsible for this POS terminal and its cash drawer until you formally log out of the system.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={handleLogout}
                className="flex-[1] py-3 font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel & Log Out
              </button>
              <button 
                onClick={() => setDisclaimerAccepted(true)}
                className="flex-[2] py-3 font-black text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-md"
              >
                I ACCEPT & CONFIRM
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 4: THE AUTHORIZED POS TERMINAL
  // ==========================================
  return (
    <div className="flex flex-col h-screen bg-stone-100 font-sans relative">
      
      {/* --- TOP ACTION BAR --- */}
      <header className="relative flex justify-between items-center bg-white px-6 py-4 shadow-sm border-b border-stone-200 z-30 shrink-0">
        
        {/* Left: Logo & Network Status */}
        <div className="flex items-center w-1/3 gap-4">
          <img 
            src="/logo.png" 
            alt="Kandyan Cultural Centre Logo" 
            className="w-12 "
          />
          <button 
            onClick={toggleNetwork}
            className={`flex items-center px-3 py-1.5 rounded-full border transition-colors shadow-sm ${isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'}`}
            title="Toggle Network Status"
          >
            <span className={`w-2.5 h-2.5 rounded-full mr-2 shadow-sm ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
            <span className="text-xs font-bold uppercase tracking-wider">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </button>
        </div>

        {/* Center: Main Title */}
        <div className="w-1/3 text-center flex justify-center">
          <h1 className="text-xl md:text-2xl font-black text-stone-800 tracking-wide whitespace-nowrap">
            Kandyan Cultural Centre <span className="text-stone-400 font-medium px-2">|</span> POS Terminal
          </h1>
        </div>

        {/* Right: Cashier Dropdown */}
        <div className="flex items-center justify-end w-1/3 relative">
          <div>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 font-semibold rounded-lg border border-stone-200 transition-colors shadow-sm"
            >
              <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mr-3 font-bold text-sm uppercase">
                {cashierName.charAt(0)}
              </div>
              <span className="mr-2">{cashierName}</span>
              <svg className="w-3.5 h-3.5 text-stone-400 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isDropdownOpen && (
              <>
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
                        className="w-full text-left px-4 py-2 text-stone-700 hover:bg-stone-100 transition-colors flex items-center"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Settings
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => {
                          const queue = JSON.parse(localStorage.getItem('kaa_offline_queue') || '[]');
                          setUnsyncedCount(queue.length);
                          setLogoutMessage(null);
                          setIsLogoutConfirmOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center"
                        title="Log out of the terminal"
                      >
                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        End Shift / Log Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* --- MAIN BODY AREA --- */}
      <div className="flex flex-col flex-1 overflow-hidden z-10">
        
        {/* --- SECONDARY ACTION BAR --- */}
        <div className="flex justify-between items-center bg-white px-6 py-3 border-b border-stone-200 shrink-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          
          {/* Left: Sorting & Filtering Controls */}
          <div className="flex-1 flex justify-start items-center gap-3">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              // Added pr-10 to push the text away from the dropdown arrow
              className="bg-stone-50 border border-stone-200 text-stone-700 text-sm font-semibold rounded-xl pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600 cursor-pointer shadow-sm"
            >
              <option value="name-asc">Sort: A to Z</option>
              <option value="name-desc">Sort: Z to A</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <button 
              onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors shadow-sm ${
                isFilterMenuOpen || activeCategory !== 'All' || inStockOnly || outOfStockOnly 
                  ? 'bg-amber-100 border-amber-300 text-amber-800' 
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <span>Filters</span>
              
              {/* Show the 'X' button only when a filter is active */}
              {(activeCategory !== 'All' || inStockOnly || outOfStockOnly) && (
                <div 
                  onClick={(e) => {
                    e.stopPropagation(); // Prevents the menu from opening when clicking 'X'
                    setActiveCategory('All');
                    setInStockOnly(false);
                    setOutOfStockOnly(false);
                  }}
                  className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold transition-colors"
                  title="Clear all filters"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Center: Search/Barcode Input */}
          <div className="w-[500px] relative shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Scan barcode with gun or search item name..."
              className="w-full pl-12 pr-14 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition-all text-stone-800 font-medium shadow-inner"
              autoFocus
            />
            <button
              onClick={() => setIsCameraActive(!isCameraActive)}
              className={`absolute inset-y-0 right-2 px-2 flex items-center justify-center transition-colors ${isCameraActive ? 'text-amber-700' : 'text-stone-400 hover:text-amber-600'}`}
              title={isCameraActive ? "Close Camera" : "Open Camera Scanner"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          {/* Right: Action Buttons */}
          <div className="flex-1 flex justify-end items-center gap-3">
             <button 
                onClick={() => setIsHistoryOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl border border-stone-200 transition-colors shadow-sm"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                History
             </button>
             <button 
                onClick={() => setIsCalculatorOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl border border-stone-200 transition-colors shadow-sm"
             >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Calculator
             </button>
          </div>
        </div>

        {/* --- FILTER POPOVER MENU --- */}
        {isFilterMenuOpen && (
          <>
            {/* Invisible Backdrop for click-away closing */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsFilterMenuOpen(false)} 
            />
            
            <div className="absolute top-[140px] left-6 z-50 w-72 bg-white rounded-xl shadow-2xl border border-stone-200 p-5 animate-in slide-in-from-top-2">
              <h3 className="font-bold text-stone-800 mb-3 border-b border-stone-100 pb-2">Filter Inventory</h3>
              
              <div className="mb-4">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">Category</label>
                <select 
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500"
                >
                  <option value="All">All Categories</option>
                  <option value="Lacquerware">Lacquerware</option>
                  <option value="Masks">Masks</option>
                  <option value="Weaving">Weaving</option>
                  <option value="Wood Carvings">Wood Carvings</option>
                  <option value="Brassware">Brassware</option>
                  <option value="Paintings">Paintings</option>
                </select>
              </div>

              <div className="flex items-center justify-between mt-2 pt-4 border-t border-stone-100">
                <span className="text-sm font-semibold text-stone-700">In Stock Only</span>
                <button 
                  onClick={() => {
                    setInStockOnly(!inStockOnly);
                    if (!inStockOnly) setOutOfStockOnly(false); // Make toggles mutually exclusive
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative ${inStockOnly ? 'bg-emerald-500' : 'bg-stone-300'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${inStockOnly ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>

              {/* NEW: Out of Stock Toggle */}
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm font-semibold text-stone-700">Out of Stock Only</span>
                <button 
                  onClick={() => {
                    setOutOfStockOnly(!outOfStockOnly);
                    if (!outOfStockOnly) setInStockOnly(false); // Make toggles mutually exclusive
                  }}
                  className={`w-11 h-6 rounded-full transition-colors relative ${outOfStockOnly ? 'bg-red-500' : 'bg-stone-300'}`}
                >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${outOfStockOnly ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>
              
              <button 
                onClick={() => setIsFilterMenuOpen(false)}
                className="w-full mt-5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold py-2 rounded-lg text-sm transition-colors"
              >
                Done
              </button>
            </div>
          </>
        )}

        {/* --- PRODUCT & CART AREA --- */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Side: Product Discovery */}
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-stone-200 overflow-y-auto">
            {isCameraActive ? (
              <div className="py-8 flex flex-col items-center justify-center animate-in fade-in duration-200">
                <CameraScanner onScanSuccess={handleBarcodeScanned} />
                <button 
                  onClick={() => setIsCameraActive(false)}
                  className="mt-6 text-sm font-bold text-stone-600 hover:text-stone-800 bg-stone-100 px-6 py-3 rounded-xl border border-stone-200 transition-colors"
                >
                  Close Camera
                </button>
              </div>
            ) : (
              <ProductGrid 
                searchQuery={searchQuery} 
                sortBy={sortBy}
                activeCategory={activeCategory}
                inStockOnly={inStockOnly}
                outOfStockOnly={outOfStockOnly}
              />
            )}
          </div>
          {/* Right Side: Cart Sidebar */}
          <div className="flex-[1] min-w-[350px] bg-white border-l border-stone-200 p-6 flex flex-col shadow-[-4px_0_24px_-8px_rgba(0,0,0,0.05)]">
              <CartSidebar />
          </div>
        </div>

      </div>
      
      {/* --- END OF SHIFT / LOGOUT MODAL --- */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-stone-800">End of Shift</h3>
                <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>

              {/* Step 1: Reconciliation */}
              <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-xl">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Step 1: Reconciliation</h4>
                <p className="text-sm text-stone-600 mb-3">Please verify the physical cash drawer matches today's transactions before ending your session.</p>
                <button 
                  onClick={() => setIsHistoryOpen(true)}
                  className="w-full py-2.5 bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-stone-700 font-bold rounded-lg transition-colors flex items-center justify-center shadow-sm"
                >
                  <svg className="w-5 h-5 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Today's History
                </button>
              </div>

              {/* Step 2: Database Sync Status */}
              <div className="mb-2 p-4 bg-stone-50 border border-stone-200 rounded-xl">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Step 2: Data Synchronization</h4>
                
                {unsyncedCount === 0 ? (
                  <div className="flex items-center text-emerald-600 font-semibold text-sm">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    All data successfully synced to server.
                  </div>
                ) : (
                  <div className="flex items-start text-amber-700 font-semibold text-sm bg-amber-100/50 p-3 rounded-lg border border-amber-200">
                    <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <span className="block font-bold">Warning: {unsyncedCount} orders pending.</span>
                      <span className="text-xs font-normal opacity-90 block mt-1">
                        Do not log out until the network restores and data is uploaded.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Message Space */}
              {logoutMessage && (
                <div className="mt-4 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg text-center border border-red-100">
                  {logoutMessage}
                </div>
              )}
            </div>
            
            <div className="flex border-t border-stone-200 bg-stone-50">
              <button 
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-4 font-bold text-stone-600 hover:bg-stone-100 transition-colors border-r border-stone-200"
              >
                Return to POS
              </button>
              <button 
                onClick={handleLogout}
                disabled={unsyncedCount > 0}
                className={`flex-1 py-4 font-black transition-colors ${
                  unsyncedCount > 0 
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed' 
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}


      
      {/* --- CALCULATOR MODAL --- */}
      {isCalculatorOpen && (
        <CalculatorModal onClose={() => setIsCalculatorOpen(false)} />
      )}

      {/* --- HISTORY MODAL --- */}
      {isHistoryOpen && (
        <HistoryModal onClose={() => setIsHistoryOpen(false)} />
      )}
    </div>
  );
}