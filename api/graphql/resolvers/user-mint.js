import { UserMint } from '../../models/models';

export default {
    Query: {
        getUserMintsByUserId: async (root, args, context, info) => {
            const mints = await UserMint.find({ userId: context.user.id });
            return mints;
        }
    },
    Mutation: {
        createUserMint: async (root, args, context, info) => {
            const mint = await new UserMint({
                title: args.title,
                date: args.date,
                supply: args.supply,
                logo: args.logo,
                userId: context.user.id
            }).save();
            return mint;
        },
        updateUserMint: async (root, args, context, info) => {
            const found = await UserMint.findOne({ userId: context.user.id, title: args.previousTitle });
            const mint = await UserMint.findByIdAndUpdate(
                found._id,
                {
                    title: args.title,
                    date: args.date,
                    supply: args.supply,
                    logo: args.logo
                },
                { new: true }
            );
            return mint;
        },
        removeUserMint: async (root, args, context, info) => {
            const result = await UserMint.deleteOne({ userId: context.user.id, title: args.title });
            return result ? true : false;
        }
    }
};
