import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

/**
 * Step 5: Derive the ATA address (Offline)
 */
export function getUserAta(userPubkey: PublicKey, mintPubkey: PublicKey): PublicKey {
    return getAssociatedTokenAddressSync(mintPubkey, userPubkey);
}

/**
 * Step 6: Fetch human-readable balance
 */
export async function getTokenBalance(connection: Connection, tokenAccountPubKey: PublicKey): Promise<number> {
    try {
        const balance = await connection.getTokenAccountBalance(tokenAccountPubKey);
        // value.uiAmount is the number (e.g., 1.5), uiAmountString is the string ("1.5")
        return balance.value.uiAmount ?? 0;
    } catch (e) {
        // If account doesn't exist, balance is 0
        return 0;
    }
}