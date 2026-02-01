"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import WalletButton from "@/components/WalletButton";
import { connection } from "@/solana/connection"; 
import { getVaultPDA } from "@/solana/pda";
import { getUserAta, getTokenBalance } from "@/solana/tokenAccounts";
import { useVault } from "@/solana/useVault";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [vaultExists, setVaultExists] = useState(false);
  const [userBalance, setUserBalance] = useState(0);
  const [vaultBalance, setVaultBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");

  const { initializeVault, depositTokens, withdrawTokens } = useVault();
  const { publicKey } = useWallet();

  const MINT = new PublicKey("5h3RA8KnbWcsguYQsWRUQAk3uPULxFiX1DaDu8MQ6H3W");

  const fetchData = async () => {
    if (!publicKey) return;
    try {
      const [vaultPda] = getVaultPDA(publicKey, MINT);
      const userAta = getUserAta(publicKey, MINT);
      
      const accountInfo = await connection.getAccountInfo(vaultPda);
      if (accountInfo) {
  const accounts = await connection.getTokenAccountsByOwner(vaultPda, { mint: MINT });
  if (accounts.value.length > 0) {
    const vBal = await getTokenBalance(connection, accounts.value[0].pubkey);
    setVaultBalance(vBal);
  }
}
      setVaultExists(!!accountInfo);

      setUserBalance(await getTokenBalance(connection, userAta));
      
      if (accountInfo) {
        // Fetch balance from the actual vault data
        const vBal = await getTokenBalance(connection, vaultPda);
        setVaultBalance(vBal);
      }
    } catch (e) { console.error(e); }
  };

  useEffect(() => { setMounted(true); if (publicKey) fetchData(); }, [mounted, publicKey]);

  const handleAction = async () => {
    if (!amount) return;
    setLoading(true);
    try {
      if (mode === "deposit") await depositTokens(MINT, Number(amount));
      else await withdrawTokens(MINT, Number(amount));
      
      await fetchData();
      setAmount("");
      alert("Success!");
    } catch (e: any) { alert(e.message); }
    finally { setLoading(false); }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-4">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-2xl border border-gray-700 shadow-xl flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8 text-blue-400">Token Vault</h1>
        
        {mounted && (
          <div className="w-full space-y-6">
            <WalletButton />
            {publicKey && (
              <>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-500 uppercase">Wallet</p>
                    <p className="text-xl font-mono text-green-400">{userBalance}</p>
                  </div>
                  <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-500 uppercase">Vault</p>
                    <p className="text-xl font-mono text-purple-400">{vaultBalance}</p>
                  </div>
                </div>

                {!vaultExists ? (
                  <button onClick={() => initializeVault(MINT).then(fetchData)} disabled={loading} className="w-full py-4 bg-purple-600 rounded-xl font-bold">
                    Initialize Vault
                  </button>
                ) : (
                  <div className="space-y-4">
                    <div className="flex bg-gray-900 p-1 rounded-lg">
                      <button onClick={()=>setMode('deposit')} className={`flex-1 py-2 rounded ${mode==='deposit'?'bg-gray-700':'text-gray-500'}`}>Deposit</button>
                      <button onClick={()=>setMode('withdraw')} className={`flex-1 py-2 rounded ${mode==='withdraw'?'bg-gray-700':'text-gray-500'}`}>Withdraw</button>
                    </div>
                    <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="0.0" className="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-center" />
                    <button onClick={handleAction} disabled={loading || !amount} className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition">
                      {loading ? "Processing..." : `${mode.toUpperCase()} TOKENS`}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}