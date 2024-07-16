import { PublicKey } from '@solana/web3.js';
import { first, toUpper, get, each, toInteger } from 'lodash';
import { MARKETPLACE_PROGRAM_ID } from 'config/config';
import MEMarketLogo from 'assets/images/icons/logo_magiceden.svg';
import SolportLogo from 'assets/images/icons/solport.svg';
import YawwwLogo from 'assets/images/icons/yawww.jpg';
import SolseaLogo from 'assets/images/icons/solsea.png';
import SolanartLogo from 'assets/images/icons/solanart.svg';
import OpenseaLogo from 'assets/images/icons/opensea.svg';
import HyperspaceLogo from 'assets/images/icons/hyperspace.svg';
import CoralcubeLogo from 'assets/images/icons/coralcube.svg';
import SolventLogo from 'assets/images/icons/svt.png';

/* eslint-disable */

// Cosmic Astronauts Related
export const casRoles = ['Adventurer', 'Scientist', 'Doctor', 'Mission Specialist', 'Commander'];
export const roleRewards = [
    { roles: ['Adventurer'], dailyReward: 20 },
    { roles: ['Scientist'], dailyReward: 25 },
    { roles: ['Doctor'], dailyReward: 30 },
    { roles: ['Mission Specialist'], dailyReward: 35 },
    { roles: ['Commander'], dailyReward: 40 }
];

export enum NftRole {
    CosmicRoles = 1,
    OneOfOne = 2
}

// Formatters
export const formatPriceNumber = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 8
});

export const formatUSD = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
});

const numberFormater = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
});

export const formatPct = new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
});

export const dateFormatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
});

export const formatDate = {
    format: (val?: Date) => {
        if (!val) {
            return 'undefined';
        }

        return dateFormatter.format(val);
    }
};

export const formatNumber = {
    format: (val?: number) => {
        if (!val) {
            return '--';
        }

        return numberFormater.format(val);
    }
};

export const formatPercent = {
    format: (val?: number) => {
        if (!val) {
            return '--';
        }

        return formatPct.format(val);
    }
};

// Functions
export function shortenAddress(address: string, chars = 4): string {
    if (address) {
        return `${address.slice(0, chars)}...${address.slice(-chars)}`;
    } else {
        return ''
    }
}

export const STABLE_COINS = new Set(['USDC', 'wUSDC', 'USDT']);

export const tryParseKey = (key: string): PublicKey | null => {
    try {
        return new PublicKey(key);
    } catch (error) {
        return null;
    }
};

