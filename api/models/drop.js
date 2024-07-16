import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const dropSchema = new Schema(
    {
        date: String,
        time: String,
        extra: String,
        price: String,
        twitter: String,
        discord: String,
        website: String,
        nft_count: Number,
        name: {
            type: String,
            unique: true
        },
        left: String,
        image: String
    },
    {
        timestamps: true
    }
);

const Drop = model('Drop', dropSchema);

export default Drop;
