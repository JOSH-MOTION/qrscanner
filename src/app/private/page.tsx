
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Palette, Globe, FileText, ImageIcon, Video, Wifi, BookOpen, Briefcase, Contact, Laptop, LogOut, Loader2, Check } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { UserProfile } from '@/lib/schemas';
import { getUserProfile } from '@/lib/actions';
import { useAuth } from '@/context/AuthContext';


type QrCodeType = 'website' | 'text' | 'pdf' | 'images' | 'video' | 'wifi' | 'menu' | 'business' | 'vcard' | 'laptop';

type WifiData = {
  ssid: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  password?: string;
};

type VCardData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company: string;
  jobTitle: string;
  website: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};


export default function QRCodeGenerator() {
  const [inputValue, setInputValue] = useState<string>('https://firebase.google.com');
  const [qrValue, setQrValue] = useState<string>('https://firebase.google.com');
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [qrType, setQrType] = useState<QrCodeType>('website');
  const router = useRouter();
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [isGenerating, setIsGenerating] = useTransition();
  const [isDone, setIsDone] = useState(false);


  const [wifiData, setWifiData] = useState<WifiData>({ ssid: '', encryption: 'WPA', password: '' });
  const [vcardData, setVcardData] = useState<VCardData>({
    firstName: '', lastName: '', phone: '', email: '',
    company: '', jobTitle: '', website: '', street: '', city: '', state: '', zip: '', country: ''
  });
  
  const [laptopRequestUrl, setLaptopRequestUrl] = useState('');
  
  useEffect(() => {
    if (user) {
        const fetchUserProfile = async () => {
            const profile = await getUserProfile(user.uid);
            setUserProfile(profile);
        };
        fetchUserProfile();
    }
    if (typeof window !== 'undefined' && user) {
      const url = `${window.location.origin}/laptop-request?adminId=${user.uid}`;
      setLaptopRequestUrl(url);
    }
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const generateQRCode = () => {
    setIsDone(false);
    setIsGenerating(async () => {
        let finalValue = '';
        if (qrType === 'website') {
          finalValue = inputValue;
        } else if (qrType === 'text') {
          finalValue = inputValue;
        } else if (qrType === 'wifi') {
          const { ssid, encryption, password } = wifiData;
          finalValue = `WIFI:T:${encryption};S:${ssid};${encryption !== 'nopass' ? `P:${password};` : ''};`;
        } else if (qrType === 'vcard') {
          const { firstName, lastName, phone, email, company, jobTitle, website, street, city, state, zip, country } = vcardData;
          finalValue = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName}
FN:${firstName} ${lastName}
ORG:${company}
TITLE:${jobTitle}
TEL;TYPE=WORK,VOICE:${phone}
EMAIL:${email}
URL:${website}
ADR;TYPE=WORK:;;${street};${city};${state};${zip};${country}
END:VCARD`;
        } else if (qrType === 'laptop') {
            finalValue = laptopRequestUrl;
        }
        setQrValue(finalValue);

        // Simulate processing and show done state
        await new Promise(resolve => setTimeout(resolve, 400));
        setIsDone(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsDone(false);
    });
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

  const handleSelectChange = (value: QrCodeType) => {
    setQrType(value);
    if (value === 'laptop') {
        generateQRCode();
    }
  }

  const renderInputs = () => {
    switch(qrType) {
      case 'website':
        return (
          <div className="space-y-2">
            <Label htmlFor="qr-input">Enter website URL</Label>
            <Input
              id="qr-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. https://example.com"
            />
          </div>
        );
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor="qr-input">Enter Text</Label>
            <Input
              id="qr-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Enter any text or link"
            />
          </div>
        );
      case 'wifi':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ssid">Network Name (SSID)</Label>
              <Input id="ssid" name="ssid" value={wifiData.ssid} onChange={(e) => setWifiData(prev => ({...prev, ssid: e.target.value}))} placeholder="e.g. MyHomeWiFi" />
            </div>
            <div className="space-y-2">
              <Label>Encryption</Label>
              <Select value={wifiData.encryption} onValueChange={(value: WifiData['encryption']) => setWifiData(prev => ({...prev, encryption: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {wifiData.encryption !== 'nopass' && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" value={wifiData.password || ''} onChange={(e) => setWifiData(prev => ({ ...prev, password: e.target.value }))} />
              </div>
            )}
          </div>
        )
      case 'vcard':
        return (
            <div className="space-y-4 max-h-60 overflow-y-auto p-1">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input id="firstName" name="firstName" value={vcardData.firstName} onChange={(e) => setVcardData(prev => ({...prev, firstName: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="lastName" value={vcardData.lastName} onChange={(e) => setVcardData(prev => ({...prev, lastName: e.target.value}))} />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" type="tel" value={vcardData.phone} onChange={(e) => setVcardData(prev => ({...prev, phone: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={vcardData.email} onChange={(e) => setVcardData(prev => ({...prev, email: e.target.value}))} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" name="company" value={vcardData.company} onChange={(e) => setVcardData(prev => ({...prev, company: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input id="jobTitle" name="jobTitle" value={vcardData.jobTitle} onChange={(e) => setVcardData(prev => ({...prev, jobTitle: e.target.value}))} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" value={vcardData.website} onChange={(e) => setVcardData(prev => ({...prev, website: e.target.value}))} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input id="street" name="street" value={vcardData.street} onChange={(e) => setVcardData(prev => ({...prev, street: e.target.value}))} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" value={vcardData.city} onChange={(e) => setVcardData(prev => ({...prev, city: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" name="state" value={vcardData.state} onChange={(e) => setVcardData(prev => ({...prev, state: e.target.value}))} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" name="zip" value={vcardData.zip} onChange={(e) => setVcardData(prev => ({...prev, zip: e.target.value}))} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" name="country" value={vcardData.country} onChange={(e) => setVcardData(prev => ({...prev, country: e.target.value}))} />
                    </div>
                </div>
            </div>
        )
       case 'laptop':
        return (
            <div className="text-center p-4">
                <p className="text-sm text-muted-foreground mb-2">This QR code points to the laptop request form.</p>
                <Link href="/private/dashboard" className="text-sm text-blue-500 hover:underline">
                    Go to Laptop Dashboard
                </Link>
            </div>
        )
      default:
        return <p className="text-sm text-muted-foreground text-center py-8">Select a QR code type to see more options.</p>;
    }
  }

  const qrOptions: { value: QrCodeType; label: string; icon: React.ElementType }[] = [
    { value: 'website', label: 'Website', icon: Globe },
    { value: 'text', label: 'Text', icon: FileText },
    { value: 'laptop', label: 'Laptop Request', icon: Laptop },
    { value: 'pdf', label: 'PDF', icon: FileText },
    { value: 'images', label: 'Images', icon: ImageIcon },
    { value: 'video', label: 'Video', icon: Video },
    { value: 'wifi', label: 'WiFi', icon: Wifi },
    { value: 'menu', label: 'Menu', icon: BookOpen },
    { value: 'business', label: 'Business', icon: Briefcase },
    { value: 'vcard', label: 'vCard', icon: Contact },
  ];
  
  const isGenerateDisabled = () => {
      if (isGenerating || isDone) return true;
      switch(qrType) {
          case 'website':
              return !inputValue;
          case 'text':
              return !inputValue;
          case 'wifi':
              return !wifiData.ssid;
          case 'vcard':
              return !vcardData.firstName || !vcardData.lastName;
          case 'laptop':
              return true; // Disable generate button for laptop type as it's automatic
          default:
              return true;
      }
  }
  
  const getButtonContent = () => {
    if (isGenerating) {
        return <> <Loader2 className="animate-spin" /> Generating... </>;
    }
    if (isDone) {
        return <> <Check /> Done </>;
    }
    return 'Generate QR Code';
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg relative">
        <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex flex-col">
                <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-6 h-6" />
                    <span>QR Code Generator</span>
                </CardTitle>
                 {userProfile && <p className="text-sm text-muted-foreground mt-1">Welcome, {userProfile.username}!</p>}
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-6">
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label>QR Code Type</Label>
              <Select value={qrType} onValueChange={(value) => handleSelectChange(value as QrCodeType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an Option" />
                </SelectTrigger>
                <SelectContent>
                  {qrOptions.map(opt => {
                    const Icon = opt.icon;
                    return (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          <span>{opt.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>

            {renderInputs()}
          </div>
          
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
          <Button onClick={generateQRCode} disabled={isGenerateDisabled()}>
            {getButtonContent()}
            </Button>
          <Button variant="outline" onClick={downloadQRCode} disabled={!qrValue}>
            Download
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    