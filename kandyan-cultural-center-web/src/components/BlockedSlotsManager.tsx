'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

type Workshop = {
  id: string;
  title: string;
};

type BlockedSlot = {
  id: string;
  blocked_date: string;
  blocked_time: string | null;
  reason: string | null;
  created_at: string;
  workshop_id: string | null;
  workshops?: { title: string } | null;
};

const DEFAULT_TIME_SLOTS = [
  '09:00 AM',
  '10:30 AM',
  '12:00 PM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
];

export default function BlockedSlotsManager() {
  const [blockedItems, setBlockedItems] = useState<BlockedSlot[]>([]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [blockType, setBlockType] = useState<'FULL_DAY' | 'TIME_SLOT'>('FULL_DAY');
  const [selectedTime, setSelectedTime] = useState<string>(DEFAULT_TIME_SLOTS[0]);
  const [customTime, setCustomTime] = useState<string>('');
  const [selectedWorkshopId, setSelectedWorkshopId] = useState<string>('all');
  const [reason, setReason] = useState<string>('Holiday / Closure');

  // Load blocked entries & workshops from Supabase
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch blocked entries
      const { data: blockedData, error: blockedError } = await supabase
        .from('blocked_dates')
        .select(`
          id,
          blocked_date,
          blocked_time,
          reason,
          created_at,
          workshop_id,
          workshops ( title )
        `)
        .order('blocked_date', { ascending: true });

      if (blockedError) throw blockedError;
      if (blockedData) setBlockedItems(blockedData as unknown as BlockedSlot[]);

      // Fetch workshops for selector dropdown
      const { data: wsData, error: wsError } = await supabase
        .from('workshops')
        .select('id, title')
        .order('title', { ascending: true });

      if (!wsError && wsData) setWorkshops(wsData);

    } catch (err: any) {
      console.error('Error fetching data:', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle adding a new block
  const handleAddBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      alert('Please select a valid date.');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalTime = blockType === 'FULL_DAY' 
        ? null 
        : (customTime.trim() || selectedTime);

      const payload = {
        blocked_date: selectedDate,
        blocked_time: finalTime,
        reason: reason.trim() || 'Holiday / Closure',
        workshop_id: selectedWorkshopId === 'all' ? null : selectedWorkshopId,
      };

      const { error } = await supabase.from('blocked_dates').insert([payload]);

      if (error) {
        if (error.code === '23505') {
          alert('This date or time slot is already blocked!');
        } else {
          alert(`Failed to save: ${error.message}`);
        }
      } else {
        // Reset form
        setSelectedDate('');
        setCustomTime('');
        setReason('Holiday / Closure');
        fetchData();
      }
    } catch (err: any) {
      alert(`An error occurred: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting a block
  const handleDeleteBlock = async (id: string) => {
    if (!confirm('Are you sure you want to unblock this slot?')) return;

    try {
      const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
      if (error) throw error;
      setBlockedItems(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 sm:p-6 font-sans">
      
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Block Date & Time Slots</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Prevent bookings on specific dates or exact time slots for holidays or maintenance.
          </p>
        </div>

        <form onSubmit={handleAddBlock} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Target Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Date *
            </label>
            <input
              type="date"
              required
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl font-medium outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Block Scope / Type */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Blocking Scope
            </label>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setBlockType('FULL_DAY')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                  blockType === 'FULL_DAY'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Full Day
              </button>
              <button
                type="button"
                onClick={() => setBlockType('TIME_SLOT')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                  blockType === 'TIME_SLOT'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Time Slot
              </button>
            </div>
          </div>

          {/* Time Slot Selection */}
          {blockType === 'TIME_SLOT' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Time Slot
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-3 rounded-xl font-medium outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                >
                  {DEFAULT_TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Or custom e.g. 06:00 PM"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-3 py-3 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}

          {/* Targeted Workshop */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Apply To Workshop
            </label>
            <select
              value={selectedWorkshopId}
              onChange={(e) => setSelectedWorkshopId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl font-medium outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            >
              <option value="all">All Workshops (Entire Center)</option>
              {workshops.map((ws) => (
                <option key={ws.id} value={ws.id}>{ws.title}</option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div className="md:col-span-2 lg:col-span-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Reason / Label
            </label>
            <input
              type="text"
              placeholder="e.g. Public Holiday, Maintenance..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-800 px-4 py-3 rounded-xl font-medium outline-none focus:ring-2 focus:ring-amber-500 text-sm"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 lg:col-span-3 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Block...' : '+ Add Block Rule'}
            </button>
          </div>
        </form>
      </div>


      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-900">Active Blocked Schedule</h3>
          <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
            {blockedItems.length} Blocked Rules
          </span>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-slate-400 font-medium">Loading blocked entries...</div>
        ) : blockedItems.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium bg-slate-50 rounded-xl border border-dashed border-slate-200">
            No blocked dates or time slots configured yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="px-6 py-3.5 rounded-l-xl">Blocked Date</th>
                  <th className="px-6 py-3.5">Time Slot</th>
                  <th className="px-6 py-3.5">Scope</th>
                  <th className="px-6 py-3.5">Reason</th>
                  <th className="px-6 py-3.5 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blockedItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {new Date(item.blocked_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      {item.blocked_time ? (
                        <span className="bg-amber-100 text-amber-900 px-2.5 py-1 rounded-md text-xs">
                          ⏰ {item.blocked_time}
                        </span>
                      ) : (
                        <span className="bg-rose-100 text-rose-800 px-2.5 py-1 rounded-md text-xs font-bold">
                          🚫 FULL DAY
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {item.workshops?.title || 'All Workshops'}
                    </td>
                    <td className="px-6 py-4 font-normal text-slate-600">
                      {item.reason || 'No reason stated'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDeleteBlock(item.id)}
                        className="text-rose-600 hover:text-rose-800 font-bold text-xs bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Remove Block
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}