'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// Dynamic imports for heavy export libraries
const exportToExcel = async (sessions: POSSession[]) => {
  const XLSX = await import('xlsx');
  const exportData = sessions.map((s) => ({
    'Session ID': s.id,
    'Cashier Name': s.profiles?.full_name || 'Unknown',
    'Status': s.status.toUpperCase(),
    'Opened At': new Date(s.start_time).toLocaleString(),
    'Closed At': s.end_time ? new Date(s.end_time).toLocaleString() : '—',
    'Starting Float (LKR)': s.starting_float,
    'Expected Cash (LKR)': s.expected_closing_cash || 0,
    'Declared Cash (LKR)': s.declared_closing_cash || 0,
    'Variance (LKR)': s.variance || 0,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'POS Sessions');
  XLSX.writeFile(workbook, `KCC_POS_Sessions_${new Date().toISOString().split('T')[0]}.xlsx`);
};

const exportToPDF = async (sessions: POSSession[]) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');

  const doc = new jsPDF('landscape');
  doc.setFontSize(18);
  doc.setTextColor(180, 83, 9);
  doc.text('KANDYAN CULTURAL CENTER', 14, 22);

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text('POS Register Sessions & Variance Report', 14, 30);
  doc.text(`Compiled: ${new Date().toLocaleString()}`, 14, 36);

  const tableRows = sessions.map((s) => [
    s.id.slice(0, 8),
    s.profiles?.full_name || 'Unknown',
    new Date(s.start_time).toLocaleDateString(),
    s.status.toUpperCase(),
    s.starting_float.toLocaleString(),
    (s.expected_closing_cash || 0).toLocaleString(),
    (s.declared_closing_cash || 0).toLocaleString(),
    (s.variance || 0).toLocaleString(),
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Ref ID', 'Cashier', 'Date', 'Status', 'Float', 'Expected', 'Declared', 'Variance']],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [45, 35, 20], textColor: [255, 255, 255] },
    styles: { fontSize: 8.5 },
    columnStyles: {
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' },
      7: { halign: 'right', fontStyle: 'bold' },
    },
  });

  doc.save(`KCC_POS_Sessions_${new Date().toISOString().split('T')[0]}.pdf`);
};

type POSSession = {
  id: string;
  cashier_id: string;
  start_time: string;
  end_time: string | null;
  starting_float: number;
  expected_closing_cash: number | null;
  declared_closing_cash: number | null;
  variance: number | null;
  status: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
};

export default function AdminPOSSessionsPage() {
  const [sessions, setSessions] = useState<POSSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const { data, error } = await supabase
          .from('pos_sessions')
          .select(`
            *,
            profiles:cashier_id (full_name, email)
          `)
          .order('start_time', { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (err) {
        console.error('Failed to load POS sessions:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const summary = useMemo(() => {
    let active = 0;
    let totalShortage = 0;
    let totalOverage = 0;

    sessions.forEach(s => {
      if (s.status === 'active') active++;
      if (s.variance && s.variance < 0) totalShortage += Math.abs(s.variance);
      if (s.variance && s.variance > 0) totalOverage += s.variance;
    });

    return { active, totalShortage, totalOverage };
  }, [sessions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">POS Sessions Tracker</h1>
            <p className="text-sm text-slate-500 mt-1">Audit active registers and end-of-day drawer closures.</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => exportToExcel(sessions)}
              disabled={sessions.length === 0}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
            >
              Excel Export
            </button>
            <button
              onClick={() => exportToPDF(sessions)}
              disabled={sessions.length === 0}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50"
            >
              PDF Print
            </button>
            <Link
              href="/admin/orders"
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              ← Back to Orders
            </Link>
          </div>
        </div>

        {/* Financial Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white/60 backdrop-blur-xl border border-slate-200/60 p-6 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-400/10 rounded-full blur-2xl"></div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Active Registers</p>
            <div className="flex items-center gap-3">
              <h3 className="text-3xl font-black text-slate-900">{summary.active}</h3>
              {summary.active > 0 && (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              )}
            </div>
          </div>

          <div className="bg-rose-50/50 border border-rose-100 p-6 rounded-3xl shadow-sm">
            <p className="text-[10px] font-extrabold text-rose-500 uppercase tracking-widest mb-1">All-Time Cash Shortages</p>
            <h3 className="text-3xl font-black text-rose-700">- LKR {summary.totalShortage.toLocaleString()}</h3>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-3xl shadow-sm">
            <p className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-widest mb-1">All-Time Cash Overages</p>
            <h3 className="text-3xl font-black text-emerald-700">+ LKR {summary.totalOverage.toLocaleString()}</h3>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          {sessions.length === 0 ? (
            <div className="p-16 text-center text-slate-500 font-medium border border-dashed border-slate-200 m-8 rounded-2xl">
              No POS sessions have been initiated yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Cashier / ID</th>
                    <th className="py-4 px-6">Schedule</th>
                    <th className="py-4 px-6 text-right">Starting Float</th>
                    <th className="py-4 px-6 text-right">Expected Drawer</th>
                    <th className="py-4 px-6 text-right">Declared Cash</th>
                    <th className="py-4 px-6 text-right">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sessions.map((row) => {
                    const isClosed = row.status !== 'active';
                    const variance = row.variance || 0;
                    
                    return (
                      <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6">
                          {isClosed ? (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">Closed</span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-200 animate-pulse">Active</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-extrabold text-slate-900">{row.profiles?.full_name || 'System User'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">Ref: {row.id.slice(0, 8)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-slate-800">{new Date(row.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">
                            {row.end_time ? `Closed: ${new Date(row.end_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : new Date(row.start_time).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-slate-600">
                          {row.starting_float.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-slate-800">
                          {row.expected_closing_cash !== null ? row.expected_closing_cash.toLocaleString() : '—'}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-slate-900">
                          {row.declared_closing_cash !== null ? row.declared_closing_cash.toLocaleString() : '—'}
                        </td>
                        <td className="py-4 px-6 text-right">
                          {!isClosed ? (
                            <span className="text-slate-300">—</span>
                          ) : (
                            <span className={`px-3 py-1 rounded-lg text-xs font-black ${
                              variance < 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                              variance > 0 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                              'text-slate-500'
                            }`}>
                              {variance > 0 ? '+' : ''}{variance.toLocaleString()}
                            </span>
                          )}
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