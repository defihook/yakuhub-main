import { LazyQueryExecFunction, OperationVariables } from '@apollo/client';
import React from 'react';
import { YAKU_NFT } from './staking';

export type StakedContextType = {
    totalStaked: number;
    setTotalStaked: React.Dispatch<React.SetStateAction<number>>;
    valueLocked: number;
    setValueLocked: React.Dispatch<React.SetStateAction<number>>;
    tokenDistributed: number;
    setTokenDistributed: React.Dispatch<React.SetStateAction<number>>;
    dailyYield: number;
    setDailyYield: React.Dispatch<React.SetStateAction<number>>;
    nftList: any;
    setNftList: React.Dispatch<React.SetStateAction<any>>;
    stakedNfts: any;
    setStakedNfts: React.Dispatch<React.SetStateAction<any>>;
    stakedYakuNfts: any;
    setStakedYakuNfts: React.Dispatch<React.SetStateAction<any>>;
    metaDataCache: any;
    setMetaDataCache: React.Dispatch<React.SetStateAction<any>>;
    rewardAmount: number;
    setRewardAmount: React.Dispatch<React.SetStateAction<number>>;
    yakuRewardAmount: number;
    setYakuRewardAmount: React.Dispatch<React.SetStateAction<number>>;
    totalCount: number;
    setTotalCount: React.Dispatch<React.SetStateAction<number>>;
    assetsCount: any;
    setAssetsCount: React.Dispatch<React.SetStateAction<any>>;
    yakusFP: any;
    setYakusFP: React.Dispatch<React.SetStateAction<any>>;
    getNFTsByOwner: LazyQueryExecFunction<any, OperationVariables>;
    updateContext: () => void;
    getStakedJSONs: (staked: YAKU_NFT[]) => Promise<any[]>;
    getStats: () => Promise<any>;
    getStakedList: (shouldSet: boolean, otherWallet?: string) => Promise<any[]>;
};
