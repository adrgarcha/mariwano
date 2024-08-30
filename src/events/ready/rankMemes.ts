import { Client, EmbedBuilder, Message, TextChannel, ChatInputCommandInteraction } from 'discord.js';
import { MemeRanking } from '../../models/MemeRanking';
import { isDateAfterDays, isDateBeforeDays } from '../../utils/date';
import { User } from '../../models/User';

const rankingInterval = 7; // 7 days

export default function (client: Client) {
   const checkRanking = async () => {
      try {
         const memeRankings = await MemeRanking.find();
         for (const memeRanking of memeRankings) {
            const targetGuild = await client.guilds.fetch(memeRanking?.guildId);
            if (!targetGuild) {
               console.error(`No se ha encontrado el servidor de memes para el ranking: ${memeRanking}`);
               continue;
            }

            const targetChannel = (await targetGuild.channels.fetch(memeRanking?.rankingChannelId)) as TextChannel;
            if (!targetChannel) {
               console.error(`No se ha encontrado el canal de ranking de memes: ${targetChannel}`);
               continue;
            }

            if (isDateAfterDays(memeRanking.lastRanking, rankingInterval)) {
               await collectMessages(targetChannel);
               await memeRanking.updateOne({ lastRanking: new Date() });
            }
         }
      } catch (error) {
         console.error(`Hubo un error en el evento de ranking de memes: ${error}`);
      }
   };

   checkRanking();
   setInterval(checkRanking, 30000);
}

async function collectMessages(targetChannel: TextChannel) {
   const memeMessages = new Array<Message>();
   const leaderboardEmbed = new EmbedBuilder().setTitle('🏆 **LEADERBOARD** 🏆').setColor(0x45d6fd);

   try {
      const messages = await targetChannel.messages.fetch();
      messages
         .filter(message => !message.author.bot && message.attachments.size > 0 && isDateBeforeDays(message.createdAt, rankingInterval))
         .forEach(message => memeMessages.push(message));
   } catch (error) {
      console.error(`Hubo un error al recopilar los mensajes de memes: ${error}`);
      return;
   }

   if (memeMessages.length < 3) {
      leaderboardEmbed.setDescription('No se han enviado suficientes memes, nadie recibirá el premio de 10.000 gramos.');
      targetChannel.send({ embeds: [leaderboardEmbed] });
      return;
   }

   memeMessages.sort((a, b) => b.reactions.cache.size - a.reactions.cache.size);
   const firstWinner = memeMessages[0];
   const secondWinner = memeMessages[1];
   const thirdWinner = memeMessages[2];

   leaderboardEmbed
      .setDescription(
         `🥇TOP 1: ${firstWinner.author} con ${firstWinner.reactions.cache.size} reacciones: ${firstWinner.url}` +
            `\n🥈TOP 2: ${secondWinner.author} con ${secondWinner.reactions.cache.size} reacciones: ${secondWinner.url}` +
            `\n🥉TOP 3: ${thirdWinner.author} con ${thirdWinner.reactions.cache.size} reacciones: ${thirdWinner.url}`
      )
      .setFooter({
         text: `Enhorabuena al ganador del top 1 por haber ganado el premio de ${
            firstWinner.author == secondWinner.author && secondWinner.author == thirdWinner.author ? '5.000' : '10.000'
         } gramos`,
      });

   let queryFirstWinner = {
      userId: firstWinner.author.id,
      guildId: targetChannel.id,
   };

   let firstWinnerUser = await User.findOne(queryFirstWinner);

   if (firstWinnerUser) {
      if (firstWinner.author == secondWinner.author && secondWinner.author == thirdWinner.author) {
         firstWinnerUser.balance += 5000;
      } else {
         firstWinnerUser.balance += 10000;
      }
      firstWinnerUser.save();
   } else {
      firstWinnerUser = new User({
         ...queryFirstWinner,
      });
      targetChannel.send(
         'No hay ningún usuario registrado en la base de datos como ' + firstWinner.author + '. Se procederá a no ingresar ninguna cantidad.'
      );
   }

   targetChannel.send({ embeds: [leaderboardEmbed] });
}
