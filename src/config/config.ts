import { web3 } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { ENV as ENVChainId } from '@solana/spl-token-registry';

export const USER_POOL_SIZE = 3664;
export const GLOBAL_AUTHORITY_SEED = 'global-authority';
export const EPOCH = 86400;
export const REWARD_TOKEN_DECIMAL = 1000000000;

export const REWARD_TOKEN_MINT = new PublicKey('326vsKSXsf1EsPU1eKstzHwHmHyxsbavY4nTJGEm3ugV');
export const PROGRAM_ID = '8g3PG15GWGFsBLtfaVXZ8ntpUTNvwDMsrW2dRFr7pR4V';
export const STAKING_PROGRAM_ID = '37aAtYopXocCAbB3yQJ5382HGdo39P4ygKQtaRyhnVWG';
export const STAKING_CONFIG_ID = 'AyGU2zPhENQdLEkJQNTNaZbqAS5Hmh5ifAGZZXEGigcy';
export const STAKING_REWARD_MINT = 'NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s';

export const TOKEN_ADDR = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';
export const YAKU_SPL_TOKEN_PROGRAM_ID = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';

export const NFT_CREATOR = '5SjFvSud46uBFRNXQnAuzFspps5fRnhZjm83TXnY7BPu'; // astro only
export const YAKU_ONI_NFT_CREATOR = [
    'Dw73TsHMG8fgT7smeAobwcTZZeJ491NWAKQ1NSiRbJug',
    '6CzTQjSPcW9x4axzZLFtTq5BwsRvw4ksUWqaAkrEsRb9',
    'HMduKVo3A19U5EpQdEhPjo9hq9zfZXn8aGVYZp7Vc7fX'
];
export const YAKU_CAPSULE_NFT_CREATOR = [
    '2ekR5opinwLHa6GMr3LjJt44z4RA8Rx1hqviL6npFz5s',
    '6CzTQjSPcW9x4axzZLFtTq5BwsRvw4ksUWqaAkrEsRb9',
    'HMduKVo3A19U5EpQdEhPjo9hq9zfZXn8aGVYZp7Vc7fX'
];
export const YAKU_X_NFT_CREATOR = [
    '8vT6Uz3CuNXXW9qux432r6H4FufA76DJjMnMZb9EgVip',
    'EaFLjditD7WmUFEfnkcB778xTgpTemh5852Dwfi4fej9',
    'RRUMF9KYPcvNSmnicNMAFKx5wDYix3wjNa6bA7R6xqA'
];

export const YAKU_ONI_NFT_CREATOR_EX = [
    'GVq5YMrE2awfJKHhDooUCApEwamoMUsY1ep1FrTBV6vf',
    '6CzTQjSPcW9x4axzZLFtTq5BwsRvw4ksUWqaAkrEsRb9',
    'HMduKVo3A19U5EpQdEhPjo9hq9zfZXn8aGVYZp7Vc7fX'
];

export const YAKU_COLLECTION_CREATORS = [
    NFT_CREATOR,
    YAKU_ONI_NFT_CREATOR[0],
    YAKU_CAPSULE_NFT_CREATOR[0],
    YAKU_X_NFT_CREATOR[0],
    YAKU_ONI_NFT_CREATOR_EX[0]
];
export const METAPLEX = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
export const TOKEN_ACC_SOLSCAN_API_ENDPOINT = 'https://public-api.solscan.io/account/tokens?account=';
export const TOKEN_ACCOUNT = 'C1zWiW8jA3rxKkMa5q8tADXpi8LXWciACQV3VG3KFgw';
export const YAKU_TOKEN_ACCOUNT = 'Ekmn56iJGTm5MXNf2PcF9fK2rj2qooWWKcxhStecudrX';

export const STAKING_OWNER_ADDR = '8dSqaJtFkoNfTDyWVS15MsSCLH1DXGmjJFvshEWkfDiG';

export const YAKU_STAKING_NODE = 'https://patient-dark-cherry.solana-mainnet.quiknode.pro/7b72f1d0ba0c9313a39cad3ae4f67c28f3b28755/';

