"use client";

import { useRequireAuth } from '@/context/AuthContext';

export default function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useRequireAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><p>Loading...</p></div>;
  }
  
  if (!user) {
    return null; // or a loading spinner, etc.
  }

  return <>{children}</>;
}
