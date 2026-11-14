import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { country, city, cartItems } = await request.json();

    if (!country || !cartItems || cartItems.length === 0) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // LOCAL SHIPPING RULE: Flat LKR 500 within Sri Lanka
    if (country.toLowerCase() === 'sri lanka') {
      return NextResponse.json({ shippingFee: 500, carrier: 'Local Courier' });
    }

    // INTERNATIONAL SHIPPING RULE (DHL Express Integration)
    // Calculate total volumetric/physical weight from the cart items
    const totalWeightKg = cartItems.reduce((sum: number, item: any) => {
      // Safely parse item weight string (e.g., "1.2 kg" -> 1.2)
      const numericWeight = parseFloat(item.weight) || 0.5; // default to 0.5kg if missing
      return sum + (numericWeight * item.quantity);
    }, 0);

    const dhlApiUrl = process.env.DHL_API_URL || 'https://express.api.dhl.com/mydhlapi/test/rates';
    const dhlApiKey = process.env.DHL_API_KEY;
    const dhlApiSecret = process.env.DHL_API_SECRET;

    if (dhlApiKey && dhlApiSecret) {
      try {
        // Production Carrier Request
        const response = await fetch(`${dhlApiUrl}?accountNumber=${process.env.DHL_ACCOUNT_NUMBER}&originCountryCode=LK&originCityName=Kandy&destinationCountryCode=${country}&destinationCityName=${city}&weight=${totalWeightKg}&length=30&width=30&height=30&plannedShippingDate=2026-07-01&isCustomsDeclarable=true&unitOfMeasurement=metric`, {
          method: 'GET',
          headers: {
            'Authorization': 'Basic ' + Buffer.from(`${dhlApiKey}:${dhlApiSecret}`).toString('base64'),
            'Content-Type': 'application/json'
          }
        });

        const dhlData = await response.json();
        if (response.ok && dhlData.products?.[0]?.priceData?.price) {
          // Extract the converted rate from DHL response
          const rateInLkr = dhlData.products[0].priceData.price;
          return NextResponse.json({ shippingFee: Math.ceil(rateInLkr), carrier: 'DHL Express' });
        }
      } catch (err) {
        console.error("DHL live API fallback triggered due to connectivity error:", err);
      }
    }

    // If credentials are empty during Sandbox phase, or if DHL API fails, fallback to a simple calculation
    // Base international shipment cost LKR 4,500 + LKR 1,500 per Kilogram
    const calculatedFallback = 4500 + Math.ceil(totalWeightKg) * 1500;
    return NextResponse.json({ 
      shippingFee: calculatedFallback, 
      carrier: 'DHL Express (Estimated Sandbox Rate)' 
    });

  } catch (error) {
    console.error("Shipping calculate route failed:", error);
    return NextResponse.json({ error: 'Failed to compute logistics fees' }, { status: 500 });
  }
}