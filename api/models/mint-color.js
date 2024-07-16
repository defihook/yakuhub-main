import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const mintColorSchema = new Schema(
    {
        userId: {
            type: ObjectId,
            required: true
        },
        title: {
            type: String,
            required: true
        },
        color: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const MintColor = model('MintColor', mintColorSchema);

export default MintColor;
