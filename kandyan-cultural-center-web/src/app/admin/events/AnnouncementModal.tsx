'use client';

import { useEffect, useState } from 'react';
import type {
  ActionResult,
  Announcement,
  AnnouncementInput,
  AnnouncementType,
} from '@/types/announcement.types';

interface Props {
  open: boolean;
  announcement: Announcement | null; // null = creating
  onClose: () => void;
  onSave: (data: AnnouncementInput) => Promise<ActionResult>;
}

const labelClass = 'block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2';
const inputClass =
  'w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-amber-500 focus:outline-none';

export default function AnnouncementModal({ open, announcement, onClose, onSave }: Props) {
  const isEditing = announcement !== null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AnnouncementType>('event');
  const [eventDate, setEventDate] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the form each time the modal opens
  useEffect(() => {
    if (!open) return;
    setTitle(announcement?.title ?? '');
    setDescription(announcement?.description ?? '');
    setType(announcement?.type ?? 'event');
    setEventDate(announcement?.event_date ?? '');
    setIsActive(announcement?.is_active ?? true);
    setError(null);
    setSaving(false);
  }, [open, announcement]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !saving) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, saving, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) return setError('Title is required.');
    if (!description.trim()) return setError('Description is required.');
    if (type === 'event' && !eventDate) return setError('Events need a date.');

    setSaving(true);
    const result = await onSave({
      title,
      description,
      type,
      event_date: eventDate || null,
      is_active: isActive,
    });
    setSaving(false);

    if (!result.success) setError(result.error);
    // On success the parent closes the modal.
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-modal-title"
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6 md:p-8"
      >
        <div className="mb-6 pb-5 border-b border-slate-100 flex items-start justify-between gap-4">
          <div>
            <h2 id="announcement-modal-title" className="text-2xl font-black text-slate-900">
              {isEditing ? 'Edit Announcement' : 'New Announcement'}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {isEditing ? 'Changes appear on the public page right away.' : 'Publish news or an upcoming event.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="text-slate-400 hover:text-rose-600 p-2 bg-slate-50 rounded-full transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div role="alert" className="rounded-xl bg-rose-50 border border-rose-100 px-4 py-3 text-sm font-semibold text-rose-700">
              {error}
            </div>
          )}

          <div>
            <span className={labelClass}>Type</span>
            <div className="grid grid-cols-2 gap-2">
              {(['event', 'news'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  aria-pressed={type === t}
                  className={`px-4 py-3 rounded-xl text-sm font-bold border transition-all ${
                    type === t
                      ? 'bg-amber-500 text-white border-amber-400 shadow-[0_4px_10px_rgba(217,119,6,0.3)]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-600'
                  }`}
                >
                  {t === 'event' ? 'Event' : 'News'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="ann-title" className={labelClass}>
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="ann-title"
              type="text"
              required
              maxLength={150}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Esala Perahera Dance Showcase"
              className={`${inputClass} font-semibold`}
            />
          </div>

          <div>
            <label htmlFor="ann-date" className={labelClass}>
              Date {type === 'event' ? <span className="text-rose-500">*</span> : <span className="normal-case font-medium text-slate-400">(optional)</span>}
            </label>
            <input
              id="ann-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="ann-description" className={labelClass}>
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="ann-description"
              rows={5}
              required
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is happening, where, and anything visitors should know."
              className={`${inputClass} leading-relaxed`}
            />
          </div>

          {!isEditing && (
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-amber-600"
              />
              <span className="text-sm font-semibold text-slate-700">Show on the public page immediately</span>
            </label>
          )}

          <div className="pt-5 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-sm text-slate-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-sm text-white transition-all shadow-sm disabled:opacity-50"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}