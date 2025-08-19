
"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Palette, Globe, FileText, ImageIcon, Video, Wifi, BookOpen, Briefcase, Contact, Type, Laptop } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type QrCodeType = 'website' | 'pdf' | 'images' | 'video' | 'wifi' | 'menu' | 'business' | 'vcard' | 'laptop';

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

type LaptopRequestData = {
    studentName: string;
    generation: string;
    subject: string;
    laptopId: string;
    timeCollected: string;
    condition: 'Good' | 'Fair' | 'Other';
    conditionOther: string;
}

export default function QRCodeGenerator() {
  const [inputValue, setInputValue] = useState<string>('https://firebase.google.com');
  const [qrValue, setQrValue] = useState<string>('https://firebase.google.com');
  const [fgColor, setFgColor] = useState<string>('#000000');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [qrType, setQrType] = useState<QrCodeType>('website');

  const [wifiData, setWifiData] = useState<WifiData>({ ssid: '', encryption: 'WPA', password: '' });
  const [vcardData, setVcardData] = useState<VCardData>({
    firstName: '', lastName: '', phone: '', email: '',
    company: '', jobTitle: '', website: '', street: '', city: '', state: '', zip: '', country: ''
  });
  const [laptopRequestData, setLaptopRequestData] = useState<LaptopRequestData>({
      studentName: '', generation: '', subject: '', laptopId: '', timeCollected: '', condition: 'Good', conditionOther: ''
  });


  const handleWifiChange = (e: React.ChangeEvent<HTMLInputElement> | string, field: keyof WifiData | 'encryption') => {
    if (typeof e === 'string') {
        setWifiData(prev => ({ ...prev, encryption: e as WifiData['encryption'] }));
    } else {
        setWifiData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleVcardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVcardData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLaptopRequestChange = (e: React.ChangeEvent<HTMLInputElement> | string, field?: keyof LaptopRequestData) => {
    if (typeof e === 'string') {
      setLaptopRequestData(prev => ({ ...prev, condition: e as LaptopRequestData['condition']}));
    } else {
      setLaptopRequestData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };


  const generateQRCode = () => {
    if (qrType === 'website') {
      setQrValue(inputValue);
    } else if (qrType === 'wifi') {
      const { ssid, encryption, password } = wifiData;
      setQrValue(`WIFI:T:${encryption};S:${ssid};${encryption !== 'nopass' ? `P:${password};` : ''};`);
    } else if (qrType === 'vcard') {
      const { firstName, lastName, phone, email, company, jobTitle, website, street, city, state, zip, country } = vcardData;
      const vCardString = `BEGIN:VCARD
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
      setQrValue(vCardString);
    } else if (qrType === 'laptop') {
      const { studentName, generation, subject, laptopId, timeCollected, condition, conditionOther } = laptopRequestData;
      const laptopRequestString = `Codetrain Africa - Laptop Request
Date: ${new Date().toLocaleDateString()}
Student Name: ${studentName}
Generation: ${generation}
Subject/Lesson: ${subject}
Laptop ID: ${laptopId}
Time Collected: ${timeCollected}
Condition at Collection: ${condition === 'Other' ? conditionOther : condition}`;
      setQrValue(laptopRequestString);
    }
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
    case 'laptop':
        return (
            <div className="space-y-4 max-h-60 overflow-y-auto p-1">
                 <div className="space-y-2">
                    <Label htmlFor="studentName">Student Name</Label>
                    <Input id="studentName" name="studentName" value={laptopRequestData.studentName} onChange={handleLaptopRequestChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="generation">Generation (Gen)</Label>
                        <Input id="generation" name="generation" value={laptopRequestData.generation} onChange={handleLaptopRequestChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="subject">Subject/Lesson</Label>
                        <Input id="subject" name="subject" value={laptopRequestData.subject} onChange={handleLaptopRequestChange} />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="laptopId">Laptop ID/Number</Label>
                        <Input id="laptopId" name="laptopId" value={laptopRequestData.laptopId} onChange={handleLaptopRequestChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="timeCollected">Time Collected</Label>
                        <Input id="timeCollected" name="timeCollected" type="time" value={laptopRequestData.timeCollected} onChange={handleLaptopRequestChange} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Condition at Collection</Label>
                    <RadioGroup
                        value={laptopRequestData.condition}
                        onValueChange={(value) => handleLaptopRequestChange(value, 'condition')}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Good" id="c-good" />
                            <Label htmlFor="c-good">Good</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Fair" id="c-fair" />
                            <Label htmlFor="c-fair">Fair</Label>
                        </div>
                         <div className="flex items-center space-x-2">
                            <RadioGroupItem value="Other" id="c-other" />
                            <Label htmlFor="c-other">Other</Label>
                        </div>
                    </RadioGroup>
                    {laptopRequestData.condition === 'Other' && (
                        <Input name="conditionOther" value={laptopRequestData.conditionOther} onChange={handleLaptopRequestChange} placeholder="Please specify" className="mt-2" />
                    )}
                </div>
            </div>
        )
      case 'wifi':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ssid">Network Name (SSID)</Label>
              <Input id="ssid" name="ssid" value={wifiData.ssid} onChange={handleWifiChange} placeholder="e.g. MyHomeWiFi" />
            </div>
            <div className="space-y-2">
              <Label>Encryption</Label>
              <Select value={wifiData.encryption} onValueChange={(value) => handleWifiChange(value, 'encryption')}>
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
                <Input id="password" name="password" type="password" value={wifiData.password} onChange={handleWifiChange} />
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
                        <Input id="firstName" name="firstName" value={vcardData.firstName} onChange={handleVcardChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input id="lastName" name="lastName" value={vcardData.lastName} onChange={handleVcardChange} />
                    </div>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" type="tel" value={vcardData.phone} onChange={handleVcardChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={vcardData.email} onChange={handleVcardChange} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="company">Company</Label>
                        <Input id="company" name="company" value={vcardData.company} onChange={handleVcardChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="jobTitle">Job Title</Label>
                        <Input id="jobTitle" name="jobTitle" value={vcardData.jobTitle} onChange={handleVcardChange} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" name="website" value={vcardData.website} onChange={handleVcardChange} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="street">Street</Label>
                    <Input id="street" name="street" value={vcardData.street} onChange={handleVcardChange} />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" value={vcardData.city} onChange={handleVcardChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" name="state" value={vcardData.state} onChange={handleVcardChange} />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" name="zip" value={vcardData.zip} onChange={handleVcardChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" name="country" value={vcardData.country} onChange={handleVcardChange} />
                    </div>
                </div>
            </div>
        )
      default:
        return <p className="text-sm text-muted-foreground text-center">Select a QR code type to see more options.</p>;
    }
  }

  const qrOptions: { value: QrCodeType; label: string; icon: React.ElementType }[] = [
    { value: 'website', label: 'Website', icon: Globe },
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
      switch(qrType) {
          case 'website':
              return !inputValue;
          case 'wifi':
              return !wifiData.ssid;
          case 'vcard':
              return !vcardData.firstName || !vcardData.lastName;
          case 'laptop':
              return !laptopRequestData.studentName || !laptopRequestData.laptopId;
          default:
              return true;
      }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2">
            <QrCode className="w-6 h-6" />
            <span>QR Code Generator</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-6">
          <div className="w-full space-y-4">
            <div className="space-y-2">
              <Label>QR Code Type</Label>
              <Select value={qrType} onValueChange={(value) => setQrType(value as QrCodeType)}>
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
          <Button onClick={generateQRCode} disabled={isGenerateDisabled()}>Generate QR Code</Button>
          <Button variant="outline" onClick={downloadQRCode} disabled={!qrValue}>
            Download
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    