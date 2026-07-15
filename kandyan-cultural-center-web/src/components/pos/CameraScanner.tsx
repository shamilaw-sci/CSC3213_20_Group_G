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
    // 1. Initialize scanner targeting standard retail barcode formats
    scannerRef.current = new Html5QrcodeScanner(
      "camera-scanner-view",
      {
        fps: 10, // Frames per second (keeps the device from overheating)
        qrbox: { width: 250, height: 150 }, // Box framing for the barcode
        formatsToSupport: [
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.UPC_A
        ]
      },
      false // verbose mode off
    );

    // 2. Start rendering the camera UI
    scannerRef.current.render(
      (decodedText) => {
        // Successful scan!
        onScanSuccess(decodedText);
      },
      (error) => {
        // Pass down error callback (mostly triggers on blurry frames while aiming)
        if (onScanError) onScanError(error);
      }
    );

    // 3. Clean up the camera stream when the component unmounts
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
      
      {/* The library injects the live camera video feedback element directly here */}
      <div id="camera-scanner-view" className="overflow-hidden rounded-xl bg-black"></div>
      
      {permissionError && (
        <div className="mt-2 text-xs text-red-400 text-center bg-red-950/40 p-2 rounded-lg border border-red-900">
          ⚠️ Camera access denied. Check system hardware settings.
        </div>
      )}
    </div>
  );
}