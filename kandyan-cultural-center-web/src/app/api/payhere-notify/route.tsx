import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }
  
  try {
    const formData = await request.formData();
    
    const merchantId = formData.get('merchant_id') as string;
    const orderId = formData.get('order_id') as string;
    const paymentId = formData.get('payment_id') as string;
    const payhereAmount = formData.get('payhere_amount') as string;
    const payhereCurrency = formData.get('payhere_currency') as string;
    const statusCode = formData.get('status_code') as string;
    const md5sig = formData.get('md5sig') as string;
    
    // 🚨 THE MAGIC ROUTER: Distinguish bookings from shop orders
    const custom1 = formData.get('custom_1') as string;
    const isWorkshopBooking = custom1 && custom1.startsWith('booking:');
    const bookingId = isWorkshopBooking ? custom1.split(':')[1] : null;

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const expectedLocalSignature = crypto
      .createHash('md5')
      .update(merchantId + orderId + payhereAmount + payhereCurrency + statusCode + hashedSecret)
      .digest('hex').toUpperCase();

    if (md5sig !== expectedLocalSignature) {
      return NextResponse.json({ error: 'Signature mismatch.' }, { status: 400 });
    }

    if (statusCode === '2') { 
      // ==========================================
      // FLOW A: WORKSHOP BOOKING
      // ==========================================
      if (isWorkshopBooking && bookingId) {
        
        await supabase.from('workshop_bookings').update({ status: 'confirmed' }).eq('id', bookingId);
        
        await supabase.from('transactions').insert({
          booking_id: bookingId,
          gateway_reference: paymentId,
          status: 'success',
          amount_paid: parseFloat(payhereAmount)
        });
        
        const { data: booking } = await supabase.from('workshop_bookings').select('*').eq('id', bookingId).single();

        if (booking) {
          await transporter.sendMail({
            from: `"Kandyan Cultural Centre" <${process.env.NEXT_PUBLIC_SITE_EMAIL}>`,
            to: booking.customer_email,
            subject: `🎟️ Booking Confirmed: ${booking.workshop_title}`,
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #d97706;">Your Experience is Booked!</h2>
                <p>Dear ${booking.customer_name},</p>
                <p>We are thrilled to confirm your reservation for <strong>${booking.workshop_title}</strong>.</p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p><strong>Date:</strong> ${booking.booked_date}</p>
                  <p><strong>Time:</strong> ${booking.booked_time}</p>
                  <p><strong>Guests:</strong> ${booking.guests}</p>
                  <p><strong>Booking Ref:</strong> ${booking.id}</p>
                </div>
                <p>Please arrive 10 minutes early. We look forward to hosting you!</p>
              </div>
            `,
          }).catch(console.error); // Catch email errors without failing the webhook response
        }

      // ==========================================
      // FLOW B: PHYSICAL SHOP ORDER
      // ==========================================
      } else {
        
        await supabase.from('orders').update({ status: 'completed' }).eq('id', orderId);
        
        await supabase.from('transactions').insert({
          order_id: orderId,
          gateway_reference: paymentId,
          status: 'success',
          amount_paid: parseFloat(payhereAmount)
        });
        
        // Deduct Stock Safely
        const { data: orderItems } = await supabase.from('order_items').select('variant_id, quantity').eq('order_id', orderId);
        if (orderItems) {
          for (const item of orderItems) {
            const { data: variant } = await supabase.from('artifact_variants').select('stock').eq('id', item.variant_id).single();
            if (variant) {
              await supabase.from('artifact_variants').update({ stock: Math.max(0, variant.stock - item.quantity) }).eq('id', item.variant_id);
            }
          }
        }

        // Fetch Customer & Send Shop Email
        const { data: orderData } = await supabase.from('orders').select('*, profiles!orders_user_id_fkey(email, full_name)').eq('id', orderId).single();
        
        if (orderData && orderData.profiles?.email) {
          await transporter.sendMail({
            from: `"Kandyan Cultural Centre" <${process.env.NEXT_PUBLIC_SITE_EMAIL}>`,
            to: orderData.profiles.email,
            subject: '📦 Order Confirmed - Kandyan Cultural Centre',
            html: `
              <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #d97706;">Payment Successful!</h2>
                <p>Thank you for your order. We have successfully received your payment.</p>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p>We are preparing your authentic artifacts for shipment to:</p>
                <p style="background: #f8f9fa; padding: 15px; border-radius: 8px;">${orderData.shipping_address}</p>
              </div>
            `,
          }).catch(console.error);
        }
      }

    } else {
      // Segregated Payment Failed Logic
      if (isWorkshopBooking && bookingId) {
        await supabase.from('workshop_bookings').update({ status: 'failed' }).eq('id', bookingId);
        await supabase.from('transactions').insert({ booking_id: bookingId, gateway_reference: paymentId, status: `failed_code_${statusCode}`, amount_paid: parseFloat(payhereAmount) });
      } else {
        await supabase.from('orders').update({ status: 'failed' }).eq('id', orderId);
        await supabase.from('transactions').insert({ order_id: orderId, gateway_reference: paymentId, status: `failed_code_${statusCode}`, amount_paid: parseFloat(payhereAmount) });
      }
    }

    return new Response('OK', { status: 200 });

  } catch (error) {
    console.error('Webhook Error Context:', error);
    return NextResponse.json({ error: 'Internal server failure monitoring webhooks.' }, { status: 500 });
  }
}