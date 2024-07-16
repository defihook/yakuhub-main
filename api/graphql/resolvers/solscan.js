export default {
    Query: {
        fetchAccount: async (_source, args, { dataSources, user }) => {
            const data = await dataSources.solscanAPI.fetchAccount(args.account);
            return data;
        },
        getAccountTokens: async (_source, args, { dataSources, user }) => {
            const data = await dataSources.solscanAPI.getAccountTokens(args.account);
            return data;
        }
    }
};
