import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const mintNotificationSchema = new Schema(
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
        notified: {
            type: String,
            required: false,
            default: ''
        }
    },
    {
        timestamps: true
    }
);

const MintNotification = model('MintNotification', mintNotificationSchema);

export default MintNotification;
