import * as anchor from '@project-serum/anchor';
import { RewardTree } from './reward-tree';
import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export interface MerkleDistributorInfo {
    merkleRoot: Buffer;
    mints: {
        [mint: string]: {
            index: number;
            reward: anchor.BN;
            proof: Buffer[];
        };
    };
}

export function parseRewardMap(rewards: { mint: string; reward: string }[]): MerkleDistributorInfo {
    // Not sure why we need to sort by address

    const tree = new RewardTree(
        rewards.map(({ mint, reward }) => ({
            mint: new PublicKey(mint),
            // eslint-disable-next-line new-cap
            reward: new anchor.BN(reward)
        }))
    );

    const mints = rewards.reduce<MerkleDistributorInfo['mints']>((acc, xpMultiplier, index) => {
        const bnMultiplier = new BN(xpMultiplier.reward);
        acc[xpMultiplier.mint] = {
            index,
            reward: bnMultiplier,
            proof: tree.getProof(index, new PublicKey(xpMultiplier.mint), bnMultiplier)
        };
        return acc;
    }, {});

    return {
        merkleRoot: tree.getRoot(),
        mints
    };
}
