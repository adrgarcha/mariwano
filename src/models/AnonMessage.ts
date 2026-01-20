import { Schema, model } from 'mongoose';

const AnonMessage = new Schema({
   guildId: {
      type: String,
      required: true,
   },
   anonChannelGuild: {
      type: String,
      required: true,
   },
   content: {
      type: String,
      required: true,
   },
   date: {
      type: Date,
      required: true,
   },
   published: {
      type: Boolean,
      default: false,
   },
});

export const AnonMessageModel = model('AnonMessage', AnonMessage);
