import { Client, EmbedBuilder, Message, TextChannel } from 'discord.js';
import { MemeRanking } from '../../models/MemeRanking';

interface MemeEntry {
   user: string;
   meme: string;
   value: number;
}

export default function (client: Client) {
   const checkRanking = async () => {
      try {
         const memeRankings = await MemeRanking.find();
         for (const memeRanking of memeRankings) {
            const targetGuild = await client.guilds.fetch(memeRanking?.guildId);
            if (!targetGuild) {
               console.error(`No se ha encontrado el servidor de memes para el ranking: ${memeRanking}`);
               return;
            }

            const targetChannel = (await targetGuild.channels.fetch(memeRanking?.rankingChannelId)) as TextChannel;
            if (!targetChannel) {
               console.error(`No se ha encontrado el canal de ranking de memes: ${targetChannel}`);
               return;
            }

            const lastRanking = memeRanking?.lastRanking;
            const mapUserMemes = new Map<string, Map<string, number>>();

            if (lastRanking.getMonth() === 6) {
               const collector = targetChannel.createMessageCollector({
                  filter: (messages: Message) => messages.attachments.size > 0,
                  time: 604800000,
               });

               collector.on('collect', message => {
                  const userResponse = message.url;
                  const userMeme = new Map<string, number>();
                  const collectorReactions = message.createReactionCollector({
                     filter: () => true,
                     time: 604800000,
                  });

                  collectorReactions.on('collect', (reactions, user) => {
                     userMeme.set(userResponse!, reactions.count);
                     if (mapUserMemes.has(user.id)) {
                        mapUserMemes.get(user.id)?.set(userResponse!, reactions.count);
                     } else {
                        mapUserMemes.set(user.id, userMeme);
                     }
                  });
               });

               collector.on('end', () => {
                  let count = 0;
                  mapUserMemes.forEach(userMemes => {
                     count += userMemes.size;
                  });

                  if (count < 3) {
                     targetChannel.send(
                        `# 🏆**LEADERBOARD**🏆` +
                           `\n\n### No han habido los suficientes memes para seleccionar un ganador, por lo tanto nadie recibirá el premio de 10 000 gramos.`
                     );
                     return;
                  }

                  let memesArray: MemeEntry[] = [];
                  mapUserMemes.forEach((userMemes, user) => {
                     userMemes.forEach((value, meme) => {
                        memesArray.push({ user, meme, value });
                     });
                  });

                  memesArray.sort((a, b) => b.value - a.value);
                  const leaderboardEmbed = new EmbedBuilder()
                     .setTitle(` 🏆**LEADERBOARD**🏆`)
                     .setColor(0x45d6fd)
                     .setDescription(
                        `## 🥇TOP 1: <@${memesArray[0].user}> con ${memesArray[0].value} reacciones: \n${memesArray[0].meme}` +
                           `\n### 🥈TOP 2: <@${memesArray[1].user}> con ${memesArray[1].value} reacciones: \n${memesArray[1].meme}` +
                           `\n\n🥉**TOP 3: <@${memesArray[2].user}> con ${memesArray[2].value} reacciones:** \n${memesArray[2].meme}`
                     )
                     .setFooter({
                        text: `Enhorabuena al ganador del top 1 por haber ganado el premio de 10 000 gramos`,
                     });
                  targetChannel.send({ embeds: [leaderboardEmbed] });
                  mapUserMemes.clear();
               });
            }
         }
      } catch (error) {
         console.error(`Hubo un error en el evento de ranking de memes: ${error}`);
      }
   };

   checkRanking();
   setInterval(checkRanking, 604800000);
}
