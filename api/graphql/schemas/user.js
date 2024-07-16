import { gql } from 'apollo-server-express';

export default gql`
    type User {
        id: ID!
        wallet: String
        ethAddress: String
        vanity: String
        registered: Boolean
        isStaff: Boolean
        createdAt: String!
        updatedAt: String!
        discord: DiscordUserProfile
        twitter: Anything
        avatar: String
        banner: String
        bio: String
        location: String
    }

    type DiscordUserProfile {
        id: String
        name: String
        discriminator: String
        avatar: String
        membership: Anything
    }

    type Token {
        token: String
        registered: Boolean
        user: User
    }

    type SubWallet {
        user: String
        wallet: String
    }

    type FollowResp {
        result: String
    }

    type Stats {
        total: Int
        activeCount: Int
        twitterCount: Int
        discordCount: Int
        ethCount: Int
    }

    extend type Query {
        user(wallet: String, ethAddress: String): User @isAuthenticated
        users(wallets: [String]): [User!]! @isAuthenticated
        getAllLinkedWallet(user: String!): [SubWallet] @isAuthenticated
        isFollowed(user: String!, wallet: String!): Boolean @isAuthenticated
        getUserFollowings(wallet: String!): [SubWallet] @isAuthenticated
        getUserFollowers(wallet: String!): [User] @isAuthenticated
        getUserByTwitterHandle(twitterHandle: String!): User @isAuthenticated
        getSiteStats: Stats
    }

    extend type Mutation {
        login(wallet: String, ethAddress: String): Token
        signup(wallet: String, vanity: String, ethAddress: String): Token
        discordAuth(address: String!, code: String!, redirectUri: String): User @isAuthenticated
        getDiscordConnectURL(redirectUri: String): String @isAuthenticated
        linkWallet(user: String!, wallet: String!): SubWallet @isAuthenticated
        unlinkWallet(user: String!, wallet: String!): SubWallet @isAuthenticated
        followWallet(user: String!, wallet: String!): FollowResp @isAuthenticated
        linkTwitter(address: String!, code: String!, redirectUri: String): User @isAuthenticated
        getTwitterAuth(address: String!, redirectUri: String): String @isAuthenticated
        setAvatar(imageUrl: String!): Boolean @isAuthenticated
        setBanner(imageUrl: String!): Boolean @isAuthenticated
        updateProfile(profile: Anything): Boolean @isAuthenticated
    }
`;
