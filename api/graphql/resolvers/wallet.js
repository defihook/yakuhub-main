export default {
    Query: {
        // TODO: projection, pagination, sanitization
        // need to return only publicKey
        getWallets: async (root, args, context, info) => {
            const { dataSources } = context;
            const data = await dataSources.managementAPI.getWallets(context, args);
            return data;
        },
        getWalletPubkey: async (root, args, context, info) => {
            const { dataSources } = context;
            const data = await dataSources.managementAPI.getWalletPubkey(context, args);
            return data;
        }
    },
    Mutation: {
        createWallet: async (root, args, context, info) => {
            const { dataSources } = context;
            const data = await dataSources.managementAPI.createWallet(context, args);
            return data;
        },
        clickWithdraw: async (root, args, context, info) => {
            const { dataSources } = context;
            const data = await dataSources.managementAPI.clickWithdraw(context, args);
            return data;
        }
    }
};
