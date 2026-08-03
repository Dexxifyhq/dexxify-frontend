"use client";

import { QRCodeSVG } from "qrcode.react";

interface WalletQRCodeProps {
  address: string;
  size?: number;
  logoUrl?: string;
  logoSize?: number;
}

export default function WalletQRCode({
  address,
  size = 180,
  logoUrl,
  logoSize = 36,
}: WalletQRCodeProps) {
  return (
    <div
      className="flex items-center justify-center rounded-xl bg-white p-3"
      style={{ width: size + 24, height: size + 24 }}
    >
      <QRCodeSVG
        value={address}
        size={size}
        level="H"
        bgColor="#ffffff"
        fgColor="#09090B"
        imageSettings={
          logoUrl
            ? {
                src: logoUrl,
                width: logoSize,
                height: logoSize,
                excavate: true,
              }
            : undefined
        }
      />
    </div>
  );
}
