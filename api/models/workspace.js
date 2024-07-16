import mongoose from "mongoose";
const { Schema, model } = mongoose;

const workspaceSchema = new Schema(
  {
    owner: String,
    name: {
      type: String,
      unique: true
    },
    description: String,
    image: String,
    website: String,
    twtter: String,
    discord: String,
    token: String,
    users: [
      {
        address: String,
        role: String
      }
    ],
    balance: Number
  },
  {
    timestamps: true
  }
);

const Workspace = model('workspaces', workspaceSchema);

export default Workspace;
