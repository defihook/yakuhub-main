import GraphQLJSON from 'graphql-type-json';

export default {
    JSON: GraphQLJSON,
    Query: {
        getUserProfile: async (_source, _args, { dataSources }) => {
            const data = await dataSources.coralAPI.getUserProfile(_args.pubkey);
            return data;
        }
    }
};
