import { Schema, model } from 'mongoose';

const AnonChannelConfigSchema = new Schema({
   guildId: {
      type: String,
      required: true,
      unique: true,
   },
   channelId: {
      type: String,
      required: true,
   },
});

export const AnonChannelConfig = model('AnonChannelConfig', AnonChannelConfigSchema);
