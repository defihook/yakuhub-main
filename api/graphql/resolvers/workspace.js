import { Workspace } from '../../models/models';

export default {
  Query: {
    getWorkspacesCount: async (root, args, context, info) => {
      const count = await Workspace.countDocuments({ owner: args.owner });
      return count;
    },
    getAllWorkspaces: async (root, args, context, info) => {
      const workspaces = await Workspace.find({ owner: args.owner });
      return workspaces;
    },
    getWorkspaceById: async (root, args, context, info) => {
      const workspace = await Workspace.findById(args.id);
      return workspace;
    },
    getWorkspaceByName: async (root, args) => {
      const workspace = await Workspace.findOne({ owner: args.owner, name: args.name });
      return workspace;
    }
  },
  Mutation: {
    createWorkspace: async (root, args) => {
      const workspace = await Workspace.create(args);
      return workspace;
    },
    addUser: async (root, args) => {
      const { users } = await Workspace.findById(args.id);
      const workspace = await Workspace.findOneAndUpdate({ id: args.id }, { users: [...users, args.user] }, { returnDocument: 'after' });
      return workspace;
    },
    deleteUser: async (root, args) => {
      const { users } = await Workspace.findById(args.id);
      const temp = users.filter((el) => el.address !== args.address);
      const workspace = await Workspace.findOneAndUpdate({ id: args.id }, { users: temp }, { returnDocument: 'after' });
      return workspace;
    }
  }
};
