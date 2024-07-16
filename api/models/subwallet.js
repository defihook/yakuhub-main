import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const subwalletSchema = new Schema(
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
const Subwallet = model('Subwallet', subwalletSchema);

export default Subwallet;
