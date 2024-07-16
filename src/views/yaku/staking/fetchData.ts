import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';
import * as anchor from '@project-serum/anchor';
import axios from 'axios';
import {
    STAKING_REWARD_MINT,
    TOKEN_ACC_SOLSCAN_API_ENDPOINT,
    YAKU_COLLECTION_CREATORS,
    YAKU_TOKEN_ACCOUNT,
    YAKU_TOKEN_EXCLUDE_WALLET
} from 'config/config';
import { Promise } from 'bluebird';
import { filter, sum, get, map, uniqBy } from 'lodash';
import { calculateAllRewards, getGlobalState, getUserPoolState } from 'actions/stake';
import { loadYakuProgram, getStakedNFTMintList, fetchMetadata } from 'actions/yakuStake';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { YAKU_NFT } from 'types/staking';

interface NFTType {
    mint: string;
    updateAuthority: string;
    data: {
        creators: any[];
        name: string;
        symbol: string;
        uri: string;
        sellerFeeBasisPoints: number;
    };
    key: any;
    primarySaleHappened: boolean;
    isMutable: boolean;
    editionNonce: number;
    masterEdition?: string;
    edition?: string;
}

export const getMagicEdenFloorPrice = async (symbol: string) => {
    const url = `${window.location.host}/floor/${symbol}`;
    const res = await axios.get(url);
    return res.data;
};

export const getUnstakedNfts = async ({
    connection,
    wallet,
    shouldfetchJson = true,
    cache = {}
}: {
    connection: Connection;
    wallet: WalletContextState;
    shouldfetchJson?: boolean;
    cache?: any;
}) => {
    if (wallet.publicKey === null) {
        return [];
    }
    const nftsList = await getParsedNftAccountsByOwner({ publicAddress: wallet.publicKey.toBase58(), connection });

    const list: Array<any> = await Promise.mapSeries(nftsList, async (item: NFTType) => {
        try {
            const creators = get(item, 'data.creators', []);
            if (!!get(creators, '[0].verified') && YAKU_COLLECTION_CREATORS.includes(get(creators, '[0].address'))) {
                const result = await fetchMetadata(item.data.uri, item.mint, undefined, shouldfetchJson);
                return result;
            }
        } catch (error) {
            console.error(error);
        }
        return undefined;
    });
    return filter(list, (itm) => !!itm);
};

export const calculateAllYakuRewards = (staked: Array<YAKU_NFT>) => {
    const allRewards = map(
        staked,
        ({ lastClaim, interval, amount }) => (((Math.floor(Date.now() / 1000) - lastClaim) / interval) * amount) / LAMPORTS_PER_SOL
    );

    return sum(allRewards);
};

export const getYakuStakedNfts = async ({
    connection,
    wallet,
    shouldfetchJson = true,
    cache = {},
    otherWallet
}: {
    connection: Connection;
    wallet: WalletContextState;
    shouldfetchJson?: boolean;
    cache?: any;
    otherWallet?: string;
}) => {
    if (wallet.publicKey === null) {
        return {};
    }
    const program = loadYakuProgram(connection, wallet);
    const staked = await getStakedNFTMintList(connection, program, wallet, shouldfetchJson, cache, otherWallet);

    return {
        staked,
        rewardAmount: calculateAllYakuRewards(staked)
    };
};

export const getTokenBalance = async (
    connection: Connection,
    pubkey: anchor.web3.PublicKey,
    wallet?: WalletContextState,
    verbose: boolean = true
) => {
    const cloneWindow: any = window;
    const provider = new anchor.AnchorProvider(connection, wallet || cloneWindow.solana, anchor.AnchorProvider.defaultOptions());
    const token = await provider.connection.getTokenAccountBalance(pubkey);
    const tokenAmount = token.value.uiAmount;
    if (verbose) {
        console.log(`${pubkey.toBase58()} has ${tokenAmount} Tokens`);
    }
    return tokenAmount;
};

// Get Cosmic Astronauts global data
export const getGlobalData = async (connection: Connection, solPrice: number, fp?: number) => {
    const globalPoolData = await getGlobalState(connection);
    if (globalPoolData === null) return {};
    const totalStaked = globalPoolData.totalAmount?.toNumber() ?? 0;
    let floorPrice = 0;
    try {
        if (!fp) {
            ({ floorPrice = 0 } = await getMagicEdenFloorPrice('cosmic_astronauts'));
        } else {
            floorPrice = fp;
        }
    } catch (error) {
        console.error(error);
    }
    return {
        totalStaked,
        valueLocked: totalStaked * (floorPrice / LAMPORTS_PER_SOL) * solPrice
    };
};

export const getUserPoolData = async (props: { connection: Connection; wallet: WalletContextState }) => {
    const { connection, wallet } = props;
    if (wallet.publicKey === null) return {};

    const userPoolData = await getUserPoolState(connection, wallet);
    if (userPoolData === null) return {};

    const claimReward = await calculateAllRewards(connection, wallet);

    const count = userPoolData.itemCount.toNumber();
    const reward: number = 0;
    if (count === 0) {
        return {
            staked: [],
            count,
            claimReward,
            reward
        };
    }
    const staked = [];
    if (count !== 0) {
        for (let i = 0; i < count; i += 1) {
            staked.push({
                lockTime: userPoolData.items[i].lockTime.toNumber(),
                model: userPoolData.items[i].model.toNumber(),
                mint: userPoolData.items[i].nftAddr.toBase58(),
                rate: userPoolData.items[i].rate.toNumber(),
                rewardTime: userPoolData.items[i].rewardTime.toNumber(),
                stakedTime: userPoolData.items[i].stakeTime.toNumber()
            });
        }
    }
    return {
        staked: uniqBy(
            filter(staked, (itm) => !!itm && itm.mint !== '11111111111111111111111111111111'),
            'mint'
        ),
        count,
        claimReward,
        reward
    };
};

export const getTokenDistribution = async (account = '3PZiqCsv1yZxLjYVbNBgsBLP68q2YPBgheqyNaL3rV2Z') => {
    const deduceList: any = [];
    const yakuMeta: any = await axios.get(`https://public-api.solscan.io/token/meta?tokenAddress=${STAKING_REWARD_MINT}`);
    const totalSupply = yakuMeta.supply || 498094405844183219;
    const decimal = Math.pow(10, yakuMeta.decimals) || LAMPORTS_PER_SOL;
    await Promise.each(YAKU_TOKEN_EXCLUDE_WALLET, async (excludeAddr) => {
        const res = await axios.get(`${TOKEN_ACC_SOLSCAN_API_ENDPOINT}${excludeAddr}`);
        for (let i = 0; i < res.data.length; i += 1) {
            if (res.data[i].tokenAddress === STAKING_REWARD_MINT) {
                deduceList.push(res.data[i].tokenAmount.uiAmount);
            }
        }
    });
    const res = await axios.get(`${TOKEN_ACC_SOLSCAN_API_ENDPOINT}${account}`);
    for (let i = 0; i < res.data.length; i += 1) {
        if (res.data[i].tokenAccount === YAKU_TOKEN_ACCOUNT) {
            return totalSupply / decimal - res.data[i].tokenAmount.uiAmount - sum(deduceList);
        }
    }
    return 0;
};

const fetchData = {
    getUnstakedNfts,
    getGlobalData,
    getUserPoolData,
    getTokenDistribution
};

export default fetchData;
