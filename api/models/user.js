import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const userSchema = new Schema(
    {
        wallet: {
            type: String,
            unique: true
        },
        ethAddress: {
            type: String,
            unique: true
        },
        vanity: {
            type: String,
            index: { unique: true, sparse: true }
        },
        registered: {
            type: Boolean,
            default: false
        },
        isStaff: {
            type: Boolean,
            default: false
        },
        discord: {
            type: Object
        },
        twitter: {
            type: Object
        },
        avatar: {
            type: String
        },
        banner: {
            type: String
        },
        bio: {
            type: String
        },
        location: {
            type: String
        },
        lastLogin: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

userSchema.statics.doesntExist = async function (options) {
    return (await this.where(options).countDocuments()) === 0;
};

const User = model('User', userSchema);

export default User;
