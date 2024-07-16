import { gql } from 'apollo-server-express';

export default gql`
    extend type Query {
        getNFTsByOwner(wallets: [String]!): JSON @isAuthenticated
    }
`;
