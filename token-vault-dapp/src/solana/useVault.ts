"use client";

import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { 
  TOKEN_PROGRAM_ID, 
  getAssociatedTokenAddressSync, 
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID 
} from "@solana/spl-token";
import { getProgram } from "@/solana/program";
import { getVaultPDA } from "@/solana/pda";

export function useVault() {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  const getProviderAndProgram = () => {
    if (!wallet) throw new Error("Wallet not connected!");
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    return { provider, program: getProgram(provider) };
  };

  /**
   * Helper: Finds the token account owned by the Vault PDA on-chain.
   * This bypasses the need for the 'vaultTokenAccount' field in the Vault struct.
   */
  const findVaultTokenAccount = async (vaultPda: PublicKey, mint: PublicKey) => {
    const accounts = await connection.getTokenAccountsByOwner(vaultPda, { mint });
    if (accounts.value.length === 0) return null;
    return accounts.value[0].pubkey;
  };

  const initializeVault = async (mint: PublicKey) => {
    const { program } = getProviderAndProgram();
    const [vaultPda] = getVaultPDA(wallet!.publicKey, mint);
    const vaultTokenKeypair = Keypair.generate();

    try {
      return await program.methods
        .initialize()
        .accounts({
          vault: vaultPda,
          vaultTokenAccount: vaultTokenKeypair.publicKey,
          mint: mint,
          owner: wallet!.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([vaultTokenKeypair])
        .rpc();
    } catch (error) {
      console.error("Initialization Failed:", error);
      throw error;
    }
  };

  const depositTokens = async (mint: PublicKey, amount: number) => {
    const { program } = getProviderAndProgram();
    const [vaultPda] = getVaultPDA(wallet!.publicKey, mint);
    
    // 1. Find Vault's Token Account
    const vaultTokenAccount = await findVaultTokenAccount(vaultPda, mint);
    if (!vaultTokenAccount) throw new Error("Vault not initialized properly.");

    // 2. Derive User's Associated Token Account (ATA)
    const userAta = getAssociatedTokenAddressSync(mint, wallet!.publicKey);

    // 3. Setup Instruction
    const txBuilder = program.methods
      .depositTokens(new BN(amount * 10 ** 9))
      .accounts({
        vault: vaultPda,
        vaultTokenAccount: vaultTokenAccount,
        mint: mint,
        owner: wallet!.publicKey,
        userTokenAccount: userAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      });

    // 4. Fix Error 3012: If User ATA doesn't exist, create it in the same TX
    const ataInfo = await connection.getAccountInfo(userAta);
    if (!ataInfo) {
      txBuilder.preInstructions([
        createAssociatedTokenAccountInstruction(
          wallet!.publicKey,
          userAta,
          wallet!.publicKey,
          mint
        )
      ]);
    }

    return await txBuilder.rpc();
  };

  const withdrawTokens = async (mint: PublicKey, amount: number) => {
    const { program } = getProviderAndProgram();
    const [vaultPda] = getVaultPDA(wallet!.publicKey, mint);
    
    // 1. Find Vault's Token Account
    const vaultTokenAccount = await findVaultTokenAccount(vaultPda, mint);
    if (!vaultTokenAccount) throw new Error("Vault Token Account not found.");

    // 2. Derive User's ATA
    const userAta = getAssociatedTokenAddressSync(mint, wallet!.publicKey);

    // 3. Setup Instruction
    const txBuilder = program.methods
      .withdrawToken(new BN(amount * 10 ** 9))
      .accounts({
        vault: vaultPda,
        vaultTokenAccount: vaultTokenAccount,
        userTokenAccount: userAta,
        mint: mint,
        owner: wallet!.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      });

    // 4. Ensure User ATA exists for withdrawal
    const ataInfo = await connection.getAccountInfo(userAta);
    if (!ataInfo) {
      txBuilder.preInstructions([
        createAssociatedTokenAccountInstruction(
          wallet!.publicKey,
          userAta,
          wallet!.publicKey,
          mint
        )
      ]);
    }

    return await txBuilder.rpc();
  };

  return { initializeVault, depositTokens, withdrawTokens };
}