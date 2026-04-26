"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      const items = JSON.parse(stored);
      setCartItems(items);
      const total = items.reduce(
        (sum: number, item: any) => sum + item.price * item.quantity,
        0
      );
      setSubtotal(total);
    }
  }, []);

  const handlePay = async () => {
    const orderId = "ORDER_" + Date.now();

    const res = await fetch("/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: subtotal,
        orderId,
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "0771234567",
      }),
    });

    const data = await res.json();

    // Create a hidden form and submit to PayHere
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://sandbox.payhere.lk/pay/checkout";

    const fields = {
      merchant_id: data.merchantId,
      return_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/checkout",
      notify_url: "http://localhost:3000/api/webhook",
      order_id: data.orderId,
      items: "KCC Artifacts",
      amount: data.amount,
      currency: "LKR",
      hash: data.hash,
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      address: "No.1, Kandy Road",
      city: "Kandy",
      country: "Sri Lanka",
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value as string;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  return (
    <div className="max-w-xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Order Summary</h1>

      {cartItems.length === 0 ? (
        <p>Your cart is empty!</p>
      ) : (
        <>
          {cartItems.map((item: any) => (
            <div key={item.artifact_id} className="flex justify-between mb-3">
              <span>{item.name} × {item.quantity}</span>
              <span>LKR {item.price * item.quantity}</span>
            </div>
          ))}

          <div className="border-t pt-4 mt-4 flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>LKR {subtotal}</span>
          </div>

          <button
            onClick={handlePay}
            className="mt-8 w-full bg-black text-white py-3 rounded-lg text-lg"
          >
            Pay Now
          </button>
        </>
      )}
    </div>
  );
}