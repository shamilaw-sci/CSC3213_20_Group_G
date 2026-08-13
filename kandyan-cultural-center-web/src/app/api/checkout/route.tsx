import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    // 🚨 Extract the new fields: customerPhone & shippingCost
    const { profileId, cartItems, items, shippingAddress, customerPhone, shippingCost } = await request.json();
    
    let payhereOrderId = '';
    let authoritativeTotalAmount = 0;
    const itemsToProcess = cartItems || items;

    if (!itemsToProcess || itemsToProcess.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // 1. Authoritative Server-Side Pricing & Stock Check
    const variantIds = itemsToProcess.map((item: any) => item.id);
    const { data: dbVariants } = await supabase
      .from('artifact_variants')
      .select('id, stock, cost_price, price, discounted_price')
      .in('id', variantIds);

    let calculatedSubtotal = 0;

    for (const item of itemsToProcess) {
      const foundVariant = dbVariants?.find((v: any) => v.id === item.id);
      
      // Stock Guard
      if (!foundVariant || (foundVariant as any).stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient inventory for an item. Only ${(foundVariant as any)?.stock || 0} remaining.` },
          { status: 409 }
        );
      }

      // Price Calculation
      const actualPrice = (foundVariant as any).discounted_price || (foundVariant as any).price;
      calculatedSubtotal += actualPrice * item.quantity;
    }

    // 🚨 Add Server-Side Shipping & Gateway Fee Calculation
    const secureShippingCost = Number(shippingCost) || 0;
    const gatewayFee = Math.ceil((calculatedSubtotal + secureShippingCost) * 0.033);
    authoritativeTotalAmount = calculatedSubtotal + secureShippingCost + gatewayFee;

    // 🚨 GENERATE SECURE INVOICE NUMBER (Format: INV-123456-ABCD)
    const timestampPart = Date.now().toString().slice(-6); // Last 6 digits of timestamp
    const randomPart = crypto.randomBytes(2).toString('hex').toUpperCase(); // 4 random hex chars
    const invoiceNumber = `ONL-${timestampPart}-${randomPart}`;

    // 2. Create the Order securely
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: profileId,
        total_amount: authoritativeTotalAmount,
        shipping_address: shippingAddress,
        customer_phone: customerPhone || null,
        shipping_cost: secureShippingCost,
        invoice_number: invoiceNumber,
        status: 'pending'
      })
      .select().single();

    if (orderError) throw orderError;
    payhereOrderId = order.id;

    // Insert line items
    const orderItemsData = itemsToProcess.map((item: any) => {
      const foundVariant = dbVariants?.find((v: any) => v.id === item.id);
      return {
        order_id: order.id,
        variant_id: item.id,
        quantity: item.quantity,
        cost_price_at_sale: foundVariant ? (foundVariant as any).cost_price : 0,
        selling_price_at_sale: foundVariant ? ((foundVariant as any).discounted_price || (foundVariant as any).price) : 0
      };
    });

    const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData);
    if (itemsError) throw itemsError;

    // 3. Generate PayHere Hash
    const merchantId = process.env.NEXT_PUBLIC_PAYHERE_MERCHANT_ID!;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET!;
    const currency = 'LKR'; 
    const formattedAmount = authoritativeTotalAmount.toFixed(2);

    const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
    const hashSignature = crypto
      .createHash('md5')
      .update(merchantId + payhereOrderId + formattedAmount + currency + hashedSecret)
      .digest('hex').toUpperCase();

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