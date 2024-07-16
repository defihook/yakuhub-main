import { gql } from 'apollo-server-express';

export default gql`
    type FavouriteMint {
        id: ID!
        userId: String!
        title: String!
    }

    extend type Query {
        getFavouriteMintsByUserId: [FavouriteMint!]! @isAuthenticated
    }

    extend type Mutation {
        createFavouriteMint(title: String!): FavouriteMint! @isAuthenticated
        removeFavouriteMint(title: String!): Boolean! @isAuthenticated
    }
`;
