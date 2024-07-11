import { Schema, model } from 'mongoose';

const notificationConfigSchema = new Schema(
   {
      guildId: {
         type: String,
         required: true,
      },
      notificationChannelId: {
         type: String,
         required: true,
      },
      youtubeChannelId: {
         type: String,
         required: true,
      },
      customMessage: {
         type: String,
         required: false,
      },
      lastCheckedVideo: {
         type: {
            videoId: {
               type: String,
               required: true,
            },
            publishedDate: {
               type: Date,
               required: true,
            },
         },
         required: false,
      },
   },
   { timestamps: true }
);

export const NotificationConfig = model('NotificationConfig', notificationConfigSchema);
