import { Schema, model } from 'mongoose';

const memeRankingSchema = new Schema({
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
export const MemeRanking = model('MemeRanking', memeRankingSchema);
