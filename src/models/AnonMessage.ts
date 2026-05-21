import { Schema, model } from 'mongoose';

const AnonMessageSchema = new Schema({
   authorId: {
      type: String,
      required: true,
   },
   guildId: {
      type: String,
      required: true,
   },
   content: {
      type: String,
      required: true,
   },
   createdAt: {
      type: Date,
      default: Date.now,
   },
});

export const AnonMessage = model('AnonMessage', AnonMessageSchema);
