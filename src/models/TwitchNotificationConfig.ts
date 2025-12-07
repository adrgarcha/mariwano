import { Schema, model } from 'mongoose';

const twitchNotificationConfigSchema = new Schema(
   {
      guildId: {
         type: String,
         required: true,
      },
      notificationChannelId: {
         type: String,
         required: true,
      },
      twitchChannelName: {
         type: String,
         required: true,
      },
      customMessage: {
         type: String,
         required: false,
      },
      lastStreamId: {
         type: String,
         required: false,
      },
      isLive: {
         type: Boolean,
         default: false,
      },
   },
   { timestamps: true }
);

export const TwitchNotificationConfig = model('TwitchNotificationConfig', twitchNotificationConfigSchema);
