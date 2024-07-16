/* eslint-disable react-hooks/exhaustive-deps */
import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';

export interface MECollectionsContextState {
    MECollections: any[];
    fetchCollections: () => Promise<any[]>;
}

const MECollectionsContext = React.createContext<MECollectionsContextState | null>(null);

export function MECollectionsProvider({ children = null }: { children: any }) {
    const [MECollections, setMECollections] = useState<any[]>([]);

    const fetchCollections = async () => {
        const requestInit = {
            timeout: 60 * 60 * 1000,
            compress: true
        };
        const {
            data: { collections = [] }
        } = await axios.get('https://nft.yaku.ai/api/magiceden/all_collections', requestInit);

        setMECollections(collections);
        return collections;
    };

    useEffect(() => {
        fetchCollections();
    }, []);

    // prettier-ignore
    return (
        <MECollectionsContext.Provider value={{ MECollections, fetchCollections }}>
            {children}
        </MECollectionsContext.Provider>
    );
}

export const useMECollections = () => {
    const context = useContext(MECollectionsContext);
    return context as MECollectionsContextState;
};
