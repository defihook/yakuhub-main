/* eslint-disable react-hooks/exhaustive-deps */
import { queries } from '../graphql/graphql';
import useAuthLazyQuery from 'hooks/useAuthLazyQuery';
import { FC, ReactNode, createContext, useState, useEffect } from 'react';

// types
import { StakedContextType } from 'types/staked';
import { useWallet } from '@solana/wallet-adapter-react';
import { getGlobalData, getTokenDistribution, getUnstakedNfts, getUserPoolData, getYakuStakedNfts } from 'views/yaku/staking/fetchData';
import useConnections from 'hooks/useConnetions';
import { each, find, map, min, sortBy, sumBy } from 'lodash';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { YAKU_NFT } from 'types/staking';
import { mints, getStakingState, loadYakuProgram } from 'actions/yakuStake';
import { useSolPrice } from './CoinGecko';
import useAuth from 'hooks/useAuth';
import { useLazyQuery } from '@apollo/client';

// context & provider
const StakedContext = createContext<StakedContextType | null>(null);

export const StakedProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { connection } = useConnections();
    const wallet = useWallet();
    const auth = useAuth();
    const { publicKey } = wallet;

    const solPrice = useSolPrice();
    const [totalStaked, setTotalStaked] = useState(0);
    const [valueLocked, setValueLocked] = useState(0);
    const [tokenDistributed, setTokenDistributed] = useState(0);
    const [dailyYield, setDailyYield] = useState(0);

    const [nftList, setNftList] = useState<any>();
    const [stakedNfts, setStakedNfts] = useState<any>();
    const [stakedYakuNfts, setStakedYakuNfts] = useState<any>();
    const [metaDataCache, setMetaDataCache] = useState<any>({});
    const [rewardAmount, setRewardAmount] = useState(0);
    const [yakuRewardAmount, setYakuRewardAmount] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [assetsCount, setAssetsCount] = useState<any>({});
    const [yakusFP, setYakusFP] = useState<any>();
    const [isLoading, setIsLoading] = useState(false);

    const [refetchStats] = useLazyQuery(queries.GET_COLLECTION_STATS);
    const [getNFTsByOwner] = useAuthLazyQuery(queries.GET_NFTS_BY_WALLET, {
        skip: !publicKey,
        variables: {
            wallet: publicKey?.toBase58()
        },
        fetchPolicy: 'network-only'
    });
    const [fetchMetadatas] = useAuthLazyQuery(queries.GET_NFTS_BY_MINT, {
        fetchPolicy: 'network-only'
    });

    const getStats = async () => {
        try {
            const program = loadYakuProgram(connection, wallet);
            const { data } = await refetchStats({
                variables: { symbol: 'all' },
                fetchPolicy: 'network-only'
            });
            const statsArr = data?.getStats;
            const oniFP = statsArr[0].floorPrice;
            const capsuleFP = statsArr[1].floorPrice;
            const xFP = statsArr[2].floorPrice;
            const { totalStaked: total = 0, valueLocked: caValueLocked = 0 } = (await getGlobalData(connection, solPrice, xFP)) || {};
            const { count = 0 } = await getStakingState(program);
            const locked = caValueLocked + (min([oniFP, capsuleFP, xFP]) / LAMPORTS_PER_SOL) * count * solPrice;

            setTotalStaked(total + count);
            setValueLocked(locked);
            setYakusFP({
                yakucorp1: oniFP,
                capsulex: capsuleFP,
                yakux: xFP
            });
            return {
                totalStaked: total + count,
                valueLocked: locked,
                yakusFP: {
                    yakucorp1: oniFP,
                    capsulex: capsuleFP,
                    yakux: xFP
                }
            };
        } catch (error) {
            console.error(error);
        }
        return {};
    };

    // Fetch Main Wallet Yaku collections
    const getAllYakuNfts = async () => {
        if (isLoading) {
            return;
        }
        setIsLoading(true);
        try {
            const { staked: stakedCA = [], claimReward = 0 } = await getUserPoolData({ connection, wallet });
            setRewardAmount(claimReward);
            const unstakedNfts = await getUnstakedNfts({ connection, wallet, shouldfetchJson: false });
            setNftList(unstakedNfts);
            const { staked: stakedYaku = [] } = await getYakuStakedNfts({
                connection,
                wallet,
                shouldfetchJson: false,
                cache: metaDataCache
            });
            setStakedYakuNfts(stakedYaku);

            const mintList = [
                ...map(stakedCA, ({ mint }) => ({ mint, staked: true, type: 'ca' })),
                ...map(unstakedNfts, ({ mint }: YAKU_NFT) => ({ mint, staked: false, type: 'yaku' })),
                ...map(stakedYaku, ({ mint }: YAKU_NFT) => ({ mint, staked: true, type: 'yaku' }))
            ];
            let newUnstaked: any[] = [];
            let newStaked: any[] = [];
            const mintsToFetch = map(mintList, ({ mint }: { mint: string }) => mint);
            if (mintsToFetch.length > 0) {
                const { data } = await fetchMetadatas({
                    variables: {
                        mint: mintsToFetch
                    },
                    fetchPolicy: 'network-only'
                });
                if (data && data.fetch && data.fetch.length > 0) {
                    newUnstaked = map(unstakedNfts, (item) => ({
                        ...item,
                        ...(find(data.fetch, ({ mint }: any) => mint === item.mint) || {})
                    }));
                    newStaked = map(stakedYaku, (item) => ({
                        ...item,
                        ...(find(data.fetch, ({ mint }: any) => mint === item.mint) || {})
                    }));
                }
            }

            const newList: any[] = [
                ...(newUnstaked.length > 0 ? newUnstaked : unstakedNfts),
                ...(newStaked.length > 0 ? newStaked : stakedYaku)
            ];
            const fetchedUnstaked: any[] = [];
            const fetchedStaked: any[] = [];
            each(newList, async (item: any) => {
                try {
                    const found: any = find(mintList, ({ mint }: { mint: string }) => [item.mint].includes(mint));
                    const { staked: isStaked } = found || {};
                    const { metadata, mint } = item;
                    const { index, reward, proof } = mints[mint];
                    if (isStaked) {
                        fetchedStaked.push({ ...metadata, ...(metadata.json || {}), ...item, mint, index, reward, proof });
                    } else {
                        fetchedUnstaked.push({ ...metadata, ...(metadata.json || {}), ...item, mint, index, reward, proof });
                    }
                } catch (error) {
                    console.error(error);
                }
            });
            setStakedNfts(sortBy(stakedCA, 'name'));
            setNftList(sortBy(fetchedUnstaked, 'name'));
            setStakedYakuNfts(sortBy(fetchedStaked, 'name'));
            setDailyYield(sumBy(fetchedStaked, ({ reward = 0 }) => +reward / LAMPORTS_PER_SOL));
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStakedList = async (shouldSet = true, otherWallet?: string) => {
        try {
            const { staked = [] } = await getYakuStakedNfts({
                connection,
                wallet,
                shouldfetchJson: false,
                cache: metaDataCache,
                otherWallet
            });
            if (shouldSet) {
                setStakedYakuNfts(staked);
            }
            return staked;
        } catch (error) {
            console.error(error);
        }
        return [];
    };

    const getStakedJSONs = async (staked: any[]) => {
        const { data } = await fetchMetadatas({
            variables: {
                mint: map(staked, ({ mint }: any) => mint)
            },
            fetchPolicy: 'network-only'
        });
        let newStaked: any[] = [];
        if (data && data.fetch && data.fetch.length > 0) {
            newStaked = [...data.fetch];
        }
        const newList: any[] = [];
        each(newStaked, async (item: any) => {
            try {
                const { metadata, mint } = item;
                const { index, reward, proof } = mints[mint];
                newList.push({ ...metadata, ...(metadata.json || {}), ...item, mint, index, reward, proof });
            } catch (error) {
                console.error(error);
            }
        });
        setStakedYakuNfts(sortBy(newList, 'name'));
        setDailyYield(sumBy(newList, ({ reward = 0 }) => +reward / LAMPORTS_PER_SOL));
        return sortBy(newList, 'name');
    };

    const resetList = () => {
        setStakedNfts([]);
        setStakedYakuNfts([]);
        setNftList([]);
    };

    const updateContext = () => {
        resetList();
        getStats();
        getAllYakuNfts();
        getTokenDistribution().then((tokenDist) => setTokenDistributed(tokenDist));
    };

    useEffect(() => {
        if (nftList && stakedYakuNfts && stakedNfts) {
            setTotalCount(nftList.length + stakedYakuNfts.length + stakedNfts.length);
            let yakuXCnt = 0;
            let capsuleCnt = 0;
            let bikeCnt = 0;
            let mansionCnt = 0;
            let setCnt = 0;
            each([...nftList, ...stakedNfts, ...stakedYakuNfts], ({ name = '' }) => {
                if (name.includes('Yaku X')) {
                    yakuXCnt += 1;
                } else if (name.includes('Capsule X')) {
                    const [, num] = name.split(' #');
                    if (+num < 7000) {
                        capsuleCnt += 1;
                    } else {
                        mansionCnt += 1;
                    }
                } else if (name.includes('Yaku Engineering ONI')) {
                    bikeCnt += 1;
                }
            });
            setCnt = min([yakuXCnt, capsuleCnt + mansionCnt * 10, bikeCnt]) || 0;
            setAssetsCount({
                yakuXCnt,
                capsuleCnt,
                bikeCnt,
                mansionCnt,
                setCnt
            });
        }
    }, [stakedYakuNfts]);

    useEffect(() => {
        updateContext();
    }, [auth.token]);

    return (
        <StakedContext.Provider
            value={{
                totalStaked,
                setTotalStaked,
                valueLocked,
                setValueLocked,
                tokenDistributed,
                setTokenDistributed,
                dailyYield,
                setDailyYield,
                nftList,
                setNftList,
                stakedNfts,
                setStakedNfts,
                stakedYakuNfts,
                setStakedYakuNfts,
                metaDataCache,
                setMetaDataCache,
                rewardAmount,
                setRewardAmount,
                yakuRewardAmount,
                setYakuRewardAmount,
                totalCount,
                setTotalCount,
                assetsCount,
                setAssetsCount,
                getNFTsByOwner,
                yakusFP,
                setYakusFP,
                updateContext,
                getStakedJSONs,
                getStats,
                getStakedList
            }}
        >
            {children}
        </StakedContext.Provider>
    );
};

export default StakedContext;
