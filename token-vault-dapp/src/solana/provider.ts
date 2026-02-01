import { AnchorProvider } from "@coral-xyz/anchor";
import { connection } from "./connection";

export function getProvider(wallet: any) {
  if (!wallet) return null;

  return new AnchorProvider(
    connection,
    wallet,
    {
      preflightCommitment: "processed",
      commitment: "confirmed",
    }
  );
}
