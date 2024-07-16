export default {
    Query: {
        getClaimers: async (root, args, context, info) => {
            const { dataSources } = context;
            const data = await dataSources.managementAPI.getClaimers(context, args);
            return data;
        },
        getClaimer: async (root, args, context, info) => {
            const { dataSources } = context;
            const data = await dataSources.managementAPI.getClaimer(context, args);
            return data;
        },
        getEmployees: async (root, args, context, info) => {
            const { dataSources } = context;
            const data = await dataSources.managementAPI.getEmployees(context, args);
            return data;
        }
    },
    Mutation: {
        createClaimer: async (root, args, context, info) => {
            const { dataSources } = context;
            const data = await dataSources.managementAPI.createClaimer(context, args);
            return data;
        },

        deleteClaimer: async (root, args, context, info) => {
            const { dataSources } = context;
            const data = await dataSources.managementAPI.deleteClaimer(context, args);
            return data;
        },

        clickClaim: async (root, args, context, info) => {
            const { dataSources } = context;
            const data = await dataSources.managementAPI.clickClaim(context, args);
            return data;
        }
    }
};
