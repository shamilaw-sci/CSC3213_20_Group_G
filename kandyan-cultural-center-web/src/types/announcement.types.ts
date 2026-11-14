export type AnnouncementType = 'news' | 'event';

export interface Announcement {
  id: string;
  title: string;
  description: string;
  event_date: string | null; // 'YYYY-MM-DD'
  type: AnnouncementType;
  is_active: boolean;
  created_at: string;
}

export interface AnnouncementInput {
  title: string;
  description: string;
  type: AnnouncementType;
  event_date?: string | null;
  is_active?: boolean; // only used on create
}

export type ActionResult = { success: true } | { success: false; error: string };