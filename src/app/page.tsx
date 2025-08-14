
"use client";

import React, { useState, useRef, useEffect } from 'react';
import jsQR from 'jsqr';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { QrCode, Link as LinkIcon } from 'lucide-react';

export default function QRCodeScanner() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    getCameraPermission();
  }, [toast]);

  useEffect(() => {
    let animationFrameId: number;

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && isScanning) {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const video = videoRef.current;
          const context = canvas.getContext('2d');

          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context?.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
          if (imageData) {
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: 'dontInvert',
            });

            if (code) {
              setScanResult(code.data);
              setIsScanning(false);
            }
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    if (hasCameraPermission) {
      animationFrameId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [hasCameraPermission, isScanning]);
  
  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;  
    }
  }

  const handleRescan = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Toaster />
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="w-6 h-6" />
            <span>QR Code Scanner</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full aspect-video rounded-md overflow-hidden bg-gray-200 dark:bg-gray-800 mb-4">
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="hidden" />
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex items-center justify-center">
                 <Alert variant="destructive" className="m-4">
                    <AlertTitle>Camera Access Required</AlertTitle>
                    <AlertDescription>
                      Please allow camera access to use this feature.
                    </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
          
          {scanResult ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Scan Result:</h3>
              <p className="text-gray-700 dark:text-gray-300 break-all mb-4">{scanResult}</p>
              <div className="flex gap-2 justify-center">
                {isValidUrl(scanResult) && (
                  <Button asChild>
                    <a href={scanResult} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="mr-2 h-4 w-4" /> Open Link
                    </a>
                  </Button>
                )}
                <Button variant="outline" onClick={handleRescan}>Scan Again</Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              {isScanning ? 'Scanning for QR code...' : 'Point your camera at a QR code.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
