
"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QrCode, Palette } from 'lucide-react';

export default function QRCodeGenerator() {
  const [inputValue, setInputValue] = useState<string>('https://firebase.google.com');
  const [qrValue, setQrValue] = useState<string>('https://firebase.google.com');
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const generateQRCode = () => {
    setQrValue(inputValue);
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("qr-code-svg");
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        // The QR Code SVG from the library has a white background by default.
        // To make downloads with custom background colors work, we first draw the background color
        // and then draw the QR code image on top of it.
        if (ctx) {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
        }
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "qrcode.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="w-6 h-6" />
            <span>QR Code Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          {qrValue && (
            <div className="p-4 bg-white rounded-lg border">
              <QRCodeSVG 
                id="qr-code-svg" 
                value={qrValue} 
                size={256} 
                fgColor={fgColor}
                bgColor={bgColor}
                level="L"
                includeMargin={false}
              />
            </div>
          )}

          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label htmlFor="qr-input">Enter text or URL</Label>
              <Input
                id="qr-input"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="e.g. https://example.com"
              />
            </div>
            <div className="flex items-center gap-4">
              <Palette className="w-5 h-5 text-gray-500" />
              <div className="flex items-center gap-2">
                <Label htmlFor="fg-color">Foreground</Label>
                <Input id="fg-color" type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-12 h-8 p-1" />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="bg-color">Background</Label>
                <Input id="bg-color" type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-8 p-1" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-2">
          <Button onClick={generateQRCode}>Generate QR Code</Button>
          <Button variant="outline" onClick={downloadQRCode} disabled={!qrValue}>
            Download
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
