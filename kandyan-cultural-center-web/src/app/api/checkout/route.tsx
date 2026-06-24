import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase securely, with fallbacks to prevent "module evaluation" crashes
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  // Guard clause to catch missing environment variables early
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Server configuration error: Missing Supabase credentials.' }, 
      { status: 500 }
    );
  }

  try {
    // We extract both 'cartItems' and 'items' to ensure compatibility with your frontend fetch payload
    const { profileId, cartItems, items, totalAmount, shippingAddress } = await request.json();
    
    // Determine which array the frontend sent
    const itemsToProcess = cartItems || items;

    // 1. Create a pending order record inside the database
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

    // 2. Insert the specific cart items into the order_items table
    if (itemsToProcess && itemsToProcess.length > 0) {
      // Map the frontend cart data to match your database schema exactly
      const orderItemsData = itemsToProcess.map((item: any) => ({
        order_id: order.id,
        variant_id: item.id, // Ensure this maps to your actual variant ID
        quantity: item.quantity,
        cost_price_at_sale: item.price,
        selling_price_at_sale: item.discounted_price || item.price
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItemsData);

      if (itemsError) {
        console.error("SUPABASE ORDER ITEMS INSERT ERROR:", itemsError);
        // Note: We log this error but do not stop the payment generation. 
        // In a strict production environment, you might consider rolling back the order here if this fails.
      }
    }

    // 3. Extract configuration variables for PayHere
    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID!;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
    const currency = 'LKR';
    
    // PayHere expects amounts to be explicitly formatted to exactly two decimal points
    const formattedAmount = Number(totalAmount).toFixed(2);

    // 4. Generate the required PayHere Security MD5 Hash
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

    // 5. Return parameters required to construct the frontend payment submission
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