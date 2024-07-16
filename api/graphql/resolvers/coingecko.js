export default {
    Query: {
        ping: async (_source, args, { dataSources }) => {
            const data = await dataSources.coinGeckoAPI.ping();
            return data;
        },
        global: async (_source, args, { dataSources }) => {
            const data = await dataSources.coinGeckoAPI.global();
            return data;
        },
        listCoins: async (_source, args, { dataSources }) => {
            const data = await dataSources.coinGeckoAPI.listCoins(args.params);
            return data;
        },
        marketsCoins: async (_source, args, { dataSources }) => {
            const data = await dataSources.coinGeckoAPI.marketsCoins(args.params);
            return data;
        },
        fetchCoin: async (_source, args, { dataSources }) => {
            const data = await dataSources.coinGeckoAPI.fetchCoin(args.coinId, args.params);
            return data;
        },
        fetchTickers: async (_source, args, { dataSources }) => {
            const data = await dataSources.coinGeckoAPI.fetchTickers(args.coinId, args.params);
            return data;
        },
        fetchHistory: async (_source, args, { dataSources }) => {
            const data = await dataSources.coinGeckoAPI.fetchHistory(args.coinId, args.params);
            return data;
        },
        fetchMarketChart: async (_source, args, { dataSources }) => {
            const data = await dataSources.coinGeckoAPI.fetchMarketChart(args.coinId, args.params);
            return data;
        },
        simplePrice: async (_source, args, { dataSources }) => {
            const data = await dataSources.coinGeckoAPI.simplePrice(args.params);
            return data;
        }
    }
};
