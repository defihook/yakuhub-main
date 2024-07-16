export default {
    Query: {
        getStats: async (_source, args, { dataSources, user }) => {
            const data = await dataSources.magicEdenAPI.fetchStats(args.symbol);
            return data;
        },
        getActivities: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getTokenMintActivities(args.mint, args.offset, args.limit);
            return data;
        },
        getCollectionActivities: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getCollectionActivities(args.symbol, args.offset, args.limit);
            return data;
        },
        getTokenByMint: async (_source, { mint }, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getTokenByMint(mint);
            return data;
        },
        getListingByMint: async (_source, { mint }, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getListingByMint(mint);
            return data;
        },
        getListingBySymbol: async (_source, { symbol, offset, limit }, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getListingBySymbol(symbol, offset, limit);
            return data;
        },
        getAllMECollections: async (_source, args, { dataSources }) => {
            console.log('getAllMECollections');
            const { page, limit } = args;
            const data = await dataSources.magicEdenAPI.getAllMECollections(page, limit);
            return data;
        },
        getMETransactionInstructionsForSnipe: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMETransactionInstructionsForSnipe(
                args.buyer,
                args.seller,
                args.auctionHouse,
                args.tokenMint,
                args.tokenAddress,
                args.price,
                args.expiry,
                args.pdaAddress,
                args.sellerReferral,
                args.buyerCreatorRoyaltyPercent
            );
            return data;
        },
        getCollectionStats: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getCollectionStats(args.symbol);
            return data;
        },
        getCollectionsByKeyword: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getCollectionStats(args.keyword);
            return data;
        },
        getStatsBySymbol: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getStatsBySymbol(args.symbol);
            return data;
        },
        getWalletTokens: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getWalletTokens(args.wallet, args.offset, args.limit, args.listedOnly);
            return data;
        },
        getWalletAvatar: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getWalletAvatar(args.wallet);
            return data;
        },
        getWalletActivities: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getWalletActivities(args.wallet, args.offset, args.limit);
            return data;
        },
        getMEEscrowBalance: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMEEscrowBalance(args.wallet);
            return data;
        },
        getMEOfferMade: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMEOfferMade(args.wallet, args.offset, args.limit);
            return data;
        },
        getMEOfferReceived: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMEOfferReceived(args.wallet, args.offset, args.limit);
            return data;
        },
        getMETokenOfferReceived: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMETokenOfferReceived(args.mint, args.offset, args.limit);
            return data;
        }
    },
    Mutation: {
        getMETransactionInstructions: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMETransactionInstructions(args.buyer, args.tokenMint);
            return data;
        },
        getMEDelistTransactionInstructions: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMEDelistTransactionInstructions(args.seller, args.tokenMint);
            return data;
        },
        getMEListTransactionInstructions: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMEListTransactionInstructions(args.seller, args.tokenMint, args.price);
            return data;
        },
        getMEBidTransactionInstructions: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMEBidTransactionInstructions(args.buyer, args.tokenMint, args.price);
            return data;
        },
        getMECancelBidTransactionInstructions: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMECancelBidTransactionInstructions(args.buyer, args.tokenMint, args.price);
            return data;
        },
        getMEAcceptOfferTransactionInstructions: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMEAcceptOfferTransactionInstructions(
                args.buyer,
                args.seller,
                args.tokenMint,
                args.price,
                args.newPrice
            );
            return data;
        },
        getMEChangeBidTransactionInstructions: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMEChangeBidTransactionInstructions(
                args.buyer,
                args.tokenMint,
                args.price,
                args.newPrice
            );
            return data;
        },
        getMEDepositTransactionInstructions: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMEDepositTransactionInstructions(args.buyer, args.amount);
            return data;
        },
        getMEWithdrawTransactionInstructions: async (_source, args, { dataSources }) => {
            const data = await dataSources.magicEdenAPI.getMEWithdrawTransactionInstructions(args.buyer, args.amount);
            return data;
        }
    }
};
