import { gql } from 'apollo-server-express';

export default gql`
    type Proposal {
        id: ID!
        author: String!
        title: String!
        body: String
        discussion: String
        state: String!
        choices: [String!]
        postedIn: Space
        forVotes: [String!]
        againstVotes: [String!]
        abstainVotes: [String!]
        endsAt: String!
        createdAt: String!
        updatedAt: String!
    }

    extend type Query {
        proposals(first: Int!, skip: Int!, state: String!, space: String, space_in: [String], author_in: [String]): [Proposal]
            @isAuthenticated
        proposalsBy(author: String!): [Proposal] @isAuthenticated
        proposalsIn(id: ID!): [Proposal] @isAuthenticated
        proposal(id: ID!): Proposal @isAuthenticated
    }

    extend type Mutation {
        createProposal(author: String!, title: String!, body: String, discussion: String, postedIn: ID!, endsAt: String!): Proposal
            @isAuthenticated
        closeProposal(id: ID!): Boolean @isAuthenticated
        deleteProposal(id: ID!): Boolean @isAuthenticated
        voteProposal(id: ID!, type: String!, wallet: String!): Proposal @isAuthenticated
    }
`;
