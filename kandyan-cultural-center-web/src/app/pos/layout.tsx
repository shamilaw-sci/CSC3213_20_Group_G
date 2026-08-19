'use client';

import { POSProvider } from '../../context/POSContext';

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <POSProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </POSProvider>
  );
}