"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Pastikan path ini sesuai
import QRCode from "react-qr-code";
import { useState, useEffect, useRef } from "react";
import { Check, Copy, Download } from "lucide-react";

interface ShareModalProps {
  username: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ShareModal({ username, open, onOpenChange }: ShareModalProps) {
  const [mounted, setMounted] = useState(false);
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const svgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    // Mengambil base URL saat ini (localhost atau domain production)
    setOrigin(window.location.origin);
  }, []);

  if (!mounted) return null;

  const profileUrl = `${origin}/u/${username}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${username}-qrcode.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm bg-white">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold text-slate-900">
            Bagikan Profil
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          {/* QR Code Container */}
          <div 
            ref={svgRef} 
            className="p-4 bg-white border-2 border-slate-100 rounded-xl shadow-sm"
          >
            <QRCode 
                value={profileUrl} 
                size={200} 
                viewBox={`0 0 256 256`}
                style={{ height: "auto", maxWidth: "100%", width: "100%" }}
            />
          </div>

          <p className="text-sm text-slate-500 text-center font-medium">
            Scan untuk membuka profil
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 w-full">
            <Button 
                variant="outline" 
                onClick={handleCopy} 
                className="flex items-center gap-2 w-full justify-center"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Disalin" : "Copy Link"}
            </Button>
            
            <Button 
                onClick={handleDownload} 
                className="flex items-center gap-2 w-full justify-center bg-slate-900 text-white hover:bg-slate-800"
            >
              <Download size={16} />
              Save SVG
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}