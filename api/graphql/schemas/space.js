import { gql } from 'apollo-server-express';

export default gql`
    type Space {
        id: ID!
        owner: String!
        members: [String!]
        proposals: [Proposal]
        creatorWallet: String!
        name: String!
        description: String!
        symbol: String!
        avatar: String!
        discord: String
        twitter: String
        website: String
        isPartnered: Boolean
        createdAt: String!
        updatedAt: String!
    }

    extend type Query {
        spaces: [Space]! @isAuthenticated
        space(symbol: String!): Space @isAuthenticated
    }

    extend type Mutation {
        addSpace(owner: String!, name: String!, symbol: String!, avatar: String!, discord: String, twitter: String, website: String): Space
            @isAuthenticated
        addMember(_id: ID!, member: String!): Space @isAuthenticated
    }
`;
