import { Connection } from '@solana/web3.js';
import { BonfidaFetched } from 'types/bonfida';
import { resolveAuction } from './auction';
import { resolveDomain } from './domain';
import { resolveFixedPrice } from './fixed-price';

// eslint-disable-next-line import/prefer-default-export
export const resolveBonfida = async (connection: Connection, name: BonfidaFetched) => {
    const now = new Date().getTime() / 1_000;
    let fixedPrice = false;
    let auction = false;

    const { registered, owner, pubkey, content } = await resolveDomain(connection, name.name);

    if (registered && owner) {
        // If registered:
        // - Check if auctioned
        // - Check if fixed price
        fixedPrice = await resolveFixedPrice(connection, owner);
        const endTime = await resolveAuction(connection, pubkey);

        if (!!endTime && endTime > now) {
            auction = true;
        }
    } else {
        // If no registered:
        // - Check if auction exist
        const endTime = await resolveAuction(connection, pubkey);
        auction = !!endTime;
    }

    name.auction = auction;
    name.fixedPrice = fixedPrice;
    name.registered = registered;
    name.owner = owner?.toBase58();
    name.content = content;

    return name;
};
