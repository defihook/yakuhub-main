import { gql } from 'apollo-server-express';

export default gql`
    type Notification {
        id: ID!
        userId: String!
        title: String!
        date: String!
        description: String!
        icon: String!
        status: String!
    }

    extend type Query {
        getNotificationsByUserId: [Notification!]! @isAuthenticated
    }

    extend type Mutation {
        createNotification(title: String!, date: String!, description: String!, icon: String!, status: String!): Notification!
            @isAuthenticated
        updateNotificationStatus(id: String!, status: String!): Boolean! @isAuthenticated
        updateAllNotificationsStatus(status: String!): Boolean! @isAuthenticated
        deleteNotification(id: String!): Boolean! @isAuthenticated
    }
`;
