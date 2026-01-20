import { Schema, model } from 'mongoose';

const AnonMessages = new Schema({
   guildId: {
      type: String,
      required: true,
   },
   anonChannelGuild: {
      type: String,
      required: true,
   },
});

export const AnonMessagesModel = model('AnonMessages', AnonMessages);
