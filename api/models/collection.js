import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const rankDetailSchema = new Schema({
    attribute: String,
    value: String,
    value_perc: Number,
    times_seen: Number,
    total_seen: Number
});

const rankingSchema = new Schema(
    {
        mint: String,
        name: String,
        image: String,
        rank: Number,
        rank_explain: [rankDetailSchema]
    },
    { _id: false }
);

const collectionSchema = new Schema(
    {
        symbol: {
            type: String,
            unique: true
        },
        blockchain: String,
        candyMachineIds: {
            type: [String]
        },
        categories: {
            type: [String]
        },
        createdAt: String,
        description: String,
        discord: String,
        enabledAttributesFilters: Boolean,
        image: String,
        isAutolist: Boolean,
        name: String,
        rarity: {
            type: Object
        },
        totalItems: {
            type: Number,
            default: 0
        },
        twitter: String,
        website: String,
        derivativeDetails: Object,
        flagMessage: String,
        isDerivative: Boolean,
        isDraft: Boolean,
        isFlagged: Boolean,
        watchlistCount: Number,
        enabledTotalSupply: Boolean,
        iframe: String,
        nftImageType: String,
        onChainCollectionAddress: String,
        blockedMints: [String],
        updatedAt: String,
        floorPrice: Number,
        listedCount: Number,
        volumeAll: Number,
        avgPrice24hr: Number,
        moonRankSymbol: String,
        ranking: [rankingSchema]
    },
    {
        timestamps: true
    }
);

collectionSchema.index({ symbol: 1 }, { unique: true });

const User = model('Collection', collectionSchema);

export default User;
