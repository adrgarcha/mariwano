import { Schema, model } from 'mongoose';

const AnonConfigSchema = new Schema({
   guildId: {
      type: String,
      required: true,
   },
   anonChannelGuild: {
      type: String,
      required: true,
   },
});

export const AnonConfigModel = model('AnonConfig', AnonConfigSchema);
