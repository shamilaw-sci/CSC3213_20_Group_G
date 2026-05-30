'use client';

import { usePOS } from '../../context/POSContext';

export default function POSPage() {
  // Pulling in the cartTotal to prove our Context is working!
  const { cartTotal } = usePOS();

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f3f4f6' }}>
      
      {/* Left Side: Product Grid Area */}
      <div style={{ flex: 2, padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          Physical Store POS
        </h1>
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
          <p>Product grid will go here...</p>
        </div>
      </div>

      {/* Right Side: Cart Sidebar Area */}
      <div style={{ flex: 1, backgroundColor: 'white', borderLeft: '1px solid #e5e7eb', padding: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
          Current Cart
        </h2>
        <p>Items will appear here...</p>
        
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>
            Total: ${cartTotal.toFixed(2)}
          </h3>
          <button style={{ 
            width: '100%', 
            padding: '15px', 
            backgroundColor: '#2563eb', 
            color: 'white', 
            fontWeight: 'bold',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            CHARGE
          </button>
        </div>
      </div>

    </div>
  );
}