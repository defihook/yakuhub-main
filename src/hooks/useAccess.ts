/* eslint-disable */

import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';

import { getUserPoolState } from 'actions/stake';
import { NFT_CREATOR } from 'config/config';
import { getYakuStakedNfts } from 'views/yaku/staking/fetchData';
import useConnections from './useConnetions';

export const useAccess = () => {
    const { connection } = useConnections();
    const wallet = useWallet();

    const checkCosmicAccess = async (publicKey: PublicKey) => {
        if (publicKey) {
            if (publicKey.toBase58() === '45rzLU1gPiEsaDtmkjvawgKDYYpSTHdVXKJjZ74dBDFg') {
                return true;
            }

            const userPoolData = await getUserPoolState(connection, wallet);
            const numStaked = userPoolData?.itemCount.toNumber();

            const nftsList = await getParsedNftAccountsByOwner({ publicAddress: publicKey.toBase58(), connection });
            for (const item of nftsList) {
                if (item.data.creators === undefined) continue;
                if (numStaked !== 0 && numStaked !== null && numStaked !== undefined) return true;
                if (item.data.creators[0].address === NFT_CREATOR && item.data.creators[0].verified == true) {
                    return true;
                }
            }

            return false;
        }
        return false;
    };

    const checkAccess = async (publicKey: PublicKey, accessKeys: Array<string>) => {
        if (publicKey) {
            if (publicKey.toBase58() === '45rzLU1gPiEsaDtmkjvawgKDYYpSTHdVXKJjZ74dBDFg') {
                return true;
            }
            let totalNumOfStaked = 0;
            // Get Astro user pool
            const userPoolData = await getUserPoolState(connection, wallet);
            totalNumOfStaked += userPoolData?.itemCount?.toNumber() ?? 0;

            // Get Yaku collections user staked count
            const { staked = [] } = await getYakuStakedNfts({ connection, wallet, shouldfetchJson: false });
            totalNumOfStaked += staked.length;
            if (totalNumOfStaked !== 0 && totalNumOfStaked !== null && totalNumOfStaked !== undefined) {
                return true;
            }
            const nftsList = await getParsedNftAccountsByOwner({ publicAddress: publicKey.toBase58(), connection });
            for (const item of nftsList) {
                if (item.data.creators === undefined) continue;
                if (accessKeys.includes(item.data.creators[0].address) && item.data.creators[0].verified == true) {
                    return true;
                }
            }

            return false;
        }
        return false;
    };

    return { checkAccess, checkCosmicAccess };
};

export default useAccess;
