import { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';

export default function Scanner({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    scannerRef.current = new Html5QrcodeScanner(
      'reader',
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scannerRef.current.render(
      (decodedText) => {
        // Expected format: https://.../artist/UID
        if (decodedText.includes('/artist/')) {
          const parts = decodedText.split('/artist/');
          const artistId = parts[parts.length - 1];
          scannerRef.current?.clear();
          onClose();
          navigate(`/artist/${artistId}`);
        }
      },
      (error) => {
        // silent error for scanning
      }
    );

    return () => {
      scannerRef.current?.clear();
    };
  }, [navigate, onClose]);

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-950 flex flex-col items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full bg-zinc-800 text-white"
      >
        <X className="w-6 h-6" />
      </button>
      
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Scan Artist QR Code</h2>
          <p className="text-zinc-400">Point your camera at the artist's code</p>
        </div>
        
        <div id="reader" className="overflow-hidden rounded-3xl border-2 border-indigo-500/50 shadow-2xl shadow-indigo-500/20 bg-zinc-900"></div>
        
        <p className="text-zinc-500 text-sm italic">
          Make sure the code is well-lit and centered
        </p>
      </div>
    </div>
  );
}
