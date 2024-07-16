import { gql } from 'apollo-server-express';

export default gql`
    type MintColor {
        id: ID!
        userId: String!
        title: String!
        color: String!
    }

    extend type Query {
        getMintColorsByUserId: [MintColor!]! @isAuthenticated
    }

    extend type Mutation {
        createMintColor(title: String!, color: String!): MintColor! @isAuthenticated
        removeMintColor(title: String!): Boolean! @isAuthenticated
    }
`;
