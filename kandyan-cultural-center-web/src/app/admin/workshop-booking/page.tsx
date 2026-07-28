'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Booking = {
  id: string;
  booked_date: string;
  booked_time?: string;
  workshop_title?: string;
  craftsman?: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  guests?: number | null;
  notes?: string | null;
  status?: string; // 🚨 ADDED
};

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookings() {
      try {
        const { data, error } = await supabase
          .from("workshop_bookings")
          .select("*")
          .order("booked_date", { ascending: true });

        if (error) {
          setError(error.message);
        } else {
          setBookings(data || []);
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  const exportToPDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const { default: autoTable } = await import("jspdf-autotable");

    const defaultPricePerTicket = 3500;
    let totalRevenue = 0;
    let totalTickets = 0;

    // 🚨 FIXED: Only calculate revenue for CONFIRMED bookings!
    const validBookings = bookings.filter(b => b.status === 'confirmed');

    validBookings.forEach((b) => {
      const party = b.guests || 1;
      totalTickets += party;
      totalRevenue += party * defaultPricePerTicket;
    });

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(180, 83, 9);
    doc.text("KANDYAN CULTURAL CENTER", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text("Workshops Booking Report", 14, 30);
    doc.text("Reporting Framework: Confirmed Records", 14, 36);
    doc.text(`Compiled Vector: ${new Date().toLocaleDateString()}`, 14, 42);

    doc.setDrawColor(241, 245, 249);
    doc.setFillColor(248, 250, 252);
    doc.rect(14, 48, 182, 25, "FD");

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text(`Gross Booking Inflow: LKR ${totalRevenue.toLocaleString()}`, 20, 58);
    doc.text(`Total Attendees Cataloged: ${totalTickets}`, 120, 58);

    const tableColumn = ["Workshop Experience", "Lead Artisan", "Date", "Customer", "Attendees", "Est. Yield (LKR)"];
    const tableRows = validBookings.map((b) => {
      const tickets = b.guests || 1;
      const rowYield = tickets * defaultPricePerTicket;
      return [
        b.workshop_title || "General Session",
        b.craftsman || "Master Artisan",
        b.booked_date,
        b.customer_name,
        tickets.toString(),
        rowYield.toLocaleString(),
      ];
    });

    autoTable(doc, {
      startY: 80,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [45, 35, 20], textColor: [255, 255, 255], fontStyle: "bold" },
      styles: { fontSize: 8.5 },
      columnStyles: {
        4: { halign: "center" },
        5: { halign: "right", fontStyle: "bold" },
      },
    });

    const fileName = `KCC_Workshop_Report_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  };

  const exportToExcel = async () => {
    const XLSX = await import("xlsx");

    const exportData = bookings.map((b) => ({
      "Status": (b.status || "pending").toUpperCase(),
      "Workshop Title": b.workshop_title || "N/A",
      "Craftsman": b.craftsman || "N/A",
      "Booked Date": b.booked_date,
      "Booked Time": b.booked_time || "N/A",
      "Customer Name": b.customer_name,
      "Customer Email": b.customer_email,
      "Customer Phone": b.customer_phone || "N/A",
      "Guests": b.guests || 1,
      "Notes": b.notes || "—",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservations");

    const fileName = `KCC_Workshop_Bookings_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-12 flex justify-center items-center font-bold text-slate-500">
        Loading booking logs...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 font-mono">
        Failed loading database rows: {error}
      </div>
    );
  }

  const todayStr = new Date().toISOString().split("T")[0];
  const activeBookings = bookings.filter((b) => b.booked_date >= todayStr);
  const pastBookings = bookings.filter((b) => b.booked_date < todayStr);

  // Reusable status badge component
  const StatusBadge = ({ status }: { status?: string }) => {
    if (status === 'confirmed') return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200 uppercase tracking-widest">Confirmed</span>;
    if (status === 'failed') return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200 uppercase tracking-widest">Failed</span>;
    return <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200 uppercase tracking-widest">Pending</span>;
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12 text-slate-900">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Reservations Pipeline</h1>
            <p className="text-sm text-slate-500">
              Live log system tracking <code className="bg-slate-200 px-1 py-0.5 rounded text-xs font-mono font-bold">public.workshop_bookings</code>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={exportToExcel}
                disabled={bookings.length === 0}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Excel Export
              </button>

              <button
                onClick={exportToPDF}
                disabled={bookings.length === 0}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                PDF Print
              </button>
            </div>

            <Link href="/admin/workshops" className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm">
              ← Main Workshop Panel
            </Link>
          </div>
        </div>

        {/* SECTION 1: ACTIVE / UPCOMING RESERVATIONS */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6">
          <h2 className="text-xl font-black mb-6 text-amber-700 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-600 inline-block animate-pulse"></span>
            Upcoming Bookings ({activeBookings.length})
          </h2>
          
          {activeBookings.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 italic text-center border border-dashed border-slate-200 rounded-2xl">
              No upcoming customer reservations scheduled.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Workshop / Craftsman</th>
                    <th className="py-3 px-4">Schedule Slot</th>
                    <th className="py-3 px-4">Customer Info</th>
                    <th className="py-3 px-4 text-center">Party Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {activeBookings.map((b) => (
                    <tr key={b.id} className={`transition-colors ${b.status === 'failed' ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                      <td className="py-4 px-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-black text-slate-800">{b.workshop_title || "Untitled Workshop"}</div>
                        <div className="text-xs text-slate-400 font-medium">By: {b.craftsman || "Not Assigned"}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-700">{b.booked_date}</div>
                        <div className="text-xs text-amber-600 font-bold tracking-wide uppercase">{b.booked_time}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-800">{b.customer_name}</div>
                        <div className="text-xs text-slate-400 font-mono">{b.customer_email}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="inline-block bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg text-xs font-black text-slate-700">
                          {b.guests || 1} {b.guests === 1 ? "Guest" : "Guests"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* SECTION 2: PAST / ARCHIVED HISTORY */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 opacity-75">
          <h2 className="text-xl font-black mb-6 text-slate-500 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-400 inline-block"></span>
            Past Experience History ({pastBookings.length})
          </h2>

          {pastBookings.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 italic text-center">No past event logs discovered inside database.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Workshop</th>
                    <th className="py-3 px-4">Date / Time</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4 text-center">Party Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pastBookings.map((b) => (
                    <tr key={b.id} className="bg-slate-50/20 text-slate-500">
                      <td className="py-3.5 px-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {b.workshop_title}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-mono">
                        <div className="line-through">{b.booked_date}</div>
                        <div>{b.booked_time}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-600">{b.customer_name}</div>
                        <div className="text-xs opacity-60 font-mono">{b.customer_email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-xs">
                        {b.guests}
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