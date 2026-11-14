'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import type { ActionResult, AnnouncementInput, AnnouncementType } from '@/types/announcement.types';

/**
 * AUTH MODEL
 * The app keeps the Supabase session in the browser (no auth cookies), so a
 * server action can't see who is calling. Every action therefore takes the
 * caller's access token and builds a per-request client that sends it as the
 * Authorization header. Postgres then evaluates RLS (is_admin()) for that user.
 *
 * Do NOT swap this for supabaseServer (service role): that key bypasses RLS,
 * and server actions are public POST endpoints, so anyone could write.
 */
function getAuthedClient(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) throw new Error('Missing Supabase environment variables');

  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const NOT_ALLOWED = 'You do not have permission to manage announcements, or this item no longer exists.';
const GENERIC_ERROR = 'Something went wrong. Please try again.';

type CleanResult =
  | { error: string }
  | { payload: { title: string; description: string; type: AnnouncementType; event_date: string | null } };

function clean(data: AnnouncementInput): CleanResult {
  const title = data.title?.trim() ?? '';
  const description = data.description?.trim() ?? '';
  const eventDate = data.event_date?.trim() || null;

  if (!title) return { error: 'Title is required.' };
  if (title.length > 150) return { error: 'Title must be 150 characters or fewer.' };
  if (!description) return { error: 'Description is required.' };
  if (description.length > 2000) return { error: 'Description must be 2000 characters or fewer.' };
  if (data.type !== 'news' && data.type !== 'event') return { error: 'Type must be news or event.' };
  if (eventDate && (!DATE_RE.test(eventDate) || Number.isNaN(Date.parse(eventDate)))) {
    return { error: 'Event date is invalid.' };
  }
  if (data.type === 'event' && !eventDate) return { error: 'Events need a date.' };

  return { payload: { title, description, type: data.type, event_date: eventDate } };
}

function revalidateAnnouncementPages() {
  revalidatePath('/events');
  revalidatePath('/admin/events');
}

function fail(error: { code?: string; message: string }): ActionResult {
  // 42501 = insufficient_privilege (RLS denied the INSERT)
  return { success: false, error: error.code === '42501' ? NOT_ALLOWED : error.message };
}

export async function createAnnouncement(
  data: AnnouncementInput,
  accessToken: string
): Promise<ActionResult> {
  try {
    if (!accessToken) return { success: false, error: 'You must be signed in.' };

    const result = clean(data);
    if ('error' in result) return { success: false, error: result.error };

    const supabase = getAuthedClient(accessToken);
    const { error } = await supabase
      .from('announcements')
      .insert({ ...result.payload, is_active: data.is_active ?? true });

    if (error) return fail(error);

    revalidateAnnouncementPages();
    return { success: true };
  } catch (err) {
    console.error('createAnnouncement failed:', err);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function updateAnnouncement(
  id: string,
  data: AnnouncementInput,
  accessToken: string
): Promise<ActionResult> {
  try {
    if (!accessToken) return { success: false, error: 'You must be signed in.' };

    const result = clean(data);
    if ('error' in result) return { success: false, error: result.error };

    const supabase = getAuthedClient(accessToken);
    // .select('id') matters: RLS-denied updates return no error, just zero rows.
    const { data: rows, error } = await supabase
      .from('announcements')
      .update(result.payload)
      .eq('id', id)
      .select('id');

    if (error) return fail(error);
    if (!rows || rows.length === 0) return { success: false, error: NOT_ALLOWED };

    revalidateAnnouncementPages();
    return { success: true };
  } catch (err) {
    console.error('updateAnnouncement failed:', err);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function deleteAnnouncement(
  id: string,
  accessToken: string
): Promise<ActionResult> {
  try {
    if (!accessToken) return { success: false, error: 'You must be signed in.' };

    const supabase = getAuthedClient(accessToken);
    const { data: rows, error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', id)
      .select('id');

    if (error) return fail(error);
    if (!rows || rows.length === 0) return { success: false, error: NOT_ALLOWED };

    revalidateAnnouncementPages();
    return { success: true };
  } catch (err) {
    console.error('deleteAnnouncement failed:', err);
    return { success: false, error: GENERIC_ERROR };
  }
}

export async function toggleAnnouncementStatus(
  id: string,
  currentStatus: boolean,
  accessToken: string
): Promise<ActionResult> {
  try {
    if (!accessToken) return { success: false, error: 'You must be signed in.' };

    const supabase = getAuthedClient(accessToken);
    const { data: rows, error } = await supabase
      .from('announcements')
      .update({ is_active: !currentStatus })
      .eq('id', id)
      .select('id');

    if (error) return fail(error);
    if (!rows || rows.length === 0) return { success: false, error: NOT_ALLOWED };

    revalidateAnnouncementPages();
    return { success: true };
  } catch (err) {
    console.error('toggleAnnouncementStatus failed:', err);
    return { success: false, error: GENERIC_ERROR };
  }
}