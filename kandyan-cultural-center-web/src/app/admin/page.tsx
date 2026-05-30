export const metadata = {
  title: 'Admin Dashboard | KCC',
};

export default function AdminDashboardPage() {
  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full">
      
      {/* Header Section */}
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Dashboard Overview</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Welcome back. Here is what is happening today.</p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        
        {/* KPI 1 */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">+12%</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Today's Revenue</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">LKR 45,000</h3>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 sm:p-3 bg-amber-50 text-amber-600 rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-md">3 Action Required</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Pending Orders</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">12</h3>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 sm:p-3 bg-blue-50 text-blue-600 rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <span className="text-[10px] sm:text-xs font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-md">2 New</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Hall Requests</p>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900">4</h3>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-rose-100 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 sm:p-3 bg-rose-50 text-rose-600 rounded-xl">
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
          </div>
          <p className="text-xs sm:text-sm font-bold text-rose-400 uppercase tracking-wider mb-1">Low Stock Alerts</p>
          <h3 className="text-xl sm:text-2xl font-black text-rose-600">8 Items</h3>
        </div>

      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sm:p-8 text-center text-slate-500 min-h-[250px] sm:min-h-[300px] flex items-center justify-center">
        <span className="text-sm sm:text-base">(Sales Chart / Recent Activity Feed will go here)</span>
      </div>
    </div>
  );
}