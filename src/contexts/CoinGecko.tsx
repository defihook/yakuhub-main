/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

export const COINGECKO_POOL_INTERVAL = 1000 * 60; // 60 sec
export const COINGECKO_API = 'https://proxy.yaku.ai/api/cg';
export const COINGECKO_COIN_PRICE_API = `${COINGECKO_API}/price`;

export interface CoinGeckoContextState {
    solPrice: number;
    ethPrice: number;
}

export const solToUsd = async (): Promise<number> => {
    const { data } = await axios.post(COINGECKO_COIN_PRICE_API, {
        params: {
            ids: 'solana',
            vs_currencies: 'usd'
        }
    });
    return data.solana.usd;
};

export const ethToUsd = async (): Promise<number> => {
    const { data } = await axios.post(COINGECKO_COIN_PRICE_API, {
        params: {
            ids: 'ethereum',
            vs_currencies: 'usd'
        }
    });
    return data.ethereum.usd;
};

const CoinGeckoContext = React.createContext<CoinGeckoContextState | null>(null);

export function CoinGeckoProvider({ children = null }: { children: any }) {
    const { publicKey, connected } = useWallet();

    const [solPrice, setSolPrice] = useState<number>(0);
    const [ethPrice, setEthPrice] = useState<number>(0);

    useEffect(() => {
        let timerId = 0;
        const queryPrice = async () => {
            const solprice = await solToUsd();
            setSolPrice(solprice);
            const ethprice = await ethToUsd();
            setEthPrice(ethprice);

            if (publicKey && connected) {
                startTimer();
            }
        };

        const startTimer = () => {
            timerId = window.setTimeout(async () => {
                queryPrice();
            }, COINGECKO_POOL_INTERVAL);
        };

        queryPrice();
        return () => {
            clearTimeout(timerId);
        };
    }, [setSolPrice, setEthPrice]);

    // prettier-ignore
    return (
        <CoinGeckoContext.Provider value={{ solPrice, ethPrice }}>
            {children}
        </CoinGeckoContext.Provider>
    );
}

export const useCoinGecko = () => {
    const context = useContext(CoinGeckoContext);
    return context as CoinGeckoContextState;
};

export const useSolPrice = () => {
    const { solPrice } = useCoinGecko();
    return solPrice;
};

export const useEthPrice = () => {
    const { ethPrice } = useCoinGecko();
    return ethPrice;
};
