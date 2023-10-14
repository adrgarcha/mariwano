const { Client, Intents, GatewayIntentBits, ChatInputCommandInteraction, ApplicationCommandOptionType } = require("discord.js");
const ytdl = require('ytdl-core');
const { VoiceConnectionStatus } = require('@discordjs/voice');
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require('@discordjs/voice');
const ffmpeg = require('ffmpeg-static');



const VOICE_CHANNEL_ID = '1160574192262062113';

module.exports = {
    /**
     * 
     * @param {Object} param0 
     * @param {ChatInputCommandInteraction} param0.interaction
     * @param {Client} param0.client
     */
    run: async ({ interaction, client }) => {
        const urlyt = interaction.options.get("url_youtube")?.value;
        const voiceChannel = interaction.guild.channels.cache.get(VOICE_CHANNEL_ID);
        try{
            const connection = joinVoiceChannel({
                channelId: VOICE_CHANNEL_ID,
                guildId: interaction.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
              });
      
              const stream = ytdl(urlyt, { filter: 'audioonly' });
              const resource = createAudioResource(stream);
              const player = createAudioPlayer();
              connection.subscribe(player);
              player.play(resource);
              console.log(VoiceConnectionStatus.Connecting);
        
              player.on('error', (error) => {
                console.error(error);
              });
            } catch(e){
                console.error(e);
            }
            interaction.reply(`Reproduciendo`);
    },data: {
        name: "playmusic",
        description: "poner musica de youtube",
        options: [
            {
                name: "url_youtube",
                description: "url de youtube",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    }
    
}