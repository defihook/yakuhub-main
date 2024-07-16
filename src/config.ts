// web3
import { web3 } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

// types
import { ThemeConfigProps, ConfigOptions } from 'types/config';

// basename: only at build time to set, and Don't add '/' at end off BASENAME for breadcrumbs, also Don't put only '/' use blank('') instead,
export const BASE_PATH = '';

export const NETWORK = 'mainnet-beta';
export const ETH_NETWORK = 'Mainnet';
// staking/raffles
export const GLOBAL_AUTHORITY_SEED = 'global-authority';
export const METAPLEX = new web3.PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
export const COSMIC_TOKEN_MINT = new PublicKey('326vsKSXsf1EsPU1eKstzHwHmHyxsbavY4nTJGEm3ugV');
export const YAKU_TOKEN_MINT = new PublicKey('NGK3iHqqQkyRZUj4uhJDQqEyKKcZ7mdawWpqwMffM3s');

export const USER_POOL_SIZE = 3664;
export const EPOCH = 86400;
export const STAKING_PROGRAM = '8g3PG15GWGFsBLtfaVXZ8ntpUTNvwDMsrW2dRFr7pR4V'; // cosmos staking use

export const RAFFLE_SIZE = 182544;
export const RAFFLE_PROGRAM = '2QzwyjJ9owcEm6HWCaEmCVLqBZeKjRniZ3NMT3LV6qvb';
export const YAKU_DECIMALS = 1000000000;

export const SWAP_FEE_BPS = 0; // max is 20 (0.2%)
export const SWAP_FEE_RECEIVER = '3oiJLmbPes3F7zV4ekVUwhNt4ZV3dnj8vgjqvoA47AiG';

// this is ass, use user hook to get isStaff variable
export const RAFFLE_ADMINS = [
    {
        address: '45rzLU1gPiEsaDtmkjvawgKDYYpSTHdVXKJjZ74dBDFg'
    },
    {
        address: 'Auh2DLaxXjFAetZSTfZcMbZv8HPSmv1yziZPmaqnT7Qa'
    },
    {
        address: 'FNbVw5r57YPfno86ibG9FTuN69BhYQaQraMKX8NRQAA6'
    },
    {
        address: '5SjFvSud46uBFRNXQnAuzFspps5fRnhZjm83TXnY7BPu'
    },
    {
        address: '8EggToWiX8dynP2r9rzVvfjs3yD7tFfVVeWk126X5V1x'
    }
];

export const LOCALES = [
    {
        value: 'en',
        label: 'English',
        desc: 'UK'
    },
    {
        value: 'de',
        label: 'Deutsch',
        desc: 'German'
    },
    {
        value: 'fr',
        label: 'Français',
        desc: 'French'
    },
    {
        value: 'ro',
        label: 'Română',
        desc: 'Romanian'
    },
    {
        value: 'zh',
        label: '简体中文',
        desc: 'Simplified Chinese'
    },
    {
        value: 'zh-tw',
        label: '繁體中文',
        desc: 'Traditional Chinese'
    },
    {
        value: 'ja',
        label: '日本語',
        desc: 'Japanese'
    }
];

export const appConfig: ConfigOptions = {
    spaces: {
        wallet: '45rzLU1gPiEsaDtmkjvawgKDYYpSTHdVXKJjZ74dBDFg',
        pricePerYear: 0.2
    },

    ambassadors: {
        defaultDiscount: 0.5,
        defaultPayout: 0.5
    }
};

export const config: ThemeConfigProps = {
    defaultPath: '/home',
    fontFamily: `'Inter', sans-serif`,
    borderRadius: 8,
    mode: 'dark', // light, dark
    presetColor: 'default', // default, theme1, theme2, theme3, theme4, theme5, theme6
    locale: 'en', // 'en' - English, 'fr' - French, 'ro' - Romanian, 'zh' - Chinese
    container: false
};

export default config;
