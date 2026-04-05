import { Schema, model } from 'mongoose';

const duelHistorySchema = new Schema({
   guildId: {
      type: String,
      required: true,
   },
   challengerId: {
      type: String,
      required: true,
   },
   opponentId: {
      type: String,
      required: true,
   },
   amount: {
      type: Number,
      required: true,
   },
   winnerId: {
      type: String,
      required: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

duelHistorySchema.index({ guildId: 1, challengerId: 1 });
duelHistorySchema.index({ guildId: 1, opponentId: 1 });

export const DuelHistory = model('DuelHistory', duelHistorySchema);
