import { MintColor } from '../../models/models';

export default {
    Query: {
        getMintColorsByUserId: async (root, args, context, info) => {
            const mints = await MintColor.find({ userId: context.user.id });
            return mints;
        }
    },
    Mutation: {
        createMintColor: async (root, args, context, info) => {
            const isExists = await MintColor.findOne({ userId: context.user.id, title: args.title });
            if (isExists) {
                await MintColor.deleteOne({ userId: context.user.id, title: args.title });
            }

            const mint = await new MintColor({
                title: args.title,
                color: args.color,
                userId: context.user.id
            }).save();
            return mint;
        },
        removeMintColor: async (root, args, context, info) => {
            const result = await MintColor.deleteOne({ userId: context.user.id, title: args.title });
            return !!result;
        }
    }
};
