/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { Connection } from '@solana/web3.js';

// eslint-disable-next-line import/prefer-default-export
export const getBlockhashWithRetries = async (connection: Connection) => {
    let tries = 0;
    while (tries < 5) {
        try {
            return await connection.getLatestBlockhash();
        } catch (e) {
            console.error(e);
            tries++;
        }
    }
    throw new Error('Too many retries trying to get blockhash!');
};
