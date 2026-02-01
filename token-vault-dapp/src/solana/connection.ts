import { Connection } from "@solana/web3.js";
import { NETWORK } from "./constants";

export function useConnection() {
    const connection = new Connection(
        NETWORK, 'confirmed'
    );
}
