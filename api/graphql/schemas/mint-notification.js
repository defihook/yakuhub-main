import { gql } from 'apollo-server-express';

export default gql`
    type MintNotification {
        id: ID!
        userId: String!
        title: String!
        date: String!
        notified: String
    }

    extend type Query {
        getMintNotificationsByUserId: [MintNotification!]! @isAuthenticated
    }

    extend type Mutation {
        createMintNotification(title: String!, date: String!): MintNotification! @isAuthenticated
        removeMintNotification(title: String!): Boolean! @isAuthenticated
    }
`;
