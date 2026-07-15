'use client';

import { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import ProductGrid from '../../components/pos/ProductGrid';
import CartSidebar from '../../components/pos/CartSidebar';
import CameraScanner from '../../components/pos/CameraScanner'; 
import { supabase } from '../../lib/supabase'; 

export default function POSPage() {
  const { cartTotal, setCashierId } = usePOS();
  
  // --- AUTH & ACCESS STATE ---
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [cashierName, setCashierName] = useState<string>('Cashier');
  const [userRole, setUserRole] = useState<string>(''); 
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  
  // --- UI & POS STATE ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  
  // Replaced scannerMode with a boolean to control the camera overlay
  const [isCameraActive, setIsCameraActive] = useState(false); 
  const [searchQuery, setSearchQuery] = useState('');
  const [isOnline, setIsOnline] = useState(true); 

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
          
          // Ensure your context has this method available!
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
    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    setIsLogoutConfirmOpen(false);
    window.location.reload(); 
  };

  const toggleNetwork = () => setIsOnline(!isOnline);

  const handleBarcodeScanned = (barcode: string) => {
    console.log("Scanned Barcode value:", barcode);
    setSearchQuery(barcode); // Auto-fill the search bar
    setIsCameraActive(false); // Close the camera automatically
    
    // Add logic here to automatically add the item to the cart if desired
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
            <div className="w-16 h-16 bg-white text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl shadow-md">
              ⚖️
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
        <div className="flex items-center w-1/4">
          {/* Logo updated here */}
          <img 
            src="/logo.png" 
            alt="Kandyan Cultural Centre Logo" 
            className="w-12 h-12 rounded-full object-cover border border-stone-200 shadow-sm"
          />
          <span className="ml-3 font-semibold text-stone-600 hidden md:block">
            POS Terminal
          </span>
        </div>

        <div className="absolute left-1/2 transform -translate-x-1/2 w-1/2 text-center">
          {/* Title updated here */}
          <h1 className="text-xl md:text-2xl font-black text-stone-800 tracking-wide">
            Kandyan Cultural Centre
          </h1>
        </div>

        <div className="flex items-center justify-end w-1/4 relative">
          <div>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 font-semibold rounded-lg border border-stone-200 transition-colors shadow-sm"
            >
              <div className="w-8 h-8 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mr-3 font-bold text-sm uppercase">
                {cashierName.charAt(0)}
              </div>
              <span className="mr-2">{cashierName}</span>
              <span className="text-xs text-stone-400">▼</span>
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
                        className="w-full text-left px-4 py-2 text-stone-700 hover:bg-stone-100 transition-colors"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        ⚙️ Settings
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => setIsLogoutConfirmOpen(true)}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors"
                        title="Log out of the terminal"
                      >
                        🚪 Log Out
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
        
        {/* --- SECONDARY ACTION BAR (SEARCH & CONTROLS) --- */}
        <div className="flex justify-between items-center bg-white px-6 py-3 border-b border-stone-200 shrink-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          
          {/* Center: Search/Barcode Input with embedded Camera Toggle */}
          <div className="flex-1 max-w-3xl relative mr-8">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-stone-400">🔍</span>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Scan barcode with gun or search item name..."
              className="w-full pl-12 pr-14 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition-all text-stone-800 font-medium shadow-inner"
              autoFocus
            />
            {/* Embedded Camera Button */}
            <button
              onClick={() => setIsCameraActive(!isCameraActive)}
              className={`absolute inset-y-0 right-2 px-2 flex items-center justify-center transition-colors ${isCameraActive ? 'text-amber-700' : 'text-stone-400 hover:text-amber-600'}`}
              title={isCameraActive ? "Close Camera" : "Open Camera Scanner"}
            >
              <span className="text-2xl">📸</span>
            </button>
          </div>

          {/* Right: Network Status */}
          <div className="w-56 flex justify-end shrink-0">
            <button 
              onClick={toggleNetwork}
              className={`flex items-center px-4 py-2 rounded-full border transition-colors shadow-sm ${isOnline ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'}`}
              title="Click to simulate connection drop"
            >
              <span className={`w-3 h-3 rounded-full mr-2 shadow-sm ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span className="text-sm font-bold uppercase tracking-wider">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </button>
          </div>
        </div>

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
              <ProductGrid searchQuery={searchQuery} />
            )}
          </div>
          {/* Right Side: Cart Sidebar */}
          <div className="flex-[1] min-w-[350px] bg-white border-l border-stone-200 p-6 flex flex-col shadow-[-4px_0_24px_-8px_rgba(0,0,0,0.05)]">
              <CartSidebar />
          </div>
        </div>

      </div>
      
      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                👋
              </div>
              <h3 className="text-xl font-black text-stone-800 mb-2">Ending Shift?</h3>
              <p className="text-stone-500 text-sm">
                Are you sure you want to log out of the POS terminal?
              </p>
            </div>
            
            <div className="flex border-t border-stone-200">
              <button 
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="flex-1 py-4 font-bold text-stone-600 hover:bg-stone-50 transition-colors border-r border-stone-200"
              >
                Go Back
              </button>
              <button 
                onClick={handleLogout}
                className="flex-1 py-4 font-black text-amber-700 hover:bg-amber-50 transition-colors"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}