import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const apiSchema = new Schema(
    {
        title: String,
        count: Number
    },
    {
        timestamps: true
    }
);

const API = model('Api', apiSchema);

export default API;
