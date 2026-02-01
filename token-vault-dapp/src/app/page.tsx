"use client";

import WalletButton from "@/components/WalletButton";
import { getVaultPDA } from "@/solana/pda";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const owner = new PublicKey(
      "So11111111111111111111111111111111111111112"
    );
    const mint = new PublicKey(
      "FhtU6zX8dW7nYf6u3kz7Tz1f5s8v9wX5Z4Y3X5Z4Y3X5"
    );

    const [pda, bump] = getVaultPDA(owner, mint);
    console.log("Vault PDA:", pda.toBase58(), "Bump:", bump);
  }, []);

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
