import { Connection, PublicKey } from '@solana/web3.js';

export interface MetaContextState {
    isLoading: boolean;
    balance: number;
    usdcBalance: number;
    yakuBalance: number;
    fetchBalance: (publicKey: PublicKey, connect: Connection) => Promise<number>;
    fetchUSDCBalance: (publicKey: PublicKey, connect: Connection) => Promise<number>;
    fetchYakuBalance: (publicKey: PublicKey, connect: Connection, wallet: any) => Promise<number>;
    startLoading: () => void;
    stopLoading: () => void;
    sticky: number;
}
