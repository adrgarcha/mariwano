import { randomUUID } from 'crypto';
import { Schema, model } from 'mongoose';

const auctionSchema = new Schema(
   {
      auctionId: {
         type: String,
         default: randomUUID,
      },
      authorId: {
         type: String,
         required: true,
      },
      guildId: {
         type: String,
         required: true,
      },
      messageId: {
         type: String,
         required: true,
         unique: true,
      },
      content: {
         type: String,
         required: true,
      },
      status: {
         type: String,
         default: 'pending',
      },
   },
   { timestamps: true }
);

export const Auction = model('Auction', auctionSchema);
