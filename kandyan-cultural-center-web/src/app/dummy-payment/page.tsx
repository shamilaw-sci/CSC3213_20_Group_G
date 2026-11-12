'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function DummyPaymentTerminal() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);

  // Extract payment details passed from your checkout page
  const orderId = searchParams.get('order_id');
  const amount = searchParams.get('amount');
  const custom1 = searchParams.get('custom_1') || '';

  const handlePayment = async (status: 'success' | 'failed') => {
    setIsProcessing(true);

    if (status === 'success') {
      // 1. Fire the webhook locally to trigger database updates
      const formData = new FormData();
      formData.append('merchant_id', 'DUMMY_MERCHANT');
      formData.append('order_id', orderId || '');
      formData.append('payment_id', 'DUMMY_PAY_' + Math.floor(Math.random() * 1000000));
      formData.append('payhere_amount', amount || '0');
      formData.append('payhere_currency', 'LKR');
      formData.append('status_code', '2'); // PayHere success code
      formData.append('md5sig', 'EVAL_MODE_BYPASS'); 
      if (custom1) formData.append('custom_1', custom1);

      try {
        await fetch('/api/payhere-notify', {
          method: 'POST',
          body: formData,
        });
      } catch (err) {
        console.error("Local webhook simulation failed", err);
      }

      // 2. Redirect to your success page
      const isWorkshop = custom1?.startsWith('booking:');
      const bookingId = isWorkshop ? custom1.split(':')[1] : '';
      router.push(`/success?order=${orderId}${isWorkshop ? `&booking=${bookingId}` : ''}`);
    } else {
      router.push('/payment-cancelled');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full border border-slate-200">
        <div className="flex items-center justify-center gap-3 mb-8 pb-6 border-b border-slate-100">
          <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
            KCC
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">MockPay Sandbox</h1>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl mb-8 border border-slate-200 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Amount to Pay</p>
          <p className="text-4xl font-black text-slate-900">LKR {amount}</p>
          <p className="text-xs text-slate-500 mt-2 font-mono">Ref: {orderId}</p>
        </div>

        <div className="space-y-3">
          <button onClick={() => handlePayment('success')} disabled={isProcessing}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl transition-all shadow-lg shadow-emerald-600/20"
          >
            {isProcessing ? 'Processing...' : 'Simulate Approved Payment'}
          </button>
          
          <button onClick={() => handlePayment('failed')} disabled={isProcessing}
            className="w-full py-4 bg-white border-2 border-rose-100 text-rose-600 hover:bg-rose-50 font-bold rounded-xl transition-all"
          >
            Simulate Declined Payment
          </button>
        </div>
        
        <p className="text-center text-xs font-bold text-slate-400 mt-8">
          Evaluation Mode Active • Local Webhooks Bypassed
        </p>
      </div>
    </div>
  );
}

export default function DummyGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DummyPaymentTerminal />
    </Suspense>
  );
}