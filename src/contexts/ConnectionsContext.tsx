import { web3 } from '@project-serum/anchor';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';
import { selectFastestRpc } from 'actions/shared';
import { DEFAULT_RPC, USE_QUIKNODE } from 'config/config';
import { FC, ReactNode, createContext, useState } from 'react';

// types
import { ConnectionsContextType } from 'types/connections';

// context & provider
const ConnectionsContext = createContext<ConnectionsContextType | null>(null);

export const ConnectionsProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const network = WalletAdapterNetwork.Mainnet;
    const [connection, setConnection] = useState<web3.Connection>(
        new web3.Connection(USE_QUIKNODE ? DEFAULT_RPC : clusterApiUrl(network), {
            confirmTransactionInitialTimeout: 30 * 1000, // 10 Seconds
            commitment: 'confirmed'
        })
    );

    const selectFastest = async () => {
        const selectedNode = await selectFastestRpc();
        const conn = new web3.Connection(selectedNode.uri, {
            confirmTransactionInitialTimeout: 30 * 1000, // 10 Seconds
            commitment: 'confirmed'
        });
        setConnection(conn);
        return conn;
    };

    return <ConnectionsContext.Provider value={{ connection, selectFastest }}>{children}</ConnectionsContext.Provider>;
};

export default ConnectionsContext;
