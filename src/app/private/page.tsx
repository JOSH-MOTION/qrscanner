
"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Globe, FileText, ImageIcon, Video, Wifi, BookOpen, Briefcase, Contact, Laptop, LogOut, Loader2, Check, FileJson } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import type { UserProfile } from '@/lib/schemas';
import { getUserProfile } from '@/lib/actions';
import { useAuth } from '@/context/AuthContext';
import { JOBEIcon } from '@/components/JOBEIcon';


type QrCodeType = 'website' | 'text' | 'pdf' | 'images' | 'video' | 'wifi' | 'menu' | 'business' | 'vcard' | 'form';

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

type BusinessData = {
  name: string;
  phone: string;
  website: string;
  address: string;
}

const ensureUrlProtocol = (url: string) => {
    if (!url) return '';
    if (!/^https?:\/\//i.test(url)) {
        return `https://${url}`;
    }
    return url;
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
  const [businessData, setBusinessData] = useState<BusinessData>({ name: '', phone: '', website: '', address: ''});
  
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
  
  const generateQRCodeValue = () => {
      let finalValue = '';
      if (qrType === 'website' || qrType === 'pdf' || qrType === 'images' || qrType === 'video' || qrType === 'menu') {
        finalValue = ensureUrlProtocol(inputValue);
      } else if (qrType === 'text') {
        finalValue = inputValue || ' ';
      } else if (qrType === 'wifi') {
        const { ssid, encryption, password } = wifiData;
        if (!ssid) return '';
        finalValue = `WIFI:T:${encryption};S:${ssid};${encryption !== 'nopass' ? `P:${password};` : ''};`;
      } else if (qrType === 'vcard') {
        const { firstName, lastName, phone, email, company, jobTitle, website, street, city, state, zip, country } = vcardData;
        if (!firstName && !lastName) return '';
        finalValue = `BEGIN:VCARD
VERSION:3.0
N:${lastName};${firstName}
FN:${firstName} ${lastName}
ORG:${company}
TITLE:${jobTitle}
TEL;TYPE=WORK,VOICE:${phone}
EMAIL:${email}
URL:${ensureUrlProtocol(website)}
ADR;TYPE=WORK:;;${street};${city};${state};${zip};${country}
END:VCARD`;
      } else if (qrType === 'business') {
        const { name, phone, website, address } = businessData;
        if (!name) return '';
        finalValue = `BEGIN:VCARD
VERSION:3.0
FN:${name}
TEL;TYPE=WORK,VOICE:${phone}
URL:${ensureUrlProtocol(website)}
ADR;TYPE=WORK:;;${address}
END:VCARD`;
      } else if (qrType === 'form') {
          finalValue = laptopRequestUrl;
      }
      return finalValue;
  }

  useEffect(() => {
      const newQrValue = generateQRCodeValue();
      setQrValue(newQrValue);
  }, [inputValue, wifiData, vcardData, businessData, qrType, laptopRequestUrl]);


  const handleGenerateClick = () => {
    setIsDone(false);
    setIsGenerating(async () => {
        const value = generateQRCodeValue();
        setQrValue(value);

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
    setInputValue(''); // Reset main input on type change
    if (value === 'form') {
      router.push('/private/dashboard');
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
       case 'pdf':
        return (
          <div className="space-y-2">
            <Label htmlFor="qr-input">Enter PDF URL</Label>
            <Input
              id="qr-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. example.com/document.pdf"
            />
          </div>
        );
      case 'images':
        return (
          <div className="space-y-2">
            <Label htmlFor="qr-input">Enter Image Gallery URL</Label>
            <Input
              id="qr-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. example.com/gallery"
            />
          </div>
        );
       case 'video':
        return (
          <div className="space-y-2">
            <Label htmlFor="qr-input">Enter Video URL</Label>
            <Input
              id="qr-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. youtube.com/watch?v=..."
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
        );
      case 'menu':
        return (
          <div className="space-y-2">
            <Label htmlFor="qr-input">Enter Menu URL</Label>
            <Input
              id="qr-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="e.g. example.com/menu"
            />
          </div>
        );
       case 'business':
        return (
          <div className="space-y-4 max-h-60 overflow-y-auto p-1">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name</Label>
              <Input id="businessName" value={businessData.name} onChange={(e) => setBusinessData(prev => ({...prev, name: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessPhone">Phone Number</Label>
              <Input id="businessPhone" type="tel" value={businessData.phone} onChange={(e) => setBusinessData(prev => ({...prev, phone: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessWebsite">Website</Label>
              <Input id="businessWebsite" type="url" value={businessData.website} onChange={(e) => setBusinessData(prev => ({...prev, website: e.target.value}))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="businessAddress">Address</Label>
              <Input id="businessAddress" value={businessData.address} onChange={(e) => setBusinessData(prev => ({...prev, address: e.target.value}))} />
            </div>
          </div>
        );
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
       case 'form':
         return (
          <div className="text-center p-4 border rounded-md">
            <p className="text-sm text-muted-foreground mb-4">This will generate a QR code for your custom form.</p>
            <Button onClick={() => router.push('/private/dashboard')}>Go to Dashboard</Button>
          </div>
        );
      default:
        return <p className="text-sm text-muted-foreground text-center py-8">Select a QR code type to see more options.</p>;
    }
  }

  const qrOptions: { value: QrCodeType; label: string; icon: React.ElementType, color: string }[] = [
    { value: 'website', label: 'Website', icon: Globe, color: 'text-blue-500' },
    { value: 'text', label: 'Text', icon: FileText, color: 'text-gray-500' },
    { value: 'form', label: 'Form', icon: FileJson, color: 'text-purple-500' },
    { value: 'pdf', label: 'PDF', icon: FileText, color: 'text-red-500' },
    { value: 'images', label: 'Images', icon: ImageIcon, color: 'text-pink-500' },
    { value: 'video', label: 'Video', icon: Video, color: 'text-rose-500' },
    { value: 'wifi', label: 'WiFi', icon: Wifi, color: 'text-cyan-500' },
    { value: 'menu', label: 'Menu', icon: BookOpen, color: 'text-amber-500' },
    { value: 'business', label: 'Business', icon: Briefcase, color: 'text-orange-500' },
    { value: 'vcard', label: 'vCard', icon: Contact, color: 'text-green-500' },
  ];
  
  const isGenerateDisabled = () => {
      if (isGenerating || isDone) return true;
      if (qrType === 'form') return true;
      if (!qrValue) return true;
      return false;
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
                    <JOBEIcon className="w-6 h-6" />
                    <span>JOBE QR Code</span>
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
                          <Icon className={`w-4 h-4 ${opt.color}`} />
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
          
          {qrValue && qrType !== 'form' && (
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

          { qrType !== 'form' && (
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
          )}
        </CardContent>
        {qrType !== 'form' && (
            <CardFooter className="flex justify-center gap-2">
                <Button onClick={handleGenerateClick} disabled={isGenerateDisabled()}>
                    {getButtonContent()}
                </Button>
                <Button variant="outline" onClick={downloadQRCode} disabled={!qrValue}>
                    Download
                </Button>
            </CardFooter>
        )}
      </Card>
    </div>
  );
}
