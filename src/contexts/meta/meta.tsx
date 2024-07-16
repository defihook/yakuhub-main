import React, { useContext, useLayoutEffect, useState } from 'react';

// web3 imports
import { useWallet, WalletContextState } from '@solana/wallet-adapter-react';

// project imports
import { MetaContextState } from 'contexts/meta/types';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import useConnections from 'hooks/useConnetions';
import { getATokenAddrFungible } from 'actions/shared';
import { STAKING_REWARD_MINT, USDCMINT } from 'config/config';
import { AnchorProvider } from '@project-serum/anchor';

const MetaContext = React.createContext<MetaContextState>({
    isLoading: false,
    balance: 0,
    usdcBalance: 0,
    yakuBalance: 0,
    fetchBalance: async (p: PublicKey, c: Connection) => 0,
    fetchUSDCBalance: async (p: PublicKey, c: Connection) => 0,
    fetchYakuBalance: async (p: PublicKey, c: Connection, w: any) => 0,
    startLoading: () => {},
    stopLoading: () => {},
    sticky: 0
});

export function MetaProvider({ children = null }: { children: any }) {
    const connection = useConnections();
    const wallet = useWallet();

    // Loading Meta
    const [isLoading, setIsLoading] = useState(false);
    const startLoading = () => {
        if (connection && wallet) {
            setIsLoading(true);
        }
    };

    const stopLoading = () => {
        if (connection && wallet) {
            setIsLoading(false);
        }
    };

    // Balance Meta
    const [balance, setBalance] = useState(0);
    const [usdcBalance, setUsdcBalance] = useState(0);
    const [sticky, setSticky] = useState(-1);
    // eslint-disable-next-line consistent-return
    const fetchBalance = async (publicKey: PublicKey, connect: Connection) => {
        try {
            const amount = await connect.getBalance(publicKey, 'confirmed');
            setBalance(amount / LAMPORTS_PER_SOL);
            return amount / LAMPORTS_PER_SOL;
        } catch (e) {
            console.log(`Error fetching solana balance: ${e}`);
        }
        return 0;
    };

    const fetchUSDCBalance = async (publicKey: PublicKey, connect: Connection) => {
        try {
            const tokenAccount = await connect.getParsedTokenAccountsByOwner(publicKey, {
                mint: new PublicKey(USDCMINT)
            });
            const usdcBal = tokenAccount.value[0].account.data.parsed.info.tokenAmount.uiAmount;
            setUsdcBalance(usdcBal);
            return usdcBal;
        } catch (e) {
            console.log(`Error fetching solana balance: ${e}`);
        }
        return 0;
    };

    const getTokenBalance = async (connect: Connection, pubkey: PublicKey, myWallet?: WalletContextState, verbose: boolean = true) => {
        const cloneWindow: any = window;
        const provider = new AnchorProvider(connect, myWallet || cloneWindow.solana, AnchorProvider.defaultOptions());
        const token = await provider.connection.getTokenAccountBalance(pubkey);
        const tokenAmount = token.value.uiAmount;
        if (verbose) {
            console.log(`${pubkey.toBase58()} has ${tokenAmount} Tokens`);
        }
        return tokenAmount;
    };

    const [yakuBalance, setYakuBalance] = useState(0);
    const fetchYakuBalance = async (publicKey: PublicKey, connect: Connection, mainWallet: any) => {
        if (publicKey) {
            const tokenAccountAddress = await getATokenAddrFungible(connect, publicKey, new PublicKey(STAKING_REWARD_MINT!));
            if (tokenAccountAddress) {
                const value = (await getTokenBalance(connect, tokenAccountAddress, mainWallet, false)) || 0;
                setYakuBalance(value);
                return value;
            }
        }
        return 0;
    };

    useLayoutEffect(() => {
        const onScroll = () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            setSticky(winScroll);
        };
        window.addEventListener('scroll', onScroll);
        return () => window.removeEventListener('scroll', onScroll);
    }, []);
    return (
        <MetaContext.Provider
            value={{
                startLoading,
                stopLoading,
                fetchBalance,
                fetchUSDCBalance,
                fetchYakuBalance,
                isLoading,
                balance,
                usdcBalance,
                yakuBalance,
                sticky
            }}
        >
            {children}
        </MetaContext.Provider>
    );
}

export const useMeta = () => {
    const context = useContext(MetaContext);
    return context;
};
