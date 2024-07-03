import { Schema, model } from 'mongoose';

const guildConfigurationSchema = new Schema({
   guildId: {
      type: String,
      required: true,
   },
   suggestionChannelIds: {
      type: [String],
      default: [],
   },
   reportChannelIds: {
      type: [String],
      default: [],
   },
   welcomeChannelIds: {
      type: [String],
      default: [],
   },
});

export const GuildConfiguration = model('GuildConfiguration', guildConfigurationSchema);
