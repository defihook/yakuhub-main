/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import useConnections from 'hooks/useConnetions';

export const TPS_POOL_INTERVAL = 1000 * 60; // 60 sec

export interface TPSContextState {
    tps: number;
}

const TPSContext = React.createContext<TPSContextState | null>(null);

export function TPSProvider({ children = null }: { children: any }) {
    const { publicKey, connected } = useWallet();
    const { connection } = useConnections();

    const [tps, setTps] = useState(0);
    const getTps = async () => {
        try {
            const [stat] = await connection.getRecentPerformanceSamples(1);
            const { numTransactions = 0, samplePeriodSecs = 60 } = stat;
            return numTransactions / samplePeriodSecs;
        } catch (err) {
            console.error(err);
        }
        return 0;
    };
    useEffect(() => {
        let timerId = 0;
        const queryPrice = async () => {
            const val = await getTps();
            setTps(val);

            if (publicKey && connected) {
                startTimer();
            }
        };

        const startTimer = () => {
            timerId = window.setTimeout(async () => {
                queryPrice();
            }, TPS_POOL_INTERVAL);
        };

        queryPrice();
        return () => {
            clearTimeout(timerId);
        };
    }, [setTps]);

    // prettier-ignore
    return (
        <TPSContext.Provider value={{ tps }}>
            {children}
        </TPSContext.Provider>
    );
}

export const useTPS = () => {
    const context = useContext(TPSContext);
    return context as TPSContextState;
};

export const useTPSValue = () => {
    const { tps } = useTPS();
    return tps;
};
