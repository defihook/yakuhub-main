import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { getStateByKey } from 'actions/raffle';
import { DEFAULT_PAY_TYPE, RAFFLE_REWARD_TYPES, TOKEN_PAY_TYPE } from 'config/config';
import { YAKU_DECIMALS } from 'config';

export const getRaffleData = async ({
    connection,
    wallet,
    raffleKey
}: {
    connection: Connection;
    wallet: any;
    raffleKey?: string | string[];
}) => {
    if (raffleKey === undefined) {
        return undefined;
    }
    const raffleData: any = await getStateByKey(connection, new PublicKey(raffleKey));

    if (raffleData === null || raffleData === undefined) return undefined;
    console.debug('raffleData', raffleData);
    const tickets = raffleData.count?.toNumber();
    const winnerCnt = raffleData.winnerCount.toNumber();
    const mine: any = [];
    const entrants: any = [];
    for (let i = 0; i < tickets; i += 1) {
        if (raffleData.entrants[i]) {
            entrants.push({
                address: raffleData.entrants[i]?.toBase58(),
                index: i + 1
            });
        }
        if (raffleData.entrants[i]?.toBase58() === wallet.publicKey?.toBase58()) {
            mine.push({
                index: i + 1
            });
        }
    }

    const winners = [];
    const resWinners = raffleData.winner;
    const claimedWinner = raffleData.claimedWinner;
    let claimed = 0;
    let isClaimed = false;
    let isWinner = false;
    for (let i = 0; i < winnerCnt; i += 1) {
        winners.push({
            address: resWinners[i].toBase58(),
            index: raffleData.indexes[i].toNumber(),
            claimed: claimedWinner[i].toNumber()
        });

        if (resWinners[i].toBase58() === wallet.publicKey?.toBase58() && claimedWinner[i].toNumber() === 1) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            claimed += 1;
            isClaimed = true;
        }

        if (wallet.publicKey !== null && resWinners[i].toBase58() === wallet.publicKey?.toBase58()) {
            isWinner = true;
        }
    }
    const allClaimed = winners.map((e: any) => e.claimed).reduce((a: number, b: number) => a + b) === winnerCnt;

    const raffleDataResp = {
        tickets,
        end: raffleData.endTimestamp.toNumber() * 1000,
        wl: raffleData.whitelisted.toNumber(),
        price:
            (raffleData.ticketPriceSol.toNumber() || raffleData.ticketPricePrey.toNumber()) /
            (raffleData.ticketPricePrey.toNumber() === 0 ? LAMPORTS_PER_SOL : YAKU_DECIMALS),
        payType: raffleData.ticketPricePrey.toNumber() === 0 ? DEFAULT_PAY_TYPE : TOKEN_PAY_TYPE,
        myTickets: mine,
        maxTickets: raffleData.maxEntrants.toNumber(),
        winnerCnt,
        isRevealed: !(raffleData.winner[0].toBase58() === '11111111111111111111111111111111'),
        winners,
        isClaimed,
        isWinner,
        allClaimed,
        participants: entrants,
        featured: raffleData.whitelisted.toNumber() === RAFFLE_REWARD_TYPES.nft,
        creator: raffleData.creator.toBase58()
    };
    return raffleDataResp;
};

const fetchData = {
    getRaffleData
};

export default fetchData;
