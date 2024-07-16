import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const attributeSchema = new Schema(
    {
        trait_type: String,
        value: String
    },
    { _id: false }
);
const metadataSchema = new Schema(
    {
        mint: {
            type: String,
            unique: true
        },
        symbol: String,
        name: String,
        description: String,
        seller_fee_basis_points: Number,
        image: String,
        external_url: String,
        edition: Object,
        attributes: [attributeSchema],
        properties: Object,
        project: Object
    },
    {
        timestamps: true
    }
);

const Metadata = model('Metadata', metadataSchema);

export default Metadata;
