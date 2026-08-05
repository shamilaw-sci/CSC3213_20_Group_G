'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type ArtisanPerformance = {
  id: string;
  name: string;
  guild: string;
  avatar_url: string;
  workshopsCount: number;
  totalBookings: number;
  totalGuests: number;
  grossRevenue: number;
  artisanPayout: number; // e.g. 85% share
};

export default function ArtisanEarningsPage() {
  const [loading, setLoading] = useState(true);
  const [artisansList, setArtisansList] = useState<ArtisanPerformance[]>([]);

  useEffect(() => {
    async function loadArtisanEarnings() {
      setLoading(true);
      try {
        // 1. Fetch artisans, workshops, and confirmed bookings simultaneously
        const [
          { data: artisans },
          { data: workshops },
          { data: bookings }
        ] = await Promise.all([
          supabase.from('artisans').select('*'),
          supabase.from('workshops').select('id, title, price, artisan_id'),
          supabase.from('workshop_bookings').select('workshop_id, guests, status').eq('status', 'confirmed')
        ]);

        if (!artisans || !workshops) return;

        // 2. Map revenue and guests by workshop_id
        const workshopStatsMap = new Map<string, { bookings: number; guests: number; revenue: number }>();

        (bookings || []).forEach((b) => {
          if (!b.workshop_id) return;
          const workshopObj = workshops.find((w) => w.id === b.workshop_id);
          const price = Number(workshopObj?.price) || 3500;
          const guestCount = Number(b.guests) || 1;
          const bookingRevenue = price * guestCount;

          const current = workshopStatsMap.get(b.workshop_id) || { bookings: 0, guests: 0, revenue: 0 };
          workshopStatsMap.set(b.workshop_id, {
            bookings: current.bookings + 1,
            guests: current.guests + guestCount,
            revenue: current.revenue + bookingRevenue,
          });
        });

        // 3. Aggregate totals per Artisan and FILTER OUT anyone without active workshops
        const resultList: ArtisanPerformance[] = [];

        artisans.forEach((artisan) => {
          const artisanWorkshops = workshops.filter((w) => w.artisan_id === artisan.id);

          // Skip artisans who do not host any workshops
          if (artisanWorkshops.length === 0) return;

          let totalBookings = 0;
          let totalGuests = 0;
          let grossRevenue = 0;

          artisanWorkshops.forEach((w) => {
            const stats = workshopStatsMap.get(w.id);
            if (stats) {
              totalBookings += stats.bookings;
              totalGuests += stats.guests;
              grossRevenue += stats.revenue;
            }
          });

          // Only display artisans who have workshops assigned to them
          resultList.push({
            id: artisan.id,
            name: artisan.name,
            guild: artisan.guild || 'Kandyan Heritage Guild',
            avatar_url: artisan.avatar_url || '/default-workshop.jpg',
            workshopsCount: artisanWorkshops.length,
            totalBookings,
            totalGuests,
            grossRevenue,
            artisanPayout: grossRevenue * 0.85, // 85% Guild/Instructor Payout Share
          });
        });

        // Sort descending by highest earnings
        setArtisansList(resultList.sort((a, b) => b.grossRevenue - a.grossRevenue));
      } catch (err) {
        console.error('Error fetching artisan earnings:', err);
      } finally {
        setLoading(false);
      }
    }

    loadArtisanEarnings();
  }, []);

  const summary = useMemo(() => {
    return artisansList.reduce(
      (acc, curr) => ({
        totalGross: acc.totalGross + curr.grossRevenue,
        totalPayouts: acc.totalPayouts + curr.artisanPayout,
        totalGuests: acc.totalGuests + curr.totalGuests,
      }),
      { totalGross: 0, totalPayouts: 0, totalGuests: 0 }
    );
  }, [artisansList]);

  const exportToExcel = () => {
    const exportData = artisansList.map((row) => ({
      'Artisan Name': row.name,
      'Craft Guild': row.guild,
      'Workshops Hosted': row.workshopsCount,
      'Confirmed Reservations': row.totalBookings,
      'Students Hosted': row.totalGuests,
      'Gross Yield Generated (LKR)': row.grossRevenue,
      'Artisan Payout Share 85% (LKR)': row.artisanPayout,
    }));

    exportData.push({
      'Artisan Name': 'TOTALS',
      'Craft Guild': '',
      'Workshops Hosted': artisansList.reduce((sum, r) => sum + r.workshopsCount, 0),
      'Confirmed Reservations': artisansList.reduce((sum, r) => sum + r.totalBookings, 0),
      'Students Hosted': summary.totalGuests,
      'Gross Yield Generated (LKR)': summary.totalGross,
      'Artisan Payout Share 85% (LKR)': summary.totalPayouts,
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Artisan Payouts');
    XLSX.writeFile(workbook, `KCC_Artisan_Earnings_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(180, 83, 9);
    doc.text('KANDYAN CULTURAL CENTER', 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text('Artisans Workshop Revenue & Guild Payout Report', 14, 30);
    doc.text(`Compiled Date: ${new Date().toLocaleDateString()}`, 14, 36);

    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 44, 182, 22, 'FD');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Gross Revenue: LKR ${summary.totalGross.toLocaleString()}`, 20, 53);
    doc.text(`Estimated Payouts (85%): LKR ${summary.totalPayouts.toLocaleString()}`, 20, 60);
    doc.text(`Total Students Hosted: ${summary.totalGuests}`, 120, 53);

    const tableColumn = ['Artisan Name', 'Guild', 'Classes', 'Students', 'Gross (LKR)', 'Payout (85%)'];
    const tableRows = artisansList.map((row) => [
      row.name,
      row.guild,
      row.workshopsCount.toString(),
      row.totalGuests.toString(),
      row.grossRevenue.toLocaleString(),
      row.artisanPayout.toLocaleString(),
    ]);

    autoTable(doc, {
      startY: 72,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [45, 35, 20], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5 },
      columnStyles: {
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'right' },
        5: { halign: 'right', fontStyle: 'bold' },
      },
    });

    doc.save(`KCC_Artisan_Earnings_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Artisan Earnings & Payouts</h1>
            <p className="text-sm text-slate-500 mt-1">
              Showing active workshop instructors and their generated ticket revenue
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={exportToExcel}
              disabled={artisansList.length === 0}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              Excel Export
            </button>
            <button
              onClick={exportToPDF}
              disabled={artisansList.length === 0}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            >
              PDF Print
            </button>
            <Link
              href="/admin/artisans"
              className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              ← Artisans Directory
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
              Total Workshops Revenue
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              LKR {summary.totalGross.toLocaleString()}
            </h3>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-6 rounded-3xl text-white shadow-md">
            <p className="text-[10px] font-extrabold text-amber-100 uppercase tracking-widest mb-1">
              Total Artisan Payout Share (85%)
            </p>
            <h3 className="text-2xl sm:text-3xl font-black">
              LKR {summary.totalPayouts.toLocaleString()}
            </h3>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-sm">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">
              Total Students Taught
            </p>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              {summary.totalGuests} <span className="text-sm font-bold text-slate-400">Guests</span>
            </h3>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          {loading ? (
            <div className="p-16 text-center text-slate-400 font-bold">
              Calculating artisan workshop revenues...
            </div>
          ) : artisansList.length === 0 ? (
            <div className="p-16 text-center text-slate-400">
              No artisans currently have active workshops assigned to them.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Master Artisan</th>
                    <th className="py-4 px-6 text-center">Workshops Hosted</th>
                    <th className="py-4 px-6 text-center">Confirmed Bookings</th>
                    <th className="py-4 px-6 text-center">Students Hosted</th>
                    <th className="py-4 px-6 text-right">Gross Revenue</th>
                    <th className="py-4 px-6 text-right">Artisan Share (85%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {artisansList.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={row.avatar_url}
                            alt={row.name}
                            className="w-10 h-10 rounded-full object-cover border border-amber-400 shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-slate-900">{row.name}</div>
                            <div className="text-[11px] text-slate-400">{row.guild}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-700">
                        {row.workshopsCount}
                      </td>
                      <td className="py-4 px-6 text-center text-slate-600">
                        {row.totalBookings}
                      </td>
                      <td className="py-4 px-6 text-center font-bold text-slate-800">
                        {row.totalGuests}
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        LKR {row.grossRevenue.toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-right font-black text-amber-600">
                        LKR {row.artisanPayout.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}