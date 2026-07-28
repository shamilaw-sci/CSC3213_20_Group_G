import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error: Missing credentials.' }, { status: 500 });
  }

  try {
    const { profileId, cartItems, items, totalAmount, shippingAddress, bookingId } = await request.json();
    
    let payhereOrderId = '';

    // ==========================================
    // FLOW A: WORKSHOP BOOKING
    // ==========================================
    if (bookingId) {
      // Skip all DB inserts because it was saved in /api/bookings
      payhereOrderId = bookingId;
    } 
    
    // ==========================================
    // FLOW B: PHYSICAL SHOP ORDER
    // ==========================================
    else {
      const itemsToProcess = cartItems || items;

      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: profileId,
          total_amount: totalAmount,
          shipping_address: shippingAddress,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;
      
      payhereOrderId = order.id;

      if (itemsToProcess && itemsToProcess.length > 0) {
        // Secure backend DB check for real cost pricing
        const variantIds = itemsToProcess.map((item: any) => item.id);
        const { data: dbVariants } = await supabase
          .from('artifact_variants')
          .select('id, cost_price, price, discounted_price')
          .in('id', variantIds);

        const orderItemsData = [];

        for (const item of itemsToProcess) {
          const foundVariant = dbVariants?.find((v: any) => v.id === item.id);
          orderItemsData.push({
            order_id: order.id,
            variant_id: item.id,
            quantity: item.quantity,
            cost_price_at_sale: foundVariant ? (foundVariant as any).cost_price : 0,
            selling_price_at_sale: foundVariant 
              ? ((foundVariant as any).discounted_price || (foundVariant as any).price) 
              : item.price
          });
        }

        const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
        if (itemsError) throw itemsError;
      }
    }

    // ==========================================
    // PAYHERE HASH GENERATION (Unified for both)
    // ==========================================
    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID!;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
    const currency = 'LKR'; 
    const formattedAmount = Number(totalAmount).toFixed(2);

    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hashSignature = crypto
      .createHash('md5')
      .update(merchantId + payhereOrderId + formattedAmount + currency + hashedSecret)
      .digest('hex')
      .toUpperCase();

    return NextResponse.json({
      merchantId,
      orderId: payhereOrderId, 
      amount: formattedAmount,
      currency,
      hash: hashSignature,
    });

  } catch (error) {
    console.error("API Route Catch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error processing checkout initiation.' }, { status: 500 });
  }
}