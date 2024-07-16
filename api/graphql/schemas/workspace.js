import { gql } from "apollo-server-express";

export default gql`
  type WorkspaceUser {
    address: String
    role: String
  }

  input InputWorkspaceUser {
    address: String
    role: String
  }

  type Workspace {
    id: ID!
    owner: String!
    name: String!
    description: String
    image: String
    website: String
    twitter: String
    discord: String
    token: String
    users: [WorkspaceUser]
    balance: Float
    createdAt: String!
    updatedAt: String!
  }

  extend type Query {
    getWorkspacesCount(owner: String!): Int
    getAllWorkspaces(owner: String!): [Workspace]
    getWorkspaceById(id: String!): Workspace
    getWorkspaceByName(owner: String!, name: String!): Workspace
  }

  extend type Mutation {
    createWorkspace(owner: String!, name: String!, description: String, image: String, website: String, twitter: String, discord: String, token: String, users: [InputWorkspaceUser], balance: Float): Workspace
    addUser(id: String!, user: InputWorkspaceUser!): Workspace
    deleteUser(id: String!, address: String!): Workspace
  }
`;
