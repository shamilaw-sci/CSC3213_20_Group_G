'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  createAnnouncement,
  deleteAnnouncement,
  toggleAnnouncementStatus,
  updateAnnouncement,
} from '@/app/actions/announcementActions';
import AnnouncementModal from './AnnouncementModal';
import type { ActionResult, Announcement, AnnouncementInput } from '@/types/announcement.types';

async function getAccessToken() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? '';
}

const formatDate = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

const formatCreated = (timestamp: string) =>
  new Date(timestamp).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Colombo',
  });

export default function AdminEventsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);

  const fetchAll = useCallback(async () => {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setLoadError(error.message);
    } else {
      setLoadError(null);
      setItems((data ?? []) as Announcement[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (item: Announcement) => {
    setEditing(item);
    setModalOpen(true);
  };

  const closeModal = useCallback(() => setModalOpen(false), []);

  const handleSave = async (data: AnnouncementInput): Promise<ActionResult> => {
    const token = await getAccessToken();
    const result = editing
      ? await updateAnnouncement(editing.id, data, token)
      : await createAnnouncement(data, token);

    if (result.success) {
      await fetchAll();
      setModalOpen(false);
    }
    return result;
  };

  const handleToggle = async (item: Announcement) => {
    setBusyId(item.id);
    setActionError(null);
    const result = await toggleAnnouncementStatus(item.id, item.is_active, await getAccessToken());
    if (result.success) await fetchAll();
    else setActionError(result.error);
    setBusyId(null);
  };

  const handleDelete = async (item: Announcement) => {
    if (!window.confirm(`Delete "${item.title}"? This action cannot be undone.`)) return;

    setBusyId(item.id);
    setActionError(null);
    const result = await deleteAnnouncement(item.id, await getAccessToken());
    if (result.success) await fetchAll();
    else setActionError(result.error);
    setBusyId(null);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/60 p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Events &amp; News</h1>
            <p className="text-sm text-slate-500 mt-1">Manage announcements shown on the public Events page</p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 hover:bg-amber-500 px-5 py-3 text-white font-bold text-sm transition-all shadow-sm"
          >
            + New Announcement
          </button>
        </div>

        {actionError && (
          <div role="alert" className="mb-6 flex items-start justify-between gap-4 rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-semibold text-rose-700">
            <span>{actionError}</span>
            <button type="button" onClick={() => setActionError(null)} className="text-rose-400 hover:text-rose-700 font-black" aria-label="Dismiss">
              ✕
            </button>
          </div>
        )}

        {isLoading ? (
          <div className="py-16 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-amber-600 rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-slate-400">Loading announcements...</p>
          </div>
        ) : loadError ? (
          <div className="py-12 text-center">
            <p className="text-rose-600 font-bold">Error loading announcements: {loadError}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Event Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {items.map((item) => {
                  const busy = busyId === item.id;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{item.title}</p>
                        <p className="text-xs text-slate-400 truncate">{item.description}</p>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest text-white ${
                            item.type === 'event' ? 'bg-amber-500' : 'bg-slate-800'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-600 whitespace-nowrap">
                        {item.event_date ? formatDate(item.event_date) : '—'}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg ${
                            item.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-500 whitespace-nowrap">{formatCreated(item.created_at)}</td>
                      <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          disabled={busy}
                          className="inline-flex items-center text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100/70 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggle(item)}
                          disabled={busy}
                          className="inline-flex items-center text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {busy ? '...' : item.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item)}
                          disabled={busy}
                          className="inline-flex items-center text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No announcements yet. Create your first one above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnnouncementModal open={modalOpen} announcement={editing} onClose={closeModal} onSave={handleSave} />
    </main>
  );
}