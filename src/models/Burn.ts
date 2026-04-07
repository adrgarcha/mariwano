import { Schema, model } from 'mongoose';

const burnSchema = new Schema({
   guildId: {
      type: String,
      required: true,
   },
   userId: {
      type: String,
      required: true,
   },
   amount: {
      type: Number,
      required: true,
   },
   weekId: {
      type: String,
      required: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

burnSchema.index({ guildId: 1, weekId: 1 });
burnSchema.index({ guildId: 1, userId: 1, weekId: 1 });

export const Burn = model('Burn', burnSchema);
