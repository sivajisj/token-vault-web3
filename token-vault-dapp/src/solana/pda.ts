import { PublicKey } from "@solana/web3.js";
import { PROGRAM_ID } from "./constants";

export function getVaultPDA(
  owner: PublicKey,
  mint: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("vault"),
      owner.toBuffer(),
      mint.toBuffer(),
    ],
    PROGRAM_ID
  );
}
