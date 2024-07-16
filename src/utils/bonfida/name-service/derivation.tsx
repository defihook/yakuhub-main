import { PublicKey } from '@solana/web3.js';
import * as sns from '@bonfida/spl-name-service';
// eslint-disable-next-line import/no-unresolved
import { SOL_TLD_AUTHORITY } from './constants';

// eslint-disable-next-line import/prefer-default-export
export const derive = async (name: string, parent: PublicKey = SOL_TLD_AUTHORITY) => {
    const hashed = await sns.getHashedName(name);
    const pubkey = await sns.getNameAccountKey(hashed, undefined, parent);
    return { pubkey, hashed };
};
