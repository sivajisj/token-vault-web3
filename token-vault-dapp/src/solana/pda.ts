// src/solana/pda.ts
import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

export const getVaultPDA = (owner: PublicKey, mint: PublicKey) => {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("vault"), 
      owner.toBuffer(), 
      mint.toBuffer()
    ],
    PROGRAM_ID
  );
};