import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { bookingId, totalAmount } = await request.json();

    if (!bookingId || !totalAmount) {
      return NextResponse.json({ error: 'Booking ID and Total Amount are required.' }, { status: 400 });
    }

    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID!;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
    const currency = 'LKR';
    const formattedAmount = Number(totalAmount).toFixed(2);

    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    const hashSignature = crypto
      .createHash('md5')
      .update(merchantId + bookingId + formattedAmount + currency + hashedSecret)
      .digest('hex')
      .toUpperCase();

    return NextResponse.json({
      merchantId,
      orderId: bookingId,
      amount: formattedAmount,
      currency,
      hash: hashSignature,
    });
  } catch (error) {
    console.error('Workshop Checkout Hash Error:', error);
    return NextResponse.json({ error: 'Internal Server Error generating payment hash.' }, { status: 500 });
  }
}