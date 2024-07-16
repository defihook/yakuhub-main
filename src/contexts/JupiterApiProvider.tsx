import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Configuration, DefaultApi } from '@jup-ag/api';
import { TokenInfo, TokenListProvider } from '@solana/spl-token-registry';
import { CHAIN_ID } from 'config/config';
import { useToasts } from 'hooks/useToasts';

type RouteMap = Map<string, string[]>;

interface JupiterApiContextType {
    api: DefaultApi;
    loaded: boolean;
    tokenMap: Map<string, TokenInfo>;
    routeMap: RouteMap;
}

// eslint-disable-next-line @typescript-eslint/no-redeclare
const JupiterApiContext = React.createContext<JupiterApiContextType | null>(null);

export const JupiterApiProvider: React.FC<{}> = ({ children }) => {
    const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
    const [routeMap, setRouteMap] = useState<RouteMap>(new Map());
    const [loaded, setLoaded] = useState(false);
    const { showErrorToast } = useToasts();
    const api = useMemo(() => {
        const config = new Configuration({ basePath: 'https://quote-api.jup.ag' });
        return new DefaultApi(config);
    }, []);
    useEffect(() => {
        (async () => {
            try {
                const [tokens, indexedRouteMapResult] = await Promise.all([new TokenListProvider().resolve(), api.v3IndexedRouteMapGet()]);
                const tokenList = tokens.filterByChainId(CHAIN_ID).getList();

                const { indexedRouteMap = {}, mintKeys = [] } = indexedRouteMapResult;

                const newRouteMap = Object.keys(indexedRouteMap).reduce((rMap, key) => {
                    rMap.set(
                        mintKeys[Number(key)],
                        indexedRouteMap[key].map((index) => mintKeys[index])
                    );
                    return rMap;
                }, new Map<string, string[]>());

                setTokenMap(
                    tokenList.reduce((map, item) => {
                        map.set(item.address, item);
                        return map;
                    }, new Map())
                );
                setRouteMap(newRouteMap);
            } catch (error) {
                showErrorToast('There are some errors getting the list of tokens, please try again later.');
                console.error(error);
            } finally {
                setLoaded(true);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <JupiterApiContext.Provider value={{ api, routeMap, tokenMap, loaded }}>{children}</JupiterApiContext.Provider>;
};

export const useJupiterApiContext = () => {
    const context = useContext(JupiterApiContext);

    if (!context) {
        throw new Error('useJupiterApiContext must be used within a JupiterApiProvider');
    }

    return context;
};
