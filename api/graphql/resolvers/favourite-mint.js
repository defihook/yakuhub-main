import { FavouriteMint } from '../../models/models';

export default {
    Query: {
        getFavouriteMintsByUserId: async (root, args, context, info) => {
            const mints = await FavouriteMint.find({ userId: context.user.id });
            return mints;
        }
    },
    Mutation: {
        createFavouriteMint: async (root, args, context, info) => {
            const mint = await new FavouriteMint({
                title: args.title,
                userId: context.user.id
            }).save();
            return mint;
        },
        removeFavouriteMint: async (root, args, context, info) => {
            const result = await FavouriteMint.deleteOne({ userId: context.user.id, title: args.title });
            return !!result;
        }
    }
};
