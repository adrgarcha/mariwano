import { Schema, model } from 'mongoose';
import { User } from './User';

const donationSchema = new Schema({
   guildId: {
      type: String,
      required: true,
   },
   fromUserId: {
      type: String,
      required: true,
   },
   toUserId: {
      type: String,
      required: true,
   },
   amount: {
      type: Number,
      required: true,
   },
   message: {
      type: String,
      default: '',
      maxlength: 100,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

donationSchema.index({ guildId: 1, fromUserId: 1 });
donationSchema.index({ guildId: 1, toUserId: 1 });
donationSchema.index({ guildId: 1, createdAt: -1 });

donationSchema.post('save', async function (doc) {
   const { guildId, fromUserId, toUserId, amount } = doc;

   await Promise.all([
      User.updateOne({ userId: fromUserId, guildId }, { $inc: { totalDonated: amount, donationCount: 1 } }),
      User.updateOne({ userId: toUserId, guildId }, { $inc: { totalReceived: amount } }),
   ]);
});

export const Donation = model('Donation', donationSchema);
