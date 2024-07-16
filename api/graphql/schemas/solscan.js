import { gql } from 'apollo-server-express';

export default gql`
    type TokenAccTx {
        blockTime: Int
        buyInAmt: Int
        mint: String
        txHash: String
    }
    type TokenAmount {
        amount: String
        decimals: Int
        uiAmount: Float
        uiAmountString: String
    }
    type TokenInfo {
        tokenAddress: String
        tokenAmount: TokenAmount
        tokenAccount: String
        tokenName: String
        tokenIcon: String
        rentEpoch: Int
        lamports: Int
        tokenSymbol: String
    }
    extend type Query {
        fetchAccount(account: String!): Anything
        getAccountTokens(account: String!): [TokenInfo]
    }
`;
