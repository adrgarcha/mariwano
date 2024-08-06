import { Schema, model } from "mongoose";

const memeSchema = new Schema({
  guildId: {
    type: String,
    required: true,
  },
  rankingChannelId: {
    type: String,
    required: true,
  },
  lastRanking: {
    type: Date,
    default: new Date(),
    required: true,
  },
});
export const MemeConfiguration = model("MemeConfiguration", memeSchema);
