
"use client";

import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QrCode, Palette, Globe, FileText, ImageIcon, Video, Wifi, BookOpen, Briefcase, Contact, Laptop, LogOut, LayoutDashboard, Trash2, Plus, Save } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { FormFieldData, FormStructureData } from '@/lib/schemas';
import { getFormStructure, saveFormStructure } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';


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
  const { toast } = useToast();


  const [wifiData, setWifiData] = useState<WifiData>({ ssid: '', encryption: 'WPA', password: '' });
  const [vcardData, setVcardData] = useState<VCardData>({
    firstName: '', lastName: '', phone: '', email: '',
    company: '', jobTitle: '', website: '', street: '', city: '', state: '', zip: '', country: ''
  });
  
  // State for dynamic form builder
  const [formStructure, setFormStructure] = useState<FormStructureData | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Set the base URL for the laptop request form
  const [laptopRequestUrl, setLaptopRequestUrl] = useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/laptop-request`;
      setLaptopRequestUrl(url);
      if (qrType === 'laptop') {
        setQrValue(url);
      }
    }
  }, [qrType]);
  
  useEffect(() => {
    async function fetchStructure() {
        if (qrType === 'laptop') {
            const structure = await getFormStructure();
            setFormStructure(structure);
        }
    }
    fetchStructure();
  }, [qrType]);


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

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  // Dynamic form functions
  const handleFieldChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formStructure) return;
    const newFields = [...formStructure.fields];
    newFields[index] = { ...newFields[index], [e.target.name]: e.target.value };
    setFormStructure({ ...formStructure, fields: newFields });
  };
    
  const handleRequiredChange = (index: number, checked: boolean) => {
    if (!formStructure) return;
    const newFields = [...formStructure.fields];
    newFields[index].required = checked;
    setFormStructure({ ...formStructure, fields: newFields });
  };

  const addField = () => {
    if (!formStructure) return;
    const newField: FormFieldData = { id: `custom_${Date.now()}`, label: '', type: 'text', required: false };
    setFormStructure(prev => prev ? ({ ...prev, fields: [...prev.fields, newField] }) : null);
  };

  const removeField = (index: number) => {
    if (!formStructure) return;
    const newFields = formStructure.fields.filter((_, i) => i !== index);
    setFormStructure({ ...formStructure, fields: newFields });
  };
    
  const handleSaveFormStructure = async () => {
    if (!formStructure) return;
    setIsSaving(true);
    const result = await saveFormStructure(formStructure);
    if (result.success) {
      toast({ title: 'Success', description: 'Form structure saved successfully.' });
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.message });
    }
    setIsSaving(false);
  };

  const generateQRCode = async () => {
    if (qrType === 'website') {
      setQrValue(inputValue);
    } else if (qrType === 'text') {
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
        setQrValue(laptopRequestUrl);
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
      case 'laptop':
        return (
           <div className="w-full space-y-4">
                <div className="space-y-2 text-center">
                    <p className="text-sm text-muted-foreground">
                        This will generate a QR code that directs students to the laptop request form.
                        Customize the fields below.
                    </p>
                    <Input type="text" value={laptopRequestUrl} readOnly className="text-center bg-gray-100" />
                </div>
                <div className="space-y-4 rounded-md border p-4 max-h-60 overflow-y-auto">
                    <h4 className="text-sm font-medium">Form Fields</h4>
                    {formStructure?.fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-2">
                            <Input 
                                name="label"
                                value={field.label} 
                                onChange={(e) => handleFieldChange(index, e)} 
                                placeholder="Field Label"
                            />
                            <div className="flex items-center gap-1.5">
                                <Label htmlFor={`required-${index}`} className="text-xs">Required</Label>
                                <Switch id={`required-${index}`} checked={field.required} onCheckedChange={(checked) => handleRequiredChange(index, checked)} />
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeField(index)}>
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addField} className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Add Field
                    </Button>
                </div>
                <Button onClick={handleSaveFormStructure} disabled={isSaving} className="w-full">
                    <Save className="mr-2 h-4 w-4" /> {isSaving ? 'Saving...' : 'Save Form Structure'}
                </Button>
           </div>
        )
      case 'wifi':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ssid">Network Name (SSID)</Label>
              <Input id="ssid" name="ssid" value={wifiData.ssid} onChange={(e) => handleWifiChange(e, 'ssid')} placeholder="e.g. MyHomeWiFi" />
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
                <Input id="password" name="password" type="password" value={wifiData.password || ''} onChange={(e) => handleWifiChange(e, 'password')} />
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
              return !laptopRequestUrl;
          default:
              return true;
      }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md mx-auto shadow-lg relative">
        <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
                <QrCode className="w-6 h-6" />
                <span>QR Code Generator</span>
            </CardTitle>
            <div className="flex items-center gap-2">
                <Link href="/private/dashboard">
                    <Button variant="outline" size="icon">
                        <LayoutDashboard className="w-5 h-5" />
                    </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={handleLogout}>
                    <LogOut className="w-5 h-5" />
                </Button>
            </div>
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
