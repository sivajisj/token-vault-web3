"use client";
import "@solana/wallet-adapter-react-ui/styles.css";
import { ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { ReactNode, useMemo } from "react";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";

export default function AppProviders({ children }: { children: ReactNode }){
    const wallets = useMemo(() => [
        new PhantomWalletAdapter(), new SolflareWalletAdapter()
    ], []);
    const endpoint = clusterApiUrl("devnet");
    return (
        <>
        <ConnectionProvider endpoint={endpoint}   >
            <WalletProvider  wallets={wallets}>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>

        </>
    )
}