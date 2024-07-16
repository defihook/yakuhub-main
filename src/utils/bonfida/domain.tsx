import { Connection } from '@solana/web3.js';
import * as sns from '@bonfida/spl-name-service';
import { derive } from './name-service';

// eslint-disable-next-line import/prefer-default-export
export const resolveDomain = async (connection: Connection, name: string) => {
    const { pubkey } = await derive(name);
    try {
        const { registry } = await sns.NameRegistryState.retrieve(connection, pubkey);
        return {
            registered: true,
            owner: registry.owner,
            pubkey,
            content: registry.data?.toString()
        };
    } catch {
        return { registered: false, pubkey };
    }
};

export interface DomainByWallet {
    address: string;
    class: string;
    name: string;
}
// eslint-disable-next-line import/prefer-default-export, consistent-return
export const retrieveBatch = async (wallet: string) => {
    let data: DomainByWallet[] = [];
    await fetch(`https://api.solscan.io/domain?address=${wallet}`)
        .then((resp) => resp.json())
        .then(async (json: any) => {
            data = json.data;
        })
        .catch((error) => {
            console.log(error);
        });
    return data;
};
