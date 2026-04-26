import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { amount, orderId, firstName, lastName, email, phone } = await req.json();

  const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID!;
  const appId = process.env.PAYHERE_APP_ID!;
  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;

  const amountFormatted = parseFloat(amount).toFixed(2);

  const hashedSecret = crypto
    .createHash("md5")
    .update(merchantSecret.trim())
    .digest("hex")
    .toUpperCase();

  // Try with App ID in hash
  const hashString = `${appId.trim()}${orderId}${amountFormatted}LKR${hashedSecret}`;

  const hash = crypto
    .createHash("md5")
    .update(hashString)
    .digest("hex")
    .toUpperCase();

  return NextResponse.json({
    merchantId: merchantId.trim(),
    orderId,
    amount: amountFormatted,
    hash,
    firstName,
    lastName,
    email,
    phone,
  });
}