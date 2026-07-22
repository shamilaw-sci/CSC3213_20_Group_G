'use client';

import { POSProvider } from '../../context/POSContext';

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <POSProvider>
      {/* This div ensures the POS takes up the full screen 
        You can add Tailwind classes here later if your project uses Tailwind 
      */}
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </POSProvider>
  );
}