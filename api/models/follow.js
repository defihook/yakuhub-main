import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const followSchema = new Schema(
    {
        user: {
            type: ObjectId,
            ref: 'User'
        },
        wallet: {
            type: String
        }
    },
    {
        timestamps: true
    }
);
const Follow = model('Follow', followSchema);

export default Follow;
