import { Schema, model } from 'mongoose';

const burnSettingsSchema = new Schema({
   guildId: {
      type: String,
      required: true,
      unique: true,
   },
   channelId: {
      type: String,
      required: true,
   },
   roleId: {
      type: String,
      required: true,
   },
   currentHolderId: {
      type: String,
      default: '',
   },
});

export const BurnSettings = model('BurnSettings', burnSettingsSchema);
