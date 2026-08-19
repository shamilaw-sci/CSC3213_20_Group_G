'use client';

import { useState, useEffect } from 'react';
import { usePOS } from '../../context/POSContext';
import ProductGrid from '../../components/pos/ProductGrid';
import CartSidebar from '../../components/pos/CartSidebar';
import CameraScanner from '../../components/pos/CameraScanner'; 
import CalculatorModal from '../../components/pos/CalculatorModal';
import HistoryModal from '../../components/pos/HistoryModal';
import OnlineOrdersModal from '../../components/pos/OnlineOrdersModal'; 
import { supabase } from '../../lib/supabase'; 

export default function POSPage() {
  const { cartTotal, setCashierId, cachedProducts } = usePOS(); 
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isOnlineOrdersOpen, setIsOnlineOrdersOpen] = useState(false);
  
  // --- AUTH & ACCESS STATE ---
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [cashierName, setCashierName] = useState<string>('Cashier');
  const [userRole, setUserRole] = useState<string>(''); 
  const [userId, setUserId] = useState<string>(''); // NEW: Storing ID for sessions
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // --- REAL-TIME NETWORK STATE ---
  const [networkStatus, setNetworkStatus] = useState<'Connected' | 'Limited Connection' | 'Disconnected'>('Connected');
  
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
  
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null);
  
  // --- SESSION & BLIND CLOSEOUT STATE ---
  const [sessionId, setSessionId] = useState<string | null>(null); // NEW: Track DB row
  const [startingCash, setStartingCash] = useState<string>(''); 
  const [declaredCash, setDeclaredCash] = useState<string>('');
  const [expectedCashState, setExpectedCashState] = useState<number>(0); // NEW
  const [varianceState, setVarianceState] = useState<number>(0); // NEW
  const [varianceMessage, setVarianceMessage] = useState<{type: 'success'|'error', text: string} | null>(null);
  const [sessionRemark, setSessionRemark] = useState<string>('');
  const [isVerifyingCash, setIsVerifyingCash] = useState(false);
  const [isCashVerified, setIsCashVerified] = useState(false);

  // --- REALTIME ONLINE ORDERS STATE ---
  const [pendingOnlineCount, setPendingOnlineCount] = useState(0);
  const [showNewOrderBubble, setShowNewOrderBubble] = useState(false);
  const [hasInitiallyChecked, setHasInitiallyChecked] = useState(false);

  const highestPrice = cachedProducts && cachedProducts.length > 0 
    ? Math.max(...cachedProducts.map(p => p.price || 0)) 
    : 10000; 

  const isFilterActive = 
    activeCategory !== 'All' || 
    inStockOnly || 
    outOfStockOnly || 
    minPrice !== '' || 
    maxPrice !== '';

  const clearAllFilters = () => {
    setActiveCategory('All');
    setInStockOnly(false);
    setOutOfStockOnly(false);
    setMinPrice('');
    setMaxPrice('');
  };

  // ---  SUPABASE AUTH, RBAC, & SESSION RECOVERY ---
  // --- 1. SUPABASE AUTH, RBAC, & SESSION RECOVERY ---
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError || !session) {
          window.location.replace('/');
          return;
        }

        const currentUserId = session.user.id;
        setUserId(currentUserId);

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
          
          // Fetch active session AND its start_time
          const { data: activeSession } = await supabase
            .from('pos_sessions')
            .select('id, starting_float, start_time')
            .eq('cashier_id', currentUserId)
            .eq('status', 'active')
            .maybeSingle();
            
          if (activeSession) {
            const sessionDate = new Date(activeSession.start_time).toDateString();
            const todayDate = new Date().toDateString();

            // Check if the session was started on a previous day
            if (sessionDate !== todayDate) {
              // Abandoned Session Detected: Force close it
              await supabase
                .from('pos_sessions')
                .update({
                  end_time: new Date().toISOString(),
                  status: 'closed',
                  session_remark: 'SYSTEM AUTO-CLOSE: Shift abandoned from previous day.'
                })
                .eq('id', activeSession.id);
                
              // Do NOT resume. Let them stay on the float entry screen for today.
            } else {
              // Valid session for today: Resume it
              setSessionId(activeSession.id);
              setStartingCash(activeSession.starting_float.toString());
              setDisclaimerAccepted(true); 
            }
          }

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


  // --- REAL-TIME NETWORK MONITOR ---
  useEffect(() => {
    const checkConnection = async () => {
      // 1. Check if the browser thinks we have OS-level internet
      if (!navigator.onLine) {
        setNetworkStatus('Disconnected');
        return;
      }
      
      const startTime = Date.now();
      try {
        // 2. Ping Supabase to see if we can actually reach the database
        // We fetch a single row just to test the connection
        const { error } = await supabase.from('profiles').select('id').limit(1);
        const pingTime = Date.now() - startTime;
        
        if (error) {
          setNetworkStatus('Disconnected');
        } else if (pingTime > 3000) { 
          // If it takes more than 3 seconds to respond, the connection is struggling
          setNetworkStatus('Limited Connection');
        } else {
          setNetworkStatus('Connected');
        }
      } catch (err) {
        setNetworkStatus('Disconnected');
      }
    };

    // Set up native browser listeners for instant updates
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', () => setNetworkStatus('Disconnected'));

    // Set up a heartbeat to check connection quality every 30 seconds
    const pingInterval = setInterval(checkConnection, 30000);
    
    // Run an initial check on load
    checkConnection();

    return () => {
      window.removeEventListener('online', checkConnection);
      window.removeEventListener('offline', () => setNetworkStatus('Disconnected'));
      clearInterval(pingInterval);
    };
  }, []);


  // --- REALTIME ONLINE ORDERS LISTENER ---
  useEffect(() => {
    if (!disclaimerAccepted) return;

    const fetchInitialCount = async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('sales_channel', 'online')
        .eq('status', 'order placed');

      if (!error && count !== null) {
        setPendingOnlineCount(count);
        if (count > 0 && !hasInitiallyChecked) {
          setIsOnlineOrdersOpen(true);
        }
      }
      setHasInitiallyChecked(true);
    };

    fetchInitialCount();

    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.new.sales_channel === 'online' && payload.new.status === 'order placed') {
            setPendingOnlineCount((prev) => prev + 1);
            setShowNewOrderBubble(true);
            setTimeout(() => setShowNewOrderBubble(false), 8000); 
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          if (payload.old.status === 'order placed' && payload.new.status === 'reviewed') {
            setPendingOnlineCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [disclaimerAccepted, hasInitiallyChecked]);

  // --- 2. HANDLERS ---

  // NEW: Create Session in DB
  const handleStartSession = async () => {
    if (!startingCash) return;
    try {
      const floatValue = parseFloat(startingCash);
      const { data, error } = await supabase
        .from('pos_sessions')
        .insert({
          cashier_id: userId,
          starting_float: floatValue,
          status: 'active'
        })
        .select('id')
        .single();

      if (error) throw error;
      
      setSessionId(data.id);
      setDisclaimerAccepted(true);
    } catch (err) {
      console.error("Failed to start session:", err);
      alert("Error starting shift. Please check network.");
    }
  };

  const handleVerifyCash = async () => {
    if (!declaredCash) return;
    setIsVerifyingCash(true);
    setVarianceMessage(null);

    try {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const isoStartOfToday = startOfToday.toISOString();

      const { data, error } = await supabase
        .from('orders')
        .select('total_amount, payment_method')
        .eq('sales_channel', 'in-store')
        .gte('created_at', isoStartOfToday);

      if (error) throw error;

      const initialFloat = parseFloat(startingCash) || 0;
      const cashSales = data
        .filter(o => o.payment_method === 'cash')
        .reduce((sum, o) => sum + (o.total_amount || 0), 0);

      const expectedCash = initialFloat + cashSales;
      const declared = parseFloat(declaredCash);
      const variance = declared - expectedCash;

      // Save for DB update on logout
      setExpectedCashState(expectedCash);
      setVarianceState(variance);

      if (variance === 0) {
        setVarianceMessage({ 
          type: 'success', 
          text: `Perfect match! (Float: Rs. ${initialFloat.toLocaleString()} + Sales: Rs. ${cashSales.toLocaleString()})` 
        });
      } else if (variance > 0) {
        setVarianceMessage({ 
          type: 'error', 
          text: `Drawer is OVER by Rs. ${variance.toLocaleString()} (Expected Rs. ${expectedCash.toLocaleString()})` 
        });
      } else {
        setVarianceMessage({ 
          type: 'error', 
          text: `Drawer is SHORT by Rs. ${Math.abs(variance).toLocaleString()} (Expected Rs. ${expectedCash.toLocaleString()})` 
        });
      }
      
      setIsCashVerified(true);
    } catch (err) {
      console.error("Failed to verify cash:", err);
      setVarianceMessage({ type: 'error', text: 'System offline. Cannot verify expected cash balance.' });
    } finally {
      setIsVerifyingCash(false);
    }
  };

  const handleLogout = async () => {
    const queue = JSON.parse(localStorage.getItem('kaa_offline_queue') || '[]');
    if (queue.length > 0) {
      if (networkStatus === 'Disconnected') {
        setLogoutMessage(`Cannot end session. The network is offline and ${queue.length} orders are waiting to be saved. Please reconnect.`);
      } else {
        setLogoutMessage(`Syncing ${queue.length} pending orders to the database. Please wait a moment and try again.`);
      }
      return; 
    }

    // NEW: Update DB to close the session before signing out
    if (sessionId && isCashVerified) {
      try {
        await supabase
          .from('pos_sessions')
          .update({
            end_time: new Date().toISOString(),
            declared_closing_cash: parseFloat(declaredCash),
            expected_closing_cash: expectedCashState,
            variance: varianceState,
            status: 'closed',
            session_remark: sessionRemark.trim() || null
          })
          .eq('id', sessionId);
      } catch (err) {
        console.error("Error closing session in DB", err);
      }
    }

    await supabase.auth.signOut();
    setIsDropdownOpen(false);
    setIsLogoutConfirmOpen(false);
    window.location.reload(); 
  };

  const toggleNetwork = () => setIsOnline(!isOnline);

  const handleBarcodeScanned = (barcode: string) => {
    setSearchQuery(barcode); 
    setIsCameraActive(false); 
  };

  if (loading) return <div className="min-h-screen bg-stone-100"></div>;
  if (!hasAccess) return null; 

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
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-4">
              <div className="flex justify-between border-b border-stone-200 pb-2 mb-2">
                <span className="text-stone-500 font-semibold text-sm">Active User:</span>
                <span className="font-bold text-stone-800">{cashierName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-semibold text-sm">Clearance Level:</span>
                <span className="font-bold text-amber-700 uppercase">{userRole}</span>
              </div>
            </div>

            <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Initial Drawer Float</h4>
              <p className="text-xs text-stone-600 mb-3">Please count and enter the starting cash amount currently in your drawer.</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rs.</span>
                <input 
                  type="number"
                  min="0"
                  value={startingCash}
                  onChange={(e) => setStartingCash(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-lg font-bold text-stone-800 focus:outline-none focus:border-amber-500 shadow-sm transition-colors"
                />
              </div>
            </div>

            <p className="text-stone-600 text-xs leading-relaxed mb-6 text-justify">
              By proceeding, you acknowledge that you are operating under your personal credentials. 
              All sales and modifications will be permanently logged to this account.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.reload();
                }} 
                className="flex-[1] py-3 font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleStartSession} 
                disabled={startingCash === ''}
                className={`flex-[2] py-3 font-black rounded-xl transition-colors shadow-md ${
                  startingCash === '' 
                    ? 'bg-stone-300 text-stone-500 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {startingCash === '' ? 'ENTER FLOAT TO BEGIN' : 'I ACCEPT & CONFIRM'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-stone-100 font-sans relative">
      
      {/* --- TOP ACTION BAR --- */}
      <header className="relative flex justify-between items-center bg-white px-6 py-4 shadow-sm border-b border-stone-200 z-30 shrink-0">
        <div className="flex items-center w-1/3 gap-4">
          <img src="/logo.png" alt="Kandyan Cultural Centre Logo" className="w-14 h-10.5  object-cover " />
          <div className="flex items-center w-1/3 gap-4">
          
          
          {/* DYNAMIC NETWORK BADGE */}
          <div className={`flex items-center px-3 py-1.5 rounded-full border shadow-sm select-none ${
            networkStatus === 'Connected' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
            networkStatus === 'Limited Connection' ? 'bg-amber-50 border-amber-200 text-amber-700' : 
            'bg-red-50 border-red-200 text-red-700'
          }`} title={`Current Status: ${networkStatus}`}>
            <span className={`w-2.5 h-2.5 rounded-full mr-2 shadow-sm ${
              networkStatus === 'Connected' ? 'bg-emerald-500 animate-pulse' : 
              networkStatus === 'Limited Connection' ? 'bg-amber-500' : 
              'bg-red-500'
            }`}></span>
            <span className="text-xs font-bold uppercase tracking-wider">{networkStatus}</span>
          </div>
        </div>
        </div>

        <div className="w-1/3 text-center flex justify-center">
          <h1 className="text-xl md:text-2xl font-black text-stone-800 tracking-wide whitespace-nowrap">
            Kandyan Cultural Centre <span className="text-stone-400 font-medium px-2">|</span> POS Terminal
          </h1>
        </div>

        <div className="flex items-center justify-end w-1/3 relative">
          <div>
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-800 font-semibold rounded-lg border border-stone-200 transition-colors shadow-sm">
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
                <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-stone-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-stone-100 bg-stone-50">
                    <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Active Session</p>
                  </div>
                  <ul className="py-2">
                    <li>
                      <button className="w-full text-left px-4 py-2 text-stone-700 hover:bg-stone-100 transition-colors flex items-center" onClick={() => setIsDropdownOpen(false)}>
                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Settings
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => {
                          const queue = JSON.parse(localStorage.getItem('kaa_offline_queue') || '[]');
                          setUnsyncedCount(queue.length);
                          setLogoutMessage(null);
                          setDeclaredCash('');
                          setVarianceMessage(null);
                          setIsCashVerified(false);
                          setIsLogoutConfirmOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 font-medium transition-colors flex items-center"
                      >
                        <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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
        
        <div className="flex justify-between items-center bg-white px-6 py-3 border-b border-stone-200 shrink-0 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
          
          <div className="flex-1 flex justify-start items-center gap-3">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-stone-50 border border-stone-200 text-stone-700 text-sm font-semibold rounded-xl pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-amber-600 cursor-pointer shadow-sm">
              <option value="name-asc">Sort: A to Z</option>
              <option value="name-desc">Sort: Z to A</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <button onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-colors shadow-sm ${isFilterMenuOpen || isFilterActive ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'}`}>
              <span>Filters</span>
              {isFilterActive && (
                <div onClick={(e) => { e.stopPropagation(); clearAllFilters(); }} className="ml-1 flex items-center justify-center w-5 h-5 rounded-full bg-amber-200 hover:bg-amber-300 text-amber-900 font-bold transition-colors" title="Clear all filters">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
              )}
            </button>
          </div>

          <div className="w-[500px] relative shrink-0">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Scan barcode with gun or search item name..." className="w-full pl-12 pr-14 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-600 focus:bg-white transition-all text-stone-800 font-medium shadow-inner" autoFocus />
            <button onClick={() => setIsCameraActive(!isCameraActive)} className={`absolute inset-y-0 right-2 px-2 flex items-center justify-center transition-colors ${isCameraActive ? 'text-amber-700' : 'text-stone-400 hover:text-amber-600'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>

          <div className="flex-1 flex justify-end items-center gap-3">
             <div className="relative flex items-center">
               {showNewOrderBubble && (
                 <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-max animate-bounce bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-xl z-50">
                   New Online Order!
                   <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-red-600"></div>
                 </div>
               )}
               <button onClick={() => { setIsOnlineOrdersOpen(true); setShowNewOrderBubble(false); }} className="flex items-center gap-2 px-4 py-2 bg-sky-50 border-sky-200 hover:bg-sky-100 text-sky-800 text-sm font-bold rounded-xl border transition-colors shadow-sm relative">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg> 
                  Web Orders
                  {pendingOnlineCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white shadow-md ring-2 ring-white">
                      {pendingOnlineCount}
                    </span>
                  )}
               </button>
             </div>

             {userRole === 'admin' && (
               <button onClick={() => setIsHistoryOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl border border-stone-200 transition-colors shadow-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> History
               </button>
             )}
             <button onClick={() => setIsCalculatorOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-stone-50 hover:bg-stone-100 text-stone-700 text-sm font-semibold rounded-xl border border-stone-200 transition-colors shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg> Calculator
             </button>
          </div>
        </div>

        {/* --- FILTER POPOVER MENU --- */}
        {isFilterMenuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsFilterMenuOpen(false)} />
            <div className="absolute top-[140px] left-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-stone-200 p-5 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-3 border-b border-stone-100 pb-2">
                <h3 className="font-bold text-stone-800">Filter Inventory</h3>
                {isFilterActive && (
                  <button onClick={clearAllFilters} className="text-xs font-semibold text-amber-700 hover:text-amber-800 underline">Reset All</button>
                )}
              </div>
              
              <div className="mb-4">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">Category</label>
                <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} className="w-full bg-stone-50 border border-stone-200 text-stone-700 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-amber-500 font-medium">
                  <option value="All">All Categories</option>
                  <option value="Lacquerware">Lacquerware</option>
                  <option value="Masks">Masks</option>
                  <option value="Weaving">Weaving</option>
                  <option value="Wood Carvings">Wood Carvings</option>
                  <option value="Brassware">Brassware</option>
                  <option value="Paintings">Paintings</option>
                </select>
              </div>

              <div className="mb-4 pt-3 border-t border-stone-100">
                <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">Price Range (Rs.)</label>
                <div className="mb-3 px-1">
                  <input type="range" min="0" max={highestPrice} step="500" value={maxPrice === '' ? highestPrice : Number(maxPrice)} onChange={(e) => setMaxPrice(e.target.value)} className="w-full accent-amber-700 cursor-pointer h-1.5 bg-stone-200 rounded-lg" />
                  <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1 font-semibold">
                    <span>Rs. 0</span>
                    <span>Rs. {highestPrice.toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <span className="text-[10px] text-stone-400 font-semibold uppercase block mb-1">Min Price</span>
                    <input type="number" min="0" placeholder="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-600" />
                  </div>
                  <span className="text-stone-300 font-bold self-end mb-1">-</span>
                  <div className="flex-1">
                    <span className="text-[10px] text-stone-400 font-semibold uppercase block mb-1">Max Price</span>
                    <input type="number" min="0" placeholder="Any" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-full bg-stone-50 border border-stone-200 text-stone-800 text-xs font-bold rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-600" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-2 pt-3 border-t border-stone-100">
                <span className="text-sm font-semibold text-stone-700">In Stock Only</span>
                <button onClick={() => { setInStockOnly(!inStockOnly); if (!inStockOnly) setOutOfStockOnly(false); }} className={`w-11 h-6 rounded-full transition-colors relative ${inStockOnly ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${inStockOnly ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>

              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-semibold text-stone-700">Out of Stock Only</span>
                <button onClick={() => { setOutOfStockOnly(!outOfStockOnly); if (!outOfStockOnly) setInStockOnly(false); }} className={`w-11 h-6 rounded-full transition-colors relative ${outOfStockOnly ? 'bg-red-500' : 'bg-stone-300'}`}>
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${outOfStockOnly ? 'translate-x-5' : 'translate-x-0'}`}></span>
                </button>
              </div>
              
              <button onClick={() => setIsFilterMenuOpen(false)} className="w-full mt-5 bg-amber-700 hover:bg-amber-800 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm">
                Apply Filters
              </button>
            </div>
          </>
        )}

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 bg-white p-6 rounded-2xl shadow-sm border border-stone-200 overflow-y-auto">
            {isCameraActive ? (
              <div className="py-8 flex flex-col items-center justify-center animate-in fade-in duration-200">
                <CameraScanner onScanSuccess={handleBarcodeScanned} />
                <button onClick={() => setIsCameraActive(false)} className="mt-6 text-sm font-bold text-stone-600 hover:text-stone-800 bg-stone-100 px-6 py-3 rounded-xl border border-stone-200 transition-colors">Close Camera</button>
              </div>
            ) : (
              <ProductGrid 
                searchQuery={searchQuery} 
                sortBy={sortBy}
                activeCategory={activeCategory}
                inStockOnly={inStockOnly}
                outOfStockOnly={outOfStockOnly}
                minPrice={minPrice}
                maxPrice={maxPrice}
              />
            )}
          </div>
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
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              </div>
              
              <div className="mb-6 p-4 bg-stone-50 border border-stone-200 rounded-xl">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Step 1: Cash Drawer Reconciliation</h4>
                <p className="text-sm text-stone-600 mb-4">Please count the physical cash in your drawer and enter it below to verify.</p>
                
                <div className="flex gap-2 mb-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 font-bold">Rs.</span>
                    <input 
                      type="number"
                      value={declaredCash}
                      onChange={(e) => setDeclaredCash(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-stone-200 rounded-lg font-bold text-stone-800 focus:outline-none focus:border-amber-500 shadow-sm"
                    />
                  </div>
                  <button 
                    onClick={handleVerifyCash}
                    disabled={isVerifyingCash || !declaredCash}
                    className="px-4 py-2.5 bg-stone-800 hover:bg-stone-900 disabled:bg-stone-300 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-sm"
                  >
                    {isVerifyingCash ? 'Checking...' : 'Verify'}
                  </button>
                </div>

                {varianceMessage && (
                  <div className={`p-3 rounded-lg text-sm font-bold border ${varianceMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {varianceMessage.text}
                  </div>
                )}

                {userRole === 'admin' && (
                  <div className="mt-4 pt-4 border-t border-stone-200">
                    <button onClick={() => setIsHistoryOpen(true)} className="w-full py-2 bg-white border border-stone-200 hover:border-amber-400 hover:bg-amber-50 text-stone-700 font-bold rounded-lg transition-colors flex items-center justify-center shadow-sm text-sm">
                      <svg className="w-4 h-4 mr-2 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                      Admin: View Today's History
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-2 p-4 bg-stone-50 border border-stone-200 rounded-xl">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Step 2: Data Synchronization</h4>
                {unsyncedCount === 0 ? (
                  <div className="flex items-center text-emerald-600 font-semibold text-sm">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    All data successfully synced to server.
                  </div>
                ) : (
                  <div className="flex items-start text-amber-700 font-semibold text-sm bg-amber-100/50 p-3 rounded-lg border border-amber-200">
                    <svg className="w-5 h-5 mr-2 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    <div>
                      <span className="block font-bold">Warning: {unsyncedCount} orders pending.</span>
                      <span className="text-xs font-normal opacity-90 block mt-1">Do not log out until the network restores and data is uploaded.</span>
                    </div>
                  </div>
                )}
              </div>

                {/* NEW: Shift Remarks Text Box */}
              <div className="mb-2 p-4 bg-stone-50 border border-stone-200 rounded-xl">
                <h4 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Step 3: Shift Remarks (Optional)</h4>
                <textarea
                  value={sessionRemark}
                  onChange={(e) => setSessionRemark(e.target.value)}
                  placeholder="Add any notes regarding variances, refunds, or shift events..."
                  className="w-full p-3 bg-white border border-stone-200 rounded-lg text-sm text-stone-800 focus:outline-none focus:border-amber-500 shadow-sm resize-none"
                  rows={2}
                ></textarea>
              </div>


              {logoutMessage && <div className="mt-4 text-xs font-bold text-red-600 bg-red-50 p-3 rounded-lg text-center border border-red-100">{logoutMessage}</div>}
            </div>
            <div className="flex border-t border-stone-200 bg-stone-50">
              <button onClick={() => setIsLogoutConfirmOpen(false)} className="flex-1 py-4 font-bold text-stone-600 hover:bg-stone-100 transition-colors border-r border-stone-200">Return to POS</button>
              <button 
                onClick={handleLogout} 
                disabled={unsyncedCount > 0 || !isCashVerified} 
                className={`flex-1 py-4 font-black transition-colors ${unsyncedCount > 0 || !isCashVerified ? 'bg-stone-200 text-stone-400 cursor-not-allowed' : 'text-red-600 hover:bg-red-50'}`}
              >
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {isCalculatorOpen && <CalculatorModal onClose={() => setIsCalculatorOpen(false)} />}
      {isHistoryOpen && <HistoryModal onClose={() => setIsHistoryOpen(false)} />}
      {isOnlineOrdersOpen && (
        <OnlineOrdersModal 
          onClose={() => setIsOnlineOrdersOpen(false)} 
          onOrderProcessed={() => setPendingOnlineCount((prev) => Math.max(0, prev - 1))}
        />
      )}
    </div>
  );
}