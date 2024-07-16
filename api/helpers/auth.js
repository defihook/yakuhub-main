/* eslint-disable no-underscore-dangle */
import { User } from '../models/models';
import jwt from 'jsonwebtoken';
import moment from 'moment';

export const attemptLogIn = async (wallet, ethAddress) => {
    let user;
    if (wallet) {
        user = await User.findOne({ wallet });
    } else if (ethAddress) {
        user = await User.findOne({ ethAddress });
    }

    if (!user) {
        user = await User.create({
            wallet,
            ethAddress
        });
    } else if (wallet) {
        await user.updateOne({
            wallet,
            ethAddress: ethAddress || user.ethAddress,
            lastLogin: moment().toISOString()
        });
    } else if (ethAddress) {
        await user.updateOne({
            wallet: wallet || user.wallet,
            ethAddress,
            lastLogin: moment().toISOString()
        });
    }
    if (wallet) {
        user = await User.findOne({ wallet });
    } else if (ethAddress) {
        user = await User.findOne({ ethAddress });
    }

    const yaku = process.env.YAKU;
    const token = jwt.sign({ id: user._id, wallet: user.wallet, ethAddress: user.ethAddress }, yaku);
    return { token, registered: user.registered, user };
};

export const signUp = async (wallet, username, ethAddress) => {
    let user;
    if (wallet) {
        user = await User.findOne({ wallet });
    } else if (ethAddress) {
        user = await User.findOne({ ethAddress });
    }
    if (user) {
        if (!username) {
            if (!user.registered) {
                await user.updateOne({ registered: true, wallet: wallet || user.wallet, ethAddress: ethAddress || user.ethAddress });
            }
        } else {
            await user.updateOne({
                vanity: username,
                registered: true,
                wallet: wallet || user.wallet,
                ethAddress: ethAddress || user.ethAddress
            });
        }
        if (wallet) {
            user = await User.findOne({ wallet });
        } else if (ethAddress) {
            user = await User.findOne({ ethAddress });
        }
        const yaku = process.env.YAKU;
        const token = jwt.sign({ id: user._id, wallet: user.wallet, ethAddress: user.ethAddress }, yaku);
        return { token, registered: user.registered, user };
    }

    user = await User.create({ wallet, vanity: username, ethAddress, registered: true });
    const yaku = process.env.YAKU;
    const token = jwt.sign({ id: user._id, wallet: user.wallet, ethAddress: user.ethAddress }, yaku);
    return { token, registered: user.registered, user };
};

export const linkDiscord = async (address, id, name, discriminator, avatar, membership) => {
    const user = await User.findOneAndUpdate(
        { wallet: address },
        {
            discord: {
                id,
                name,
                discriminator,
                avatar,
                membership
            }
        },
        { new: true }
    );

    return user;
};
