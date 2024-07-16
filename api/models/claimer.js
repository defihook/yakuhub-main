import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const claimerSchema = new Schema(
    {
        project: { type: String },
        employer: { type: String },
        name: { type: String },
        method: { type: String },
        amount: { type: String },
        wallet: { type: String },
        period: { type: String },
        transactionHash: [
            {
                date: { type: String },
                txHash: { type: String }
            }
        ],
        time: { type: String }
    },
    {
        timestamps: true
    }
);

const Claimer = model('claimer', claimerSchema);

export default Claimer;
