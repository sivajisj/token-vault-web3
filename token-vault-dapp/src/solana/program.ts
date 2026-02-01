import { AnchorProvider, Program } from "@coral-xyz/anchor";
import token_vault from "@/idl/token_vault.json"; 
import { PROGRAM_ID } from "./constants";
import { PublicKey } from "@solana/web3.js";

export const PG_ID = new PublicKey(PROGRAM_ID);

export function getProgram(provider: AnchorProvider) {
    
    return new Program(token_vault as any, provider);
}