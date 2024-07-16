import GraphQLJSON from 'graphql-type-json';
import Metadatas from '../../models/metadata';

export default {
    JSON: GraphQLJSON,
    Query: {
        getMetadata: async (_source, args, context, info) => {
            const data = await Metadatas.find({ mint: args.mint });
            return data;
        },
        getMetadatas: async (_source, args, context, info) => {
            const { mints } = args;
            const data = await Metadatas.find(
                mints
                    ? {
                          mint: {
                              $in: mints
                          }
                      }
                    : {}
            );
            return data;
        },
        fetch: async (_source, args, { dataSources }, info) => {
            const { mint } = args;
            const data = await dataSources.nftAPI.fetch(mint);
            return data;
        },
        getWallet: async (_source, args, { dataSources }, info) => {
            const { wallet } = args;
            const data = await dataSources.nftAPI.getWallet(wallet);
            return data;
        }
    },
    Mutation: {
        addMetadata: async (_source, args, { dataSources }, info) => {
            const found = await Metadatas.findOne({ mint: args.mint });
            if (!found) {
                const data = await Metadatas.create(args);
                return data;
            }
            await Metadatas.updateOne({ mint: args.mint }, args, { new: true });
            return found;
        },
        addMetadatas: async (_source, args, context, info) => {
            try {
                await Metadatas.insertMany(args.mints, { order: false });
            } catch (error) {
                console.error('[Expected] Insert with error');
            }
            return true;
        }
    }
};
