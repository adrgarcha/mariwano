const { Client, GatewayIntentBits } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const { Readable } = require('stream');


const VOICE_CHANNEL_ID = '1160574192262062113';
module.exports = {

    run: async ({ interaction }) => {
        try{
        const voiceChannel = interaction.guild.channels.cache.get(VOICE_CHANNEL_ID);
        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          });
          const stream = new Readable({
            read() {},
          });
          const resource = createAudioResource(stream);
          const player = createAudioPlayer();
          connection.subscribe(player);
          player.play(resource);
          const fs = require('fs');
          const mp3Stream = fs.createReadStream("./arabfunnymusic.mp3");
          mp3Stream.on('data', (chunk) => {
            stream.push(chunk);
          });
      
          mp3Stream.on('end', () => {
            stream.push(null); // Fin del flujo
          });
        }catch (e) {
            console.error(e);
        }
        await interaction.reply("Reproduciendo música arabfunny...");
    }, data: {
        name: "arabfunnymusic", 
        description: "⭕🔊HARAM ALERT🔊⭕",
    }
    
}