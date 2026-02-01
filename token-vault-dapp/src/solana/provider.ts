import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { useMemo } from "react";


export function useProvider(){
    const {connection} = useConnection();
    const wallet = useAnchorWallet();

    const provider = useMemo(()=>{
        if(!wallet) return null;
        return {
            connection,
            wallet,
            opts: {
                preflightCommitment: "processed" as const,
                commitment: "confirmed",
            },
        };
    },[connection, wallet]);
}