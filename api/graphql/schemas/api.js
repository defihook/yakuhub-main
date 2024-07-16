import { gql } from 'apollo-server-express';

export default gql`
    type API {
        symbol: String
        floorPrice: Float
        listedCount: Float
        avgPrice24hr: Float
        volumeAll: Float
    }

    type MENFTActivity {
        signature: String
        type: String
        source: String
        tokenMint: String
        collectionSymbol: String
        slot: Int
        blockTime: Int
        buyerReferral: String
        seller: String
        sellerReferral: String
        price: Float
    }

    type MERarityFlag {
        showMoonrank: Boolean
        showHowrare: Boolean
        showMagicEden: Boolean
    }

    type MRRanking {
        mint: String
        name: String
        image: String
        rank: Int
    }

    type Collection {
        symbol: String
        blockchain: String
        candyMachineIds: [String]
        categories: [String]
        createdAt: String
        description: String
        discord: String
        enabledAttributesFilters: Boolean
        image: String
        isAutolist: Boolean
        name: String
        rarity: MERarityFlag
        totalItems: Int
        twitter: String
        website: String
        isDerivative: Boolean
        isFlagged: Boolean
        watchlistCount: Int
        updatedAt: String
        floorPrice: Float
        listedCount: Int
        volumeAll: Float
        avgPrice24hr: Float
        moonRankSymbol: String
        ranking: [MRRanking]
    }

    type Buffer {
        type: String
        data: [Int]
    }

    type Transaction {
        tx: Buffer
        txSigned: Buffer
    }

    type Listing {
        pdaAddress: String
        auctionHouse: String
        tokenAddress: String
        tokenMint: String
        seller: String
        tokenSize: Int
        price: Float
        rarity: Anything
    }

    type NFTAttribute {
        trait_type: String
        value: String
    }

    type TokenMeta {
        mintAddress: String
        owner: String
        supply: Int
        collection: String
        name: String
        updateAuthority: String
        primarySaleHappened: Int
        sellerFeeBasisPoints: Int
        image: String
        animationUrl: String
        externalUrl: String
        attributes: [NFTAttribute]
        properties: Anything
    }

    type QueryParams {
        buyer: String
        seller: String
        auctionHouse: String
        tokenMint: String
        tokenAddress: String
        price: String
        expiry: String
        pdaAddress: String
        sellerReferral: String
    }
    type WalletToken {
        mintAddress: String
        owner: String
        supply: Int
        delegate: String
        collection: String
        collectionName: String
        name: String
        updateAuthority: String
        primarySaleHappened: Boolean
        sellerFeeBasisPoints: Int
        image: String
        externalUrl: String
        attributes: [NFTAttribute]
        properties: Anything
        listStatus: String
    }

    type MEWallet {
        displayName: String
        avatar: String
    }

    type WalletActivity {
        signature: String
        type: String
        source: String
        tokenMint: String
        collection: String
        slot: Int
        blockTime: Int
        buyer: String
        buyerReferral: String
        seller: String
        sellerReferral: String
        price: Float
    }

    type EscrowWallet {
        buyerEscrow: String
        balance: Float
    }

    type Offer {
        pdaAddress: String
        tokenMint: String
        auctionHouse: String
        buyer: String
        price: Float
        tokenSize: Int
        expiry: Int
    }

    type MECollectionsType {
        data: [Collection]
        page: Int
        totalPage: Int
    }

    extend type Query {
        getStats(symbol: String!): [API]
        getActivities(mint: String!, offset: Int, limit: Int): [MENFTActivity] @isAuthenticated
        getAllMECollections(page: Int, limit: Int): MECollectionsType
        getCollectionActivities(symbol: String!, offset: Int, limit: Int): [MENFTActivity] @isAuthenticated
        getListingByMint(mint: String!): [Listing] @isAuthenticated
        getListingBySymbol(symbol: String!, offset: Int, limit: Int): [Listing] @isAuthenticated
        getTokenByMint(mint: String!): TokenMeta @isAuthenticated
        getCollectionStats(symbol: String!): API @isAuthenticated
        getCollectionsByKeyword(keyword: String!): [Collection] @isAuthenticated
        getStatsBySymbol(symbol: String!): Collection @isAuthenticated
        getMETransactionInstructionsForSnipe(
            buyer: String!
            seller: String!
            auctionHouse: String!
            tokenMint: String!
            tokenAddress: String!
            price: String!
            expiry: String!
            pdaAddress: String!
            sellerReferral: String
            buyerCreatorRoyaltyPercent: String
        ): Transaction @isAuthenticated
        getWalletTokens(wallet: String!, offset: Int, limit: Int, listedOnly: Boolean): [WalletToken] @isAuthenticated
        getWalletAvatar(wallet: String!): MEWallet @isAuthenticated
        getWalletActivities(wallet: String!, offset: Int, limit: Int): [WalletActivity] @isAuthenticated
        getMEEscrowBalance(wallet: String!): EscrowWallet @isAuthenticated
        getMEOfferMade(wallet: String!, offset: Int, limit: Int): [Offer] @isAuthenticated
        getMEOfferReceived(wallet: String!, offset: Int, limit: Int): [Offer] @isAuthenticated
        getMETokenOfferReceived(mint: String!, offset: Int, limit: Int): [Offer] @isAuthenticated
    }

    extend type Mutation {
        getMETransactionInstructions(buyer: String!, tokenMint: String!): Transaction @isAuthenticated
        getMEDelistTransactionInstructions(seller: String!, tokenMint: String!): Transaction @isAuthenticated
        getMEListTransactionInstructions(seller: String!, tokenMint: String!, price: Float!): Transaction @isAuthenticated
        getMEBidTransactionInstructions(buyer: String!, tokenMint: String!, price: Float!): Transaction @isAuthenticated
        getMECancelBidTransactionInstructions(buyer: String!, tokenMint: String!, price: Float!): Transaction @isAuthenticated
        getMEAcceptOfferTransactionInstructions(
            buyer: String!
            seller: String!
            tokenMint: String!
            price: Float!
            newPrice: Float!
        ): Transaction @isAuthenticated
        getMEChangeBidTransactionInstructions(buyer: String!, tokenMint: String!, price: Float!, newPrice: Float!): Transaction
            @isAuthenticated
        getMEDepositTransactionInstructions(buyer: String!, amount: Float!): Transaction @isAuthenticated
        getMEWithdrawTransactionInstructions(buyer: String!, amount: Float!): Transaction @isAuthenticated
    }
`;
