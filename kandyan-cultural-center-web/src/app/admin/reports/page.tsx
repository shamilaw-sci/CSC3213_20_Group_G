'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function FinancialReportsPage() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); 

  const availableMonths = useMemo(() => {
    const months = [];
    const date = new Date();
    date.setDate(1); 
    
    for (let i = 0; i < 12; i++) {
      const monthStr = date.toISOString().slice(0, 7); 
      const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      months.push({ value: monthStr, label });
      date.setMonth(date.getMonth() - 1);
    }
    return months;
  }, []);

  const fetchFinancialData = async () => {
    setIsLoading(true);
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        created_at,
        sales_channel,
        order_items (
          quantity,
          cost_price_at_sale,
          selling_price_at_sale,
          artifact_variants (
            color_name,
            artifacts (name, category)
          )
        )
      `)
      .eq('status', 'completed')
      .order('created_at', { ascending: false });

    if (orders) setRawData(orders);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const processedReport = useMemo(() => {
    const reportMap = new Map();
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalItemsSold = 0;

    rawData.forEach(order => {
      const orderMonth = order.created_at.slice(0, 7);
      if (selectedMonth !== 'all' && orderMonth !== selectedMonth) return;

      order.order_items?.forEach((item: any) => {
        const itemName = `${item.artifact_variants?.artifacts?.name} - ${item.artifact_variants?.color_name}`;
        const category = item.artifact_variants?.artifacts?.category || 'Unknown';
        
        const revenue = item.selling_price_at_sale * item.quantity;
        const cost = item.cost_price_at_sale * item.quantity;
        const profit = revenue - cost;

        totalRevenue += revenue;
        totalProfit += profit;
        totalItemsSold += item.quantity;

        if (reportMap.has(itemName)) {
          const existing = reportMap.get(itemName);
          existing.quantity += item.quantity;
          existing.revenue += revenue;
          existing.profit += profit;
        } else {
          reportMap.set(itemName, {
            name: itemName,
            category: category,
            quantity: item.quantity,
            revenue: revenue,
            profit: profit
          });
        }
      });
    });

    return {
      rows: Array.from(reportMap.values()).sort((a, b) => b.profit - a.profit), 
      summary: { totalRevenue, totalProfit, totalItemsSold }
    };
  }, [rawData, selectedMonth]);

  // EXPORT TO EXCEL
  const exportToExcel = () => {
    const exportData = processedReport.rows.map(row => ({
      'Artifact / Variant': row.name,
      'Category': row.category,
      'Units Sold': row.quantity,
      'Gross Revenue (LKR)': row.revenue,
      'Net Profit (LKR)': row.profit
    }));

    exportData.push({
      'Artifact / Variant': 'TOTALS',
      'Category': '',
      'Units Sold': processedReport.summary.totalItemsSold,
      'Gross Revenue (LKR)': processedReport.summary.totalRevenue,
      'Net Profit (LKR)': processedReport.summary.totalProfit
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Financial Report");
    
    const fileName = `KCC_Financial_Report_${selectedMonth === 'all' ? 'All_Time' : selectedMonth}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // EXPORT TO PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    const periodLabel = selectedMonth === 'all' ? 'All Time' : availableMonths.find(m => m.value === selectedMonth)?.label;

    doc.setFontSize(20);
    doc.setTextColor(245, 158, 11); 
    doc.text('KANDYAN CULTURAL CENTER', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85); 
    doc.text(`Financial Performance Report`, 14, 30);
    doc.text(`Period: ${periodLabel}`, 14, 36);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 42);

    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 48, 182, 25, 'FD');
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Revenue: LKR ${processedReport.summary.totalRevenue.toLocaleString()}`, 20, 58);
    doc.text(`Total Net Profit: LKR ${processedReport.summary.totalProfit.toLocaleString()}`, 20, 66);
    doc.text(`Total Units Sold: ${processedReport.summary.totalItemsSold}`, 120, 58);

    const tableColumn = ["Artifact / Variant", "Category", "Units Sold", "Revenue (LKR)", "Net Profit (LKR)"];
    const tableRows = processedReport.rows.map(row => [
      row.name,
      row.category,
      row.quantity.toString(),
      row.revenue.toLocaleString(),
      row.profit.toLocaleString()
    ]);

    autoTable(doc, {
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold', textColor: [5, 150, 105] } 
      },
    });

    const fileName = `KCC_Financial_Report_${selectedMonth === 'all' ? 'All_Time' : selectedMonth}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full relative z-10">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 md:p-8 rounded-[2rem] shadow-sm w-full md:w-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Financial Reports</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">Analyze sales performance and export data.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
          <div className="relative">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-auto bg-white/60 backdrop-blur-md border border-white/80 text-slate-700 px-5 py-3.5 rounded-[1.25rem] font-bold outline-none focus:ring-2 focus:ring-amber-500 shadow-sm appearance-none pr-10 min-w-[200px] cursor-pointer"
            >
              <option value="all" className="bg-white">All Time</option>
              {availableMonths.map(m => (
                <option key={m.value} value={m.value} className="bg-white">{m.label}</option>
              ))}
            </select>
            <svg className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={exportToExcel} disabled={processedReport.rows.length === 0} className="flex-1 sm:flex-none justify-center bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] px-5 py-3.5 rounded-[1.25rem] font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base transform hover:-translate-y-0.5">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Excel
            </button>
            <button onClick={exportToPDF} disabled={processedReport.rows.length === 0} className="flex-1 sm:flex-none justify-center bg-rose-600 hover:bg-rose-500 text-white shadow-[0_4px_14px_rgba(225,29,72,0.3)] px-5 py-3.5 rounded-[1.25rem] font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base transform hover:-translate-y-0.5">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div></div>
      ) : (
        <>
          {/* Summary KPI Cards (Glassmorphism) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/80 shadow-sm">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Gross Revenue</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">LKR {processedReport.summary.totalRevenue.toLocaleString()}</h3>
            </div>
            {/* Special Highlight for Profit Card */}
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 sm:p-8 rounded-[2rem] border border-amber-400 shadow-[0_15px_30px_rgba(245,158,11,0.25)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[30px] rounded-full pointer-events-none"></div>
              <p className="text-[10px] font-extrabold text-amber-100 uppercase tracking-widest mb-2 relative z-10">Net Profit</p>
              <h3 className="text-3xl font-black text-white tracking-tight relative z-10">LKR {processedReport.summary.totalProfit.toLocaleString()}</h3>
            </div>
            <div className="bg-white/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/80 shadow-sm">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Total Units Sold</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{processedReport.summary.totalItemsSold} <span className="text-xl font-bold text-slate-400">Items</span></h3>
            </div>
          </div>

          {/* ================== MOBILE CARD LAYOUT (< md) ================== */}
          <div className="md:hidden space-y-4 animate-in fade-in duration-700">
            {processedReport.rows.length === 0 ? (
              <div className="bg-white/60 backdrop-blur-md p-10 text-center font-bold text-slate-500 rounded-[2rem] border border-white/80 shadow-sm">
                No completed sales found for this period.
              </div>
            ) : (
              processedReport.rows.map((row, index) => (
                <div key={index} className="bg-white/60 backdrop-blur-md border border-white/80 rounded-[2rem] shadow-sm p-5">
                  <div className="border-b border-white/60 pb-4 mb-4">
                    <h4 className="font-black text-slate-900 text-base leading-tight pr-2">{row.name}</h4>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-2 bg-white/50 w-max px-2.5 py-1 rounded-md">{row.category}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center bg-white/50 border border-white/60 p-3 rounded-2xl shadow-sm">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Units</p>
                      <p className="font-black text-slate-900 text-base">{row.quantity}</p>
                    </div>
                    <div className="text-center bg-white/50 border border-white/60 p-3 rounded-2xl shadow-sm">
                      <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">Revenue</p>
                      <p className="font-black text-slate-700 text-xs sm:text-sm">{row.revenue.toLocaleString()}</p>
                    </div>
                    <div className="text-center bg-amber-50 border border-amber-200/50 p-3 rounded-2xl shadow-sm">
                      <p className="text-[9px] font-extrabold text-amber-600/70 uppercase tracking-widest mb-1.5">Profit</p>
                      <p className="font-black text-amber-600 text-xs sm:text-sm">+{row.profit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ================== DESKTOP TABLE LAYOUT (>= md) ================== */}
          <div className="hidden md:block bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] overflow-hidden animate-in fade-in duration-700">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/40 border-b border-white/60 text-slate-500 uppercase tracking-widest text-[10px] font-extrabold">
                  <tr>
                    <th className="px-8 py-5">Artifact (Variant)</th>
                    <th className="px-6 py-5">Category</th>
                    <th className="px-6 py-5 text-center">Units Sold</th>
                    <th className="px-6 py-5 text-right">Revenue (LKR)</th>
                    <th className="px-8 py-5 text-right">Net Profit (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {processedReport.rows.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center font-bold text-slate-500">No completed sales found for this period.</td></tr>
                  ) : (
                    processedReport.rows.map((row, index) => (
                      <tr key={index} className="hover:bg-white/50 transition-colors">
                        <td className="px-8 py-5 font-black text-slate-900 text-base">{row.name}</td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/50 px-3 py-1.5 rounded-lg border border-white/60">
                            {row.category}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center font-black text-slate-700 text-base">{row.quantity}</td>
                        <td className="px-6 py-5 text-right font-bold text-slate-600 text-base">{row.revenue.toLocaleString()}</td>
                        <td className="px-8 py-5 text-right font-black text-amber-600 text-base">+{row.profit.toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}