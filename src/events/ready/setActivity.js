const { ActivityType } = require('discord.js');

module.exports = (client) => {
    const strArr = ["peta", "matujo", "hanselygretel", "canuto", "hoogie doogie", "clencho", "petoncio", "leño", "troncho"];
    client.user.setActivity({
        name: `un buen ${strArr[Math.floor(Math.random() * strArr.length)]}`,
        type: ActivityType.Playing,
        // La URL solo funciona con el tipo Streaming y puede ser de YouTube o Twitch.
        //url: 'https://youtu.be/ATsJwGuiL8A?si=isRDznHtgLk-kmFW',
    });
}