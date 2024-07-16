import { gql } from 'apollo-server-express';

export default gql`
    type ETHNFTAttributes {
        key: String
        value: String
        tokenCount: Int
        onSaleCount: Int
        floorAskPrice: Float
        topBidValue: Float
    }
    type NFTStat {
        contract: String
        tokenId: String
        name: String
        display_name: String
        description: String
        image: String
        media: String
        kind: String
        isFlagged: Boolean
        owner: String
        price: Float
        marketplace_program_id: String
        attributes: [ETHNFTAttributes]
    }
    type Offers {
        auctionHouse: String
        buyer: String
        expiry: String
        pdaAddress: String
        price: String
        tokenMint: String
        tokenSize: String
        marketplace_name: String
        marketplace_icon: String
    }
    type TxHistory {
        amount: String
        block_timestamp: String
        buyer_address: String
        buyer_referral_address: String
        buyer_referral_fee: String
        escrow_address: String
        fee: String
        marketplace_instance_id: String
        marketplace_program_id: String
        marketplace_icon: String
        metadata: String
        price: Float
        seller_address: String
        seller_referral_address: String
        seller_referral_fee: String
        signature: String
        type: String
    }
    type ETHNFTStats {
        nft_stats: [NFTStat]
        nft_offers: [Offers]
        nft_tx_history: [TxHistory]
    }
    type BidTx {
        data: Anything
        error: String
    }
    input GetNFTCondition {
        projectIds: [String]
        tokenId: String
    }
    extend type Query {
        getNFTStats(condition: GetNFTCondition): ETHNFTStats @isAuthenticated
    }
    extend type Mutation {
        createBidTx(buyerAddress: String!, token: String!, price: Float!): BidTx
    }
`;
