import mongoose from 'mongoose';

const { Schema, model } = mongoose;
const leaderboardSchema = new Schema(
    {
        type: { type: String },
        topVolMovers: { type: Object },
        topSales: { type: Object },
        topFloorMovers: { type: Object },
        stats: {
            type: Object
        }
    },
    {
        timestamps: true
    }
);

const Leaderboard = model('Leaderboard', leaderboardSchema);

export default Leaderboard;
