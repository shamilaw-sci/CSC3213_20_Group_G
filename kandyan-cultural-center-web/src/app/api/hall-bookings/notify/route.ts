import { NextResponse } from 'next/server';
import { sendHallEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, date, status } = body;

    if (!email || !name || !date || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Call the centralized email utility
    await sendHallEmail(email, name, date, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to send hall booking email:', error);
    return NextResponse.json({ error: 'Internal Server Error sending email' }, { status: 500 });
  }
}