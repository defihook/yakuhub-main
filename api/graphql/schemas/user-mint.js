import { gql } from 'apollo-server-express';

export default gql`
    type UserMint {
        id: ID!
        userId: String!
        title: String!
        date: String!
        supply: String
        logo: String!
    }

    extend type Query {
        getUserMintsByUserId: [UserMint!]! @isAuthenticated
    }

    extend type Mutation {
        createUserMint(title: String!, date: String!, supply: String!, logo: String!): UserMint! @isAuthenticated
        updateUserMint(previousTitle: String!, title: String!, date: String!, supply: String!, logo: String!): UserMint! @isAuthenticated
        removeUserMint(title: String!): Boolean! @isAuthenticated
    }
`;
