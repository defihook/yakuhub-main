import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const { ObjectId } = Schema.Types;

const notificationSchema = new Schema(
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
        description: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        status: {
            type: String,
            required: true,
            default: 'unread'
        }
    },
    {
        timestamps: true
    }
);

const Notification = model('Notification', notificationSchema);

export default Notification;
