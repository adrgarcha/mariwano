const mongoose = require('mongoose');

const notificationConfigSchema = new mongoose.Schema({
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
}, { timestamps: true });

module.exports = mongoose.model('NotificationConfig', notificationConfigSchema);
