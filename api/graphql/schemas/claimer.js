import { gql } from 'apollo-server-express';

export default gql`
    type TransactionHash {
        date: String
        txHash: String
    }

    type Claimer {
        id: ID!
        project: String!
        employer: String!
        name: String!
        method: String!
        amount: String!
        period: String!
        transactionHash: [TransactionHash]
        time: String!
        wallet: String!
        createdAt: String!
        updatedAt: String!
        user: Anything
    }

    extend type Query {
        getClaimers(wallet: String): [Claimer] @isAuthenticated
        getClaimer(wallet: String!): [Claimer] @isAuthenticated
        getEmployees(project: String!, employer: String!): [Claimer] @isAuthenticated
    }

    extend type Mutation {
        createClaimer(
            project: String!
            name: String!
            method: String!
            amount: String!
            wallet: String!
            time: String!
            period: String!
            employer: String!
        ): Claimer @isAuthenticated
        deleteClaimer(project: String!, name: String!, wallet: String!, employer: String!): String @isAuthenticated
        clickClaim(project: String!, wallet: String!, method: String!, employer: String!): [Claimer] @isAuthenticated
    }
`;
