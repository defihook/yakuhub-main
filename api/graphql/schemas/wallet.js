import { gql } from 'apollo-server-express';

export default gql`
    type Wallet {
        id: ID!
        project: String!
        secretKey: String!
        createdAt: String!
        updatedAt: String!
        owner: ID!
    }

    type AdminPubkey {
        pubkey: String!
    }

    extend type Query {
        getWallets(wallet: String!): [Wallet] @isAuthenticated
        getWalletPubkey(project: String!, wallet: String!): AdminPubkey! @isAuthenticated
    }

    extend type Mutation {
        createWallet(project: String!, wallet: String!): Wallet @isAuthenticated
        clickWithdraw(project: String!, method: String!, amount: Int!): String @isAuthenticated
    }
`;
