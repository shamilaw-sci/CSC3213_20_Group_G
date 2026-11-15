'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface CameraScannerProps {
  onScanSuccess: (barcodeData: string) => void;
  onScanError?: (errorMessage: string) => void;
}

export default function CameraScanner({ onScanSuccess, onScanError }: CameraScannerProps) {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    // initialize scanner 
    scannerRef.current = new Html5QrcodeScanner(
      "camera-scanner-view",
      {
        fps: 10,
        qrbox: { width: 250, height: 150 }, 
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.UPC_A
        ]
      },
      false
    );

    scannerRef.current.render(
      (decodedText) => {

        onScanSuccess(decodedText);
      },
      (error) => {
        if (onScanError) onScanError(error);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.error("Failed to clear camera scanner: ", err);
        });
      }
    };
  }, [onScanSuccess, onScanError]);

  return (
    <div className="w-full max-w-md mx-auto bg-stone-900 text-white rounded-2xl overflow-hidden shadow-xl border border-stone-800 p-4">
      <div className="text-center mb-3">
        <p className="text-sm font-bold text-amber-500 tracking-wide uppercase">📷 Active Camera View</p>
        <p className="text-xs text-stone-400">Position the product barcode cleanly inside the scanner boundaries</p>
      </div>
      
      {/* live camera video */}
      <div id="camera-scanner-view" className="overflow-hidden rounded-xl bg-black"></div>
      
      {permissionError && (
        <div className="mt-2 text-xs text-red-400 text-center bg-red-950/40 p-2 rounded-lg border border-red-900">
          ⚠️ Camera access denied. Check system hardware settings.
        </div>
      )}
    </div>
  );
}