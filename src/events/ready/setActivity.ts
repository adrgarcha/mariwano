const { ActivityType } = require('discord.js');

module.exports = (client) => {
    client.user.setActivity({
        name: 'un buen peta',
        type: ActivityType.Playing,
        // La URL solo funciona con el tipo Streaming y puede ser de YouTube o Twitch.
        //url: 'https://youtu.be/ATsJwGuiL8A?si=isRDznHtgLk-kmFW',
    });
}