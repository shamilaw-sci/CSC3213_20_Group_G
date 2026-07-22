'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type WorkshopBooking = {
  id: string;
  created_at: string;
  booked_date: string;
  booked_time: string;
  workshop_id: string;
  workshop_title: string | null;
  craftsman: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  guests: number;
  notes: string | null;
  // Joined from the workshops table
  workshops?: {
    id: string;
    title?: string;
    price?: number;
  } | null;
};

export default function WorkshopFinancialReportsPage() {
  const [rawData, setRawData] = useState<WorkshopBooking[]>([]);
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
    try {
      // Query bookings while joining the related workshop's price and title
      const { data: bookings, error } = await supabase
        .from('workshop_bookings')
        .select(`
          id,
          created_at,
          booked_date,
          booked_time,
          workshop_id,
          workshop_title,
          craftsman,
          customer_name,
          customer_email,
          customer_phone,
          guests,
          notes,
          workshops (
            id,
            title,
            price
          )
        `)
        .order('booked_date', { ascending: false });

      if (error) {
        console.error("Supabase ledger retrieval error:", error.message);
      }

      if (bookings) {
        setRawData(bookings as unknown as WorkshopBooking[]);
      }
    } catch (err) {
      console.error("Failed fetching structural rows:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const processedReport = useMemo(() => {
    const reportMap = new Map();
    let totalRevenue = 0;
    let totalTickets = 0;
    let totalBookingsCount = 0;

    rawData.forEach(booking => {
      const bookingMonth = booking.booked_date?.slice(0, 7) || booking.created_at?.slice(0, 7);
      if (selectedMonth !== 'all' && bookingMonth !== selectedMonth) return;

      // Fall back to workshop relation title, then booking title, then default
      const title = booking.workshops?.title || booking.workshop_title || 'General Experience Session';
      const spots = booking.guests || 1;
      
      // Fetch fixed price from the joined workshops table (default to 3500 if unassigned)
      const sessionPrice = Number(booking.workshops?.price) || 3500;
      const revenue = sessionPrice;
      
      const calculatedCost = revenue * 0.15; 
      const profit = revenue - calculatedCost;

      totalRevenue += revenue;
      totalTickets += spots;
      totalBookingsCount += 1;

      if (reportMap.has(title)) {
        const existing = reportMap.get(title);
        existing.bookingsCount += 1;
        existing.ticketsSold += spots;
        existing.revenue += revenue;
        existing.profit += profit;
      } else {
        reportMap.set(title, {
          name: title,
          craftsman: booking.craftsman || 'Master Artisan',
          bookingsCount: 1,
          ticketsSold: spots,
          revenue: revenue,
          profit: profit
        });
      }
    });

    return {
      rows: Array.from(reportMap.values()).sort((a, b) => b.revenue - a.revenue), 
      summary: { totalRevenue, totalProfit: totalRevenue * 0.85, totalTickets, totalBookingsCount }
    };
  }, [rawData, selectedMonth]);

  const exportToExcel = () => {
    const exportData = processedReport.rows.map(row => ({
      'Workshop Experience': row.name,
      'Lead Artisan': row.craftsman,
      'Total Reservations': row.bookingsCount,
      'Attendees Hosted': row.ticketsSold,
      'Gross Yield (LKR)': row.revenue,
      'Net Earnings Est (LKR)': row.profit
    }));

    exportData.push({
      'Workshop Experience': 'TOTALS',
      'Lead Artisan': '',
      'Total Reservations': processedReport.summary.totalBookingsCount,
      'Attendees Hosted': processedReport.summary.totalTickets,
      'Gross Yield (LKR)': processedReport.summary.totalRevenue,
      'Net Earnings Est (LKR)': processedReport.summary.totalProfit
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Workshop Performance");
    
    const fileName = `KCC_Workshops_Financial_${selectedMonth === 'all' ? 'All_Time' : selectedMonth}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const periodLabel = selectedMonth === 'all' ? 'All Time Records' : availableMonths.find(m => m.value === selectedMonth)?.label;

    doc.setFontSize(18);
    doc.setTextColor(180, 83, 9); 
    doc.text('KANDYAN CULTURAL CENTER', 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); 
    doc.text(`Workshops Ledger & Session Financial Report`, 14, 30);
    doc.text(`Reporting Framework: ${periodLabel}`, 14, 36);
    doc.text(`Compiled Vector: ${new Date().toLocaleDateString()}`, 14, 42);

    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 48, 182, 25, 'FD');
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Gross Booking Inflow: LKR ${processedReport.summary.totalRevenue.toLocaleString()}`, 20, 58);
    doc.text(`Estimated Net Margin: LKR ${processedReport.summary.totalProfit.toLocaleString()}`, 20, 66);
    doc.text(`Total Attendees Cataloged: ${processedReport.summary.totalTickets}`, 120, 58);

    const tableColumn = ["Workshop Experience", "Lead Artisan", "Reservations", "Attendees", "Revenue (LKR)"];
    const tableRows = processedReport.rows.map(row => [
      row.name,
      row.craftsman,
      row.bookingsCount.toString(),
      row.ticketsSold.toString(),
      row.revenue.toLocaleString()
    ]);

    autoTable(doc, {
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [45, 35, 20], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5 },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'right', fontStyle: 'bold' } 
      },
    });

    const fileName = `KCC_Workshop_Report_${selectedMonth === 'all' ? 'All_Time' : selectedMonth}.pdf`;
    doc.save(fileName);
  };

  return (
    <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto w-full relative z-10">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 sm:mb-10 gap-6">
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-6 md:p-8 rounded-[2rem] shadow-sm w-full md:w-auto">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Workshop Financials</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 font-medium">Analyze registration revenue, class turnouts, and artisan margins.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto">
          <div className="relative">
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-auto bg-white/60 backdrop-blur-md border border-white/80 text-slate-700 px-5 py-3.5 rounded-[1.25rem] font-bold outline-none focus:ring-2 focus:ring-amber-500 shadow-sm appearance-none pr-10 min-w-[200px] cursor-pointer"
            >
              <option value="all" className="bg-white">All Booking Records</option>
              {availableMonths.map(m => (
                <option key={m.value} value={m.value} className="bg-white">{m.label}</option>
              ))}
            </select>
            <svg className="w-5 h-5 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <button onClick={exportToExcel} disabled={processedReport.rows.length === 0} className="flex-1 sm:flex-none justify-center bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] px-5 py-3.5 rounded-[1.25rem] font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base transform hover:-translate-y-0.5">
              Excel Export
            </button>
            <button onClick={exportToPDF} disabled={processedReport.rows.length === 0} className="flex-1 sm:flex-none justify-center bg-rose-600 hover:bg-rose-500 text-white shadow-[0_4px_14px_rgba(225,29,72,0.3)] px-5 py-3.5 rounded-[1.25rem] font-bold transition-all flex items-center gap-2 disabled:opacity-50 text-sm sm:text-base transform hover:-translate-y-0.5">
              PDF Print
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-slate-200 border-t-amber-500 rounded-full animate-spin"></div></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            <div className="bg-white/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/80 shadow-sm">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Total Inflow Intake</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">LKR {processedReport.summary.totalRevenue.toLocaleString()}</h3>
            </div>
            
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 sm:p-8 rounded-[2rem] border border-amber-400 shadow-[0_15px_30px_rgba(245,158,11,0.25)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[30px] rounded-full pointer-events-none"></div>
              <p className="text-[10px] font-extrabold text-amber-100 uppercase tracking-widest mb-2 relative z-10">Artisan Operational Yield</p>
              <h3 className="text-3xl font-black text-white tracking-tight relative z-10">LKR {processedReport.summary.totalProfit.toLocaleString()}</h3>
            </div>
            
            <div className="bg-white/60 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/80 shadow-sm">
              <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">Total Attendees Hosted</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{processedReport.summary.totalTickets} <span className="text-xl font-bold text-slate-400">Students</span></h3>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-2xl border border-white/80 rounded-[2.5rem] shadow-[0_20px_50px_rgba(31,38,135,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white/40 border-b border-white/60 text-slate-500 uppercase tracking-widest text-[10px] font-extrabold">
                  <tr>
                    <th className="px-8 py-5">Workshop Experience</th>
                    <th className="px-6 py-5">Assigned Artisan</th>
                    <th className="px-6 py-5 text-center">Reservations</th>
                    <th className="px-6 py-5 text-center">Total Attendees</th>
                    <th className="px-8 py-5 text-right">Gross Yield (LKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                  {processedReport.rows.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center font-bold text-slate-500">No active reservation streams recorded within selected timelines.</td></tr>
                  ) : (
                    processedReport.rows.map((row, index) => (
                      <tr key={index} className="hover:bg-white/50 transition-colors">
                        <td className="px-8 py-5 font-black text-slate-900 text-base">{row.name}</td>
                        <td className="px-6 py-5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/50 px-3 py-1.5 rounded-lg border border-white/60">
                            {row.craftsman}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center font-bold text-slate-700">{row.bookingsCount} orders</td>
                        <td className="px-6 py-5 text-center font-black text-slate-700 text-base">{row.ticketsSold}</td>
                        <td className="px-8 py-5 text-right font-black text-amber-600 text-base">LKR {row.revenue.toLocaleString()}</td>
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