export default {
    Query: {
        getNFTStats: async (_source, args, { dataSources }) => {
            const data = await dataSources.gemsAPI.getNFTStats(args.condition);
            return data;
        }
    },
    Mutation: {
        createBidTx: async (_source, args, { dataSources }) => {
            const data = await dataSources.gemsAPI.createBidTx(args.buyerAddress, args.token, args.price);
            return data;
        }
    }
};
