import { TransactionSignature, Connection } from '@solana/web3.js';
import { NETWORK } from 'config';

export const DEFAULT_TIMEOUT = 15000;

export const getUnixTs = () => new Date().getTime() / 1000;

export const envFor = (connection: Connection): string => {
    const endpoint = (connection as any).rpcEndpoint;
    console.log(connection);
    const regex = /https:\/\/api.([^.]*).solana.com/;
    const match = endpoint.match(regex);

    if (match?.length > 0) {
        return match[1];
    }
    return NETWORK;
};

export const explorerLinkFor = (txid: TransactionSignature, connection: Connection): string =>
    `https://explorer.solana.com/tx/${txid}?cluster=${envFor(connection)}`;
