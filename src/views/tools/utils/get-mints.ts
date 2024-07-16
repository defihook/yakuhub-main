/* eslint-disable array-callback-return */
/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable consistent-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-async-promise-executor */
import { from } from 'rxjs';
import { mergeMap, toArray, map } from 'rxjs/operators';
import { Connection, ParsedInstruction } from '@solana/web3.js';
import { sliceIntoChunks } from './slice-into-chunks';
import { toPublicKey } from './to-publickey';

let count = 0;
// eslint-disable-next-line import/prefer-default-export
export async function getMints(candy_id: string, connection: Connection, setCounter: (arg0: number) => void) {
    return new Promise(async (resolve) => {
        const all_signatures = [];
        const options = { before: undefined, limit: 1000 };
        let retries = 0;
        while (true) {
            const signatures = await connection.getSignaturesForAddress(toPublicKey(candy_id), options);
            if (signatures.length === 0) {
                // GBT errors can cause empty returns, we try a few times
                if (retries < 10) {
                    retries++;
                } else {
                    break;
                }
            } else {
                // @ts-ignore
                options.before = signatures[signatures.length - 1].signature;
                all_signatures.push(...signatures);
                retries = 0;
            }
        }
        // Slice into chunks to avoid hitting size limit;
        const chunks = sliceIntoChunks(all_signatures, 150);

        from(chunks)
            .pipe(
                mergeMap(async (chunk) => {
                    let retries = 0;
                    // @ts-ignore
                    const parsedTxs = await connection.getParsedTransactions(chunk.map((tx) => tx.signature));
                    while (retries < 5) {
                        if (!parsedTxs?.every((tx) => !!tx)) {
                            retries++;
                            return [];
                        }
                        return parsedTxs.filter((tx) => !!tx);
                    }
                }, 4),
                // eslint-disable-next-line arrow-body-style
                map((chunk) => {
                    // @ts-ignore
                    return chunk
                        .map((h) => {
                            const mint = (h?.transaction?.message?.instructions as ParsedInstruction[])?.find(
                                (ix) => ix?.parsed?.type === 'mintTo'
                            )?.parsed?.info?.mint;

                            const botTax = h?.meta?.logMessages?.find((log) => log.includes('Candy Machine Botting is taxed at'));

                            if (!h?.meta?.err && mint && !botTax) {
                                setCounter(count++);
                                return mint;
                            }
                        })
                        .filter((r) => !!r);
                }),
                toArray()
            )
            .subscribe((res) => {
                resolve(res.flat());
                count = 0;
            });
    });
}
