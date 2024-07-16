import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const favouriteMintSchema = new Schema(
    {
        userId: {
            type: ObjectId,
            required: true
        },
        title: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const FavouriteMint = model('FavouriteMint', favouriteMintSchema);

export default FavouriteMint;
