import { Schema, model } from 'mongoose';

const guildConfigurationSchema = new Schema({
   guildId: {
      type: String,
      required: true,
   },
   suggestionChannelId: {
      type: String,
      default: null,
   },
   reportChannelId: {
      type: String,
      default: null,
   },
   welcomeChannelId: {
      type: String,
      default: null,
   },
});

export const GuildConfiguration = model('GuildConfiguration', guildConfigurationSchema);