export const abbreviateValue = (value: number) => {
    let newValue: any = value;
    if (value >= 1000) {
        const suffixes = ['', 'K', 'M', 'B', 'T'];
        const suffixNum = Math.floor(('' + value).length / 3);
        let shortValue: any = '';
        for (let precision = 2; precision >= 1; precision--) {
            shortValue = parseFloat((suffixNum != 0 ? value / Math.pow(1000, suffixNum) : value).toPrecision(precision));
            let dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
            if (dotLessShortValue.length <= 2) {
                break;
            }
        }
        if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
        newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
};

const SI_SYMBOL = ['', 'k', 'M', 'B', 'T', 'P', 'E'] as const;
const abbreviateNumber = (number: number, precision: number) => {
    if (!number) {
        return number;
    }
    const tier = toInteger(Math.log10(number) / 3) || 0;
    let scaled = number;
    const suffix = SI_SYMBOL[tier];

    if (tier !== 0) {
        const scale = Math.pow(10, tier * 3);
        scaled = number / scale;
    }

    precision = Number.isInteger(scaled) ? 0 : precision;

    return scaled.toFixed(precision) + suffix;
};

export const formatAmount = (val: number, precision: number = 2, abbr: boolean = true) =>
    abbr ? abbreviateNumber(val, precision) : val.toFixed(precision);

export function pub(pubkey: string) {
    return new PublicKey(pubkey);
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function royalty(value: number | undefined): string {
    return `${((value || 0) / 100).toFixed(2)}%`;
}

export function isValidHttpUrl(text: string) {
    if (text.startsWith('http:') || text.startsWith('https:')) {
        return true;
    }

    return false;
}

export function isValidSolanaAddress(address: string) {
    try {
        // eslint-disable-next-line
        new PublicKey(address);
        return true;
    } catch (error) {
        return false;
    }
}

export const rarityDiv = (collectionSize: number) => ({
    C: {
        Rarest:
            Math.ceil(collectionSize * 0.6) === Math.floor(collectionSize * 0.6)
                ? Math.ceil(collectionSize * 0.6) + 1
                : Math.ceil(collectionSize * 0.6),
        Unique: collectionSize
    },
    U: {
        Rarest:
            Math.ceil(collectionSize * 0.35) === Math.floor(collectionSize * 0.35)
                ? Math.ceil(collectionSize * 0.35) + 1
                : Math.ceil(collectionSize * 0.35),
        Unique: Math.floor(collectionSize * 0.6)
    },
    R: {
        Rarest:
            Math.ceil(collectionSize * 0.15) === Math.floor(collectionSize * 0.15)
                ? Math.ceil(collectionSize * 0.15) + 1
                : Math.ceil(collectionSize * 0.15),
        Unique: Math.floor(collectionSize * 0.35)
    },
    E: {
        Rarest:
            Math.ceil(collectionSize * 0.05) === Math.floor(collectionSize * 0.05)
                ? Math.ceil(collectionSize * 0.05) + 1
                : Math.ceil(collectionSize * 0.05),
        Unique: Math.floor(collectionSize * 0.15)
    },
    L: {
        Rarest:
            Math.ceil(collectionSize * 0.01) === Math.floor(collectionSize * 0.01)
                ? Math.ceil(collectionSize * 0.01) + 1
                : Math.ceil(collectionSize * 0.01),
        Unique: Math.floor(collectionSize * 0.05)
    },
    M: { Rarest: 0, Unique: Math.floor(collectionSize * 0.01) }
});

export const getRarity = (division: any, rank_est: number) => {
    if (rank_est === undefined) {
        return undefined;
    }
    let result;
    each(Object.keys(division), (rankingKey) => {
        if (Number(rank_est) >= Number(division[rankingKey].Rarest) && Number(rank_est) <= Number(division[rankingKey].Unique)) {
            result = rankingKey;
            return false;
        }
        return true;
    });
    return result;
};

export const getMarketplaceIcon = (programId: string) => {
    const marketplaceName = MARKETPLACE_PROGRAM_ID[programId] || programId;
    if (marketplaceName) {
        switch (marketplaceName) {
            case 'magiceden_v2':
            case 'magiceden':
            case 'MagicEden':
                return MEMarketLogo;
            case 'Solport':
                return SolportLogo;
            case 'Yawww':
                return YawwwLogo;
            case 'Solsea':
                return SolseaLogo;
            case 'Solanart':
                return SolanartLogo;
            case 'Opensea':
                return OpenseaLogo;
            case 'Hyperspace':
                return HyperspaceLogo;
            case 'Coralcube':
                return CoralcubeLogo;
            case 'Solvent':
                return SolventLogo;
            default:
                return undefined;
        }
    }
    /* eslint-enable no-bitwise */

    return undefined;
};

export const stringToColor = (string: string) => {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
};

export const stringAvatar = (name: string) => ({
    sx: {
        bgcolor: stringToColor(name)
    },
    children: toUpper(`${first(name.split(' ')[0])}${first(get(name.split(' '), 1, ' '))}`)
});
export const numberFormatter = (num: number, digits: number) => {
    const lookup = [
        { value: 1, symbol: '' },
        { value: 1e3, symbol: 'K' },
        { value: 1e6, symbol: 'M' },
        { value: 1e9, symbol: 'G' },
        { value: 1e12, symbol: 'T' },
        { value: 1e15, symbol: 'P' },
        { value: 1e18, symbol: 'E' }
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup
        .slice()
        .reverse()
        .find(function (item) {
            return num >= item.value;
        });
    return item ? (num / item.value).toFixed(digits).replace(rx, '$1') + item.symbol : '0';
};
