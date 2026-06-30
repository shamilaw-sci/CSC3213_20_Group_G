import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing Supabase credentials.' }, 
      { status: 500 }
    );
  }

  try {
    const { profileId, cartItems, items, totalAmount, shippingAddress } = await request.json();
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

    if (orderError) {
      console.error("SUPABASE ORDER INSERT ERROR:", orderError);
      return NextResponse.json(
        { error: `Database Error: ${orderError.message || 'No data returned'}` }, 
        { status: 500 }
      );
    }

    if (itemsToProcess && itemsToProcess.length > 0) {
      const orderItemsData = itemsToProcess.map((item: any) => ({
        order_id: order.id,
        variant_id: item.id, 
        quantity: item.quantity,
        cost_price_at_sale: item.price,
        selling_price_at_sale: item.discounted_price || item.price
      }));

      const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
      if (itemsError) console.error("SUPABASE ORDER ITEMS INSERT ERROR:", itemsError);
    }

    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID!;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
    const currency = 'LKR'; 
    
    // Explicit format mapping for PayHere MD5 string compliance
    const formattedAmount = Number(totalAmount).toFixed(2);

    const hashedSecret = crypto
      .createHash('md5')
      .update(merchantSecret)
      .digest('hex')
      .toUpperCase();

    const hashSignature = crypto
      .createHash('md5')
      .update(merchantId + order.id + formattedAmount + currency + hashedSecret)
      .digest('hex')
      .toUpperCase();

    return NextResponse.json({
      merchantId,
      orderId: order.id,
      amount: formattedAmount,
      currency,
      hash: hashSignature,
    });

  } catch (error) {
    console.error("API Route Catch Error:", error);
    return NextResponse.json({ error: 'Internal Server Error processing checkout initiation.' }, { status: 500 });
  }
}