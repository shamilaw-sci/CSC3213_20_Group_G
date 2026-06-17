'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function FinancialReportsPage() {
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>('all'); // Format: YYYY-MM

  // Generate a list of available months based on the current date (Last 12 months)
  const availableMonths = useMemo(() => {
    const months = [];
    const date = new Date();
    // Force the date to the 1st of the month to prevent the "31st skipping February" bug
    date.setDate(1); 
    
    for (let i = 0; i < 12; i++) {
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM
      const label = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      months.push({ value: monthStr, label });
      date.setMonth(date.getMonth() - 1);
    }
    return months;
  }, []);

  const fetchFinancialData = async () => {
    setIsLoading(true);
    
    // Fetch only completed orders to ensure accurate profit
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

  // Process data based on the selected month filter
  const processedReport = useMemo(() => {
    const reportMap = new Map();
    let totalRevenue = 0;
    let totalProfit = 0;
    let totalItemsSold = 0;

    rawData.forEach(order => {
      const orderMonth = order.created_at.slice(0, 7);
      
      // Filter by month
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
      rows: Array.from(reportMap.values()).sort((a, b) => b.profit - a.profit), // Sort by highest profit
      summary: { totalRevenue, totalProfit, totalItemsSold }
    };
  }, [rawData, selectedMonth]);

  // ===================== EXPORT TO EXCEL =====================
  const exportToExcel = () => {
    const exportData = processedReport.rows.map(row => ({
      'Artifact / Variant': row.name,
      'Category': row.category,
      'Units Sold': row.quantity,
      'Gross Revenue (LKR)': row.revenue,
      'Net Profit (LKR)': row.profit
    }));

    // Add Summary Row
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

  // ===================== EXPORT TO PDF =====================
  const exportToPDF = () => {
    const doc = new jsPDF();
    const periodLabel = selectedMonth === 'all' ? 'All Time' : availableMonths.find(m => m.value === selectedMonth)?.label;

    // Document Header
    doc.setFontSize(20);
    doc.setTextColor(245, 158, 11); // Amber
    doc.text('KANDYAN CULTURAL CENTER', 14, 22);
    
    doc.setFontSize(12);
    doc.setTextColor(51, 65, 85); // Slate
    doc.text(`Financial Performance Report`, 14, 30);
    doc.text(`Period: ${periodLabel}`, 14, 36);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 42);

    // Summary Box
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 48, 182, 25, 'FD');
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`Total Revenue: LKR ${processedReport.summary.totalRevenue.toLocaleString()}`, 20, 58);
    doc.text(`Total Net Profit: LKR ${processedReport.summary.totalProfit.toLocaleString()}`, 20, 66);
    doc.text(`Total Units Sold: ${processedReport.summary.totalItemsSold}`, 120, 58);

    // Data Table
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
        4: { halign: 'right', fontStyle: 'bold', textColor: [5, 150, 105] } // Green profit
      },
    });

    const fileName = `KCC_Financial_Report_${selectedMonth === 'all' ? 'All_Time' : selectedMonth}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10 gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Financial Reports</h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Analyze sales performance and export aggregate data.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200 text-slate-700 px-4 py-3 rounded-xl font-bold outline-none focus:ring-2 focus:ring-amber-500 min-w-[200px]"
          >
            <option value="all">All Time</option>
            {availableMonths.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={exportToExcel} disabled={processedReport.rows.length === 0} className="flex-1 sm:flex-none justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 sm:px-5 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
              Excel
            </button>
            <button onClick={exportToPDF} disabled={processedReport.rows.length === 0} className="flex-1 sm:flex-none justify-center bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-4 sm:px-5 py-3 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
              PDF
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 sm:w-10 sm:h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div></div>
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 sm:mb-2">Gross Revenue</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">LKR {processedReport.summary.totalRevenue.toLocaleString()}</h3>
            </div>
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 sm:p-6 rounded-2xl border border-slate-700 shadow-md">
              <p className="text-xs sm:text-sm font-bold text-amber-500/80 uppercase tracking-wider mb-1 sm:mb-2">Net Profit</p>
              <h3 className="text-2xl sm:text-3xl font-black text-amber-500">LKR {processedReport.summary.totalProfit.toLocaleString()}</h3>
            </div>
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
              <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 sm:mb-2">Total Units Sold</p>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">{processedReport.summary.totalItemsSold} Items</h3>
            </div>
          </div>

          {/* ================== MOBILE CARD LAYOUT (< md) ================== */}
          <div className="md:hidden space-y-4 animate-in fade-in duration-700">
            {processedReport.rows.length === 0 ? (
              <div className="bg-white p-8 text-center text-slate-500 rounded-2xl border border-slate-200 shadow-sm">
                No completed sales found for this period.
              </div>
            ) : (
              processedReport.rows.map((row, index) => (
                <div key={index} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
                  <div className="border-b border-slate-100 pb-3 mb-3">
                    <h4 className="font-bold text-slate-900 text-sm leading-tight pr-2">{row.name}</h4>
                    <p className="text-xs text-slate-500 mt-1">{row.category}</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center bg-slate-50 p-2 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Units</p>
                      <p className="font-black text-slate-700 text-sm">{row.quantity}</p>
                    </div>
                    <div className="text-center bg-slate-50 p-2 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Revenue</p>
                      <p className="font-bold text-slate-600 text-xs sm:text-sm">{row.revenue.toLocaleString()}</p>
                    </div>
                    <div className="text-center bg-emerald-50/50 p-2 rounded-xl border border-emerald-100">
                      <p className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-widest mb-1">Profit</p>
                      <p className="font-black text-emerald-600 text-xs sm:text-sm">+{row.profit.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ================== DESKTOP TABLE LAYOUT (>= md) ================== */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-700">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-widest text-[10px] font-bold">
                  <tr>
                    <th className="px-6 py-4">Artifact (Variant)</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4 text-center">Units Sold</th>
                    <th className="px-6 py-4 text-right">Revenue (LKR)</th>
                    <th className="px-6 py-4 text-right">Net Profit (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {processedReport.rows.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-16 text-center text-slate-500">No completed sales found for this period.</td></tr>
                  ) : (
                    processedReport.rows.map((row, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{row.name}</td>
                        <td className="px-6 py-4 text-slate-500">{row.category}</td>
                        <td className="px-6 py-4 text-center font-black text-slate-700">{row.quantity}</td>
                        <td className="px-6 py-4 text-right font-medium text-slate-600">{row.revenue.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right font-black text-emerald-600">+{row.profit.toLocaleString()}</td>
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