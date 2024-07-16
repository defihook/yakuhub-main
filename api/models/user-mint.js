import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const userMintSchema = new Schema(
    {
        userId: {
            type: ObjectId,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        date: {
            type: String,
            required: true
        },
        supply: {
            type: String,
            required: true
        },
        logo: {
            type: String,
            required: false,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

const UserMint = model('UserMint', userMintSchema);

export default UserMint;