export const YAKU_TOKEN_ICON =
    'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EK58dp4mxsKwwuySWQW826i3fwcvUK69jPph22VUcd2H/logo.png';

export const YAKU_TOKEN_EXCLUDE_WALLET = [
    '8EZ3AAjVwb7MbJGWJudz9tDJPGNoPJt3eKG27P8JNDkQ',
    'HEp1pPEk7M4yNS3R9K6G66Y7v2VWiCA3eAHMvvFqC6iN',
    '5SjFvSud46uBFRNXQnAuzFspps5fRnhZjm83TXnY7BPu'
];

export const DEFAULT_PAY_TYPE = 'SOL';
export const TOKEN_PAY_TYPE = 'YAKU';

export const WHITELIST_MAX = 50;
export const TICKETS_MAX = 5000;
export const MAX_BUYING_TICKET = 0.02;
export const RAFFLE_REWARD_TYPES: Record<string, number> = {
    nft: 2,
    whitelist: 0,
    spl: 1
};

export const USE_QUIKNODE = true;

export const USDCMINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC Token address in mainnet

export const RPC_LIST = [
    'https://patient-dark-cherry.solana-mainnet.quiknode.pro/7b72f1d0ba0c9313a39cad3ae4f67c28f3b28755/',
    'https://solana-api.projectserum.com/',
    'https://rpc.ankr.com/solana',
    'https://api.mainnet-beta.solana.com/',
    'https://try-rpc.mainnet.solana.blockdaemon.tech/'
];

export const DEFAULT_RPC = RPC_LIST[0];
export const DEBUG = 0;
export const SNIPER_API_URL = 'http://localhost:3333';
export const SNIPER_SOCKET = 'wss://sniper.yaku.ai/ws';

export const MARKETPLACE_PROGRAM_ID: any = {
    '5SKmrbAxnHV2sgqyDXkGrLrokZYtWWVEEk5Soed7VLVN': 'Yawww',
    HYPERfwdTjyJ2SCaKHmpF2MtrXqWxrsotYDsTrshHWq8: 'Hyperspace',
    M2mx93ekt1fmXSVkTrUL9xVFHkmME8HTUi5Cyc5aF7K: 'MagicEden',
    CJsLwbP1iu5DuUikHEJnLfANgKy6stB2uFgvBBHoyxwz: 'Solanart',
    SVTy4zMgDPExf1RaJdoCo5HvuyxrxdRsqF1uf2Rcd7J: 'Solvent',
    hausS13jsjafwWwGqZTUQRmWyvyxn9EQpqMwV1PBBmk: 'Opensea'
};

export const RARITY_COLORS: any = {
    C: '#969696',
    U: '#40D897',
    R: '#45C2FE',
    E: '#A629F8',
    L: '#FD8F31',
    M: '#ED3B50'
};

export const IMAGE_PROXY = 'https://beta.api.solanalysis.com/images/400x400/filters:frames(,0)/';
export const IMAGE_PROXY_LOGO = 'https://beta.api.solanalysis.com/images/952x215/filters:frames(,0)/';

export const CHAIN_ID = ENVChainId.MainnetBeta;

// Token Mints
export const INPUT_MINT_ADDRESS = 'So11111111111111111111111111111111111111112'; // SOL
export const OUTPUT_MINT_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC

export const IMAGE_PROXY_BANNER = 'https://beta.api.solanalysis.com/images/1920x400/filters:frames(,0)/';

export const DEFAULT_IMAGE_URL = `https://ik.imagekit.io/g1noocuou2/Yakushima_Studios/tr:w-30/Logo4K.png?ik-sdk-version=javascript-1.4.3&updatedAt=1657556475258`;
export const DEFAULT_BANNER = `https://i.imgur.com/iII33BT.png`;

export const USE_ME_API_FOR_COLLECTION_BUY = false;

export const DEFAULT_BUYER_BROKER = 'Auh2DLaxXjFAetZSTfZcMbZv8HPSmv1yziZPmaqnT7Qa';
