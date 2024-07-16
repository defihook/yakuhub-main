/* eslint-disable no-underscore-dangle */
import { User } from '../../models/models';
import * as Auth from '../../helpers/auth';
import axios from 'axios';
import Subwallet from '../../models/subwallet';
import { ApolloError } from 'apollo-server-core';
import Follow from '../../models/follow';
import { Client, auth } from 'twitter-api-sdk';
import moment from 'moment';

export default {
    Query: {
        // TODO: projection, pagination, sanitization
        users: async (root, args, context, info) => {
            const { wallets = [] } = args;
            const users = await User.find({
                wallet: {
                    $in: wallets
                }
            });
            return users;
        },
        user: async (root, args, context, info) => {
            if (args.wallet) {
                const user = await User.findOne({ wallet: args.wallet });
                return user;
            }
            const user = await User.findOne({ ethAddress: args.ethAddress });
            return user;
        },
        getSiteStats: async (root, args, context, info) => {
            const total = await User.count();
            const activeCount = await User.find({
                updatedAt: {
                    $gte: moment().add(-1, 'month').toDate()
                }
            }).count();
            const twitterCount = await User.find({ twitter: { $ne: null } }).count();
            const discordCount = await User.find({ discord: { $ne: null } }).count();
            const ethCount = await User.find({ ethAddress: { $ne: null } }).count();
            return {
                total,
                activeCount,
                twitterCount,
                discordCount,
                ethCount
            };
        },
        getAllLinkedWallet: async (root, args, context, info) => {
            const { user } = args;
            const found = await Subwallet.find({ user });
            return found;
        },
        isFollowed: async (root, args, context, info) => {
            const { user, wallet } = args;
            const found = await Follow.findOne({ user, wallet });
            return !!found;
        },
        getUserFollowings: async (root, args, context, info) => {
            const { wallet } = args;
            const user = await User.findOne({ wallet });
            const found = await Follow.find({ user: user._id });
            return found;
        },
        getUserFollowers: async (root, args, context, info) => {
            const { wallet } = args;
            const found = await Follow.find({ wallet }).populate('user');
            return found;
        },
        getUserByTwitterHandle: async (root, args, context, info) => {
            const user = await User.findOne({ 'twitter.username': { $regex: `^${args.twitterHandle}$`, $options: 'i' } });
            return user;
        }
    },
    Mutation: {
        login: async (root, args, context, info) => {
            const user = await Auth.attemptLogIn(args.wallet, args.ethAddress);
            return user;
        },
        signup: async (root, args, context, info) => {
            const user = await Auth.signUp(args.wallet, args.vanity, args.ethAddress);
            return user;
        },
        discordAuth: async (root, args, context, info) => {
            const API_ENDPOINT = 'https://discord.com/api/v10';
            const GUILDID = '889791853094912000';
            const { address, code, redirectUri } = args;
            const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, REDIRECT_URI } = process.env;
            const data = {
                client_id: DISCORD_CLIENT_ID,
                client_secret: DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri || REDIRECT_URI
            };
            try {
                const { data: resp } = await axios.post(`${API_ENDPOINT}/oauth2/token`, new URLSearchParams(data), {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
                if (resp) {
                    const { access_token, token_type } = resp;
                    const { data: userData } = await axios.get(`${API_ENDPOINT}/users/@me`, {
                        headers: {
                            Authorization: `${token_type} ${access_token}`
                        }
                    });
                    const { id, username, discriminator, avatar } = userData;
                    const { data: memberData } = await axios.get(`${API_ENDPOINT}/users/@me/guilds/${GUILDID}/member`, {
                        headers: {
                            Authorization: `${token_type} ${access_token}`
                        }
                    });

                    if (id && username) {
                        const user = await Auth.linkDiscord(address, id, username, discriminator, avatar, memberData);
                        return user;
                    }

                    const user = await User.findOne({ wallet: address });
                    return user;
                }
            } catch (error) {
                console.error(error);
            }

            return {};
        },
        getDiscordConnectURL: (root, args, context, info) => {
            const { DISCORD_CLIENT_ID, REDIRECT_URI } = process.env;
            const baseURL = `https://discord.com/api/oauth2/authorize?client_id=${DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
                args.redirectUri || REDIRECT_URI
            )}&response_type=code&scope=identify%20guilds%20guilds.members.read`;
            return baseURL;
        },
        linkWallet: async (root, args, context, info) => {
            const { wallet, user } = args;
            const found = await Subwallet.find({ user, wallet });
            if (found && found.length) {
                throw new ApolloError('Already Linked.');
            }
            const result = await Subwallet.create({ user, wallet });
            return result;
        },
        unlinkWallet: async (root, args, context, info) => {
            const { wallet, user } = args;
            const found = await Subwallet.find({ user, wallet });
            if (found && found.length) {
                const result = await Subwallet.remove({ user, wallet });
                return result;
            }
            throw new ApolloError('Wallet Non Linked');
        },
        followWallet: async (root, args, context, info) => {
            const { user, wallet } = args;
            const found = await Follow.findOne({ user, wallet });
            if (found) {
                await Follow.findOneAndDelete({ user, wallet });
                return { result: 'DELETED' };
            }
            await Follow.create({ user, wallet });
            return { result: 'FOLLOWED' };
        },
        getTwitterAuth: async (root, args, context, info) => {
            const STATE = 'connect-twitter';

            const { TWITTER_CLIENT_ID, TWITTER_SECRET, REDIRECT_URI } = process.env;
            const callbackUrl = args.redirectUri || REDIRECT_URI;
            const authClient = new auth.OAuth2User({
                client_id: TWITTER_CLIENT_ID,
                client_secret: TWITTER_SECRET,
                callback: callbackUrl,
                scopes: ['tweet.read', 'users.read']
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
            const client = new Client(authClient);
            const authUrl = authClient.generateAuthURL({
                state: STATE,
                code_challenge: args.address,
                code_challenge_method: 'plain'
            });
            await User.findOneAndUpdate(
                { wallet: args.address },
                {
                    'twitter.code_challenge': args.address
                },
                {
                    new: true
                }
            );

            return authUrl;
        },
        linkTwitter: async (root, args, context, info) => {
            try {
                const { code, address, redirectUri } = args;
                const user = await User.findOne({ wallet: address });
                const STATE = 'connect-twitter';
                const { TWITTER_CLIENT_ID, TWITTER_SECRET, REDIRECT_URI } = process.env;
                const callbackUrl = redirectUri || REDIRECT_URI;
                const authClient = new auth.OAuth2User({
                    client_id: TWITTER_CLIENT_ID,
                    client_secret: TWITTER_SECRET,
                    callback: callbackUrl,
                    scopes: ['tweet.read', 'users.read']
                });
                // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
                const authUrl = authClient.generateAuthURL({
                    state: STATE,
                    code_challenge: user.twitter.code_challenge,
                    code_challenge_method: 'plain'
                });
                const { token } = await authClient.requestAccessToken(code);
                console.log(token);
                const client = new Client(authClient);
                const { data } = await client.users.findMyUser();
                console.log(data);
                const newUser = await User.findOneAndUpdate(
                    { wallet: address },
                    {
                        twitter: {
                            token,
                            ...data
                        }
                    },
                    {
                        new: true
                    }
                );
                return newUser;
            } catch (error) {
                console.log(error);
            }
            return {};
        },
        setAvatar: async (root, args, { user }, info) => {
            const { imageUrl } = args;
            try {
                await User.findByIdAndUpdate(user.id, { avatar: imageUrl });
                return true;
            } catch (error) {
                return false;
            }
        },
        setBanner: async (root, args, { user }, info) => {
            const { imageUrl } = args;
            try {
                await User.findByIdAndUpdate(user.id, { banner: imageUrl });
                return true;
            } catch (error) {
                return false;
            }
        },
        updateProfile: async (root, args, { user }, info) => {
            const { profile } = args;
            const { vanity, bio, location } = profile;
            try {
                await User.findByIdAndUpdate(user.id, { vanity, bio, location });
                return true;
            } catch (error) {
                return false;
            }
        }
    }
};
