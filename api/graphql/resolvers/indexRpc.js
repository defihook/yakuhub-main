import GraphQLJSON from 'graphql-type-json';

export default {
    JSON: GraphQLJSON,
    Query: {
        getNFTsByOwner: async (_source, _args, { dataSources }) => {
            const data = await dataSources.indexRpcAPI.getNFTsByOwner(_args.wallets);
            return data.result;
        }
    }
};
