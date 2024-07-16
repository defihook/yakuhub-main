import { MintNotification } from '../../models/models';

export default {
    Query: {
        getMintNotificationsByUserId: async (root, args, context, info) => {
            const mints = await MintNotification.find({ userId: context.user.id });
            return mints;
        }
    },
    Mutation: {
        createMintNotification: async (root, args, context, info) => {
            const mint = await new MintNotification({
                title: args.title,
                date: args.date,
                userId: context.user.id,
                notified: ''
            }).save();
            return mint;
        },
        removeMintNotification: async (root, args, context, info) => {
            const result = await MintNotification.deleteOne({ userId: context.user.id, title: args.title });
            return result ? true : false;
        }
    }
};
