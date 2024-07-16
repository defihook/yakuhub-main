import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const auditSchema = new Schema(
    {
        user: Object,
        action: String,
        activity: String,
        status: String,
        ip: String,
        wallet: String,
        log: Object
    },
    {
        timestamps: true
    }
);

const Audit = model('Audit', auditSchema);

export default Audit;
