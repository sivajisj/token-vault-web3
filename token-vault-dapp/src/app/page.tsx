"use client";
import WalletButton from "@/components/WalletButton";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(()=>setMounted(true), []);
  return (
   <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8">Token Vault</h1>
      {mounted ? (
          <WalletButton />
        ) : (
          <div className="px-6 py-2 bg-gray-800 rounded animate-pulse text-gray-400">
            Loading Wallet...
          </div>
        )}
    </main>
  );
}
