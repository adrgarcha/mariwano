import {
  Client,
  Collector,
  Message,
  MessageCollector,
  TextChannel,
  EmbedBuilder,
} from "discord.js";
import { MemeConfiguration } from "../../models/MemeRanking";

export default function (client: Client) {
  const checkRanking = async () => {
    try {
      const memeConfig = await MemeConfiguration.findOne();

      const targetGuild = await client.guilds.fetch(memeConfig!.guildId);

      if (!targetGuild) {
        console.error("No guild");
        return;
      }
      /**
       * MediaChannel y TextChannel son distintos: el MediaChannel es como un foro (no es un canal de sólo
       * contenido multimedia) donde cada post es un hilo mientras que el TextChannel es un chat
       */
      const targetChannel = (await targetGuild.channels.fetch(
        memeConfig!.rankingChannelId
      )) as TextChannel;

      if (!targetChannel) {
        console.error("targetChannel: " + targetChannel);
        return;
      }
      const lastRanking = memeConfig!.lastRanking;
      var collector: MessageCollector;
      var mapUserMemes = new Map<string, Map<string, number>>();
      if (lastRanking.getMonth() === 6) {
        const filter = (messages: Message) => {
          return messages.attachments.size > 0;
        };
        /*const message = targetChannel.awaitMessages().catch((message) => {message.reactions = [];});*/
        collector = targetChannel.createMessageCollector({
          filter,
          time: 604800000,
        });
        collector.on("collect", (message) => {
          const respuestaUsuario = message.url;

          const userMeme = new Map<string, number>();
          const filter = () => true;
          var collectorReactions = message.createReactionCollector({
            filter,
            time: 604800000,
          });
          collectorReactions.on("collect", (reactions, user) => {
            userMeme.set(respuestaUsuario!, reactions.count);
            if (mapUserMemes.has(user.id)) {
              mapUserMemes
                .get(user.id)
                ?.set(respuestaUsuario!, reactions.count);
            } else {
              mapUserMemes.set(user.id, userMeme);
            }
            console.log(mapUserMemes);
          });
        });

        collector.on("end", (collected, reason) => {
          let count = 0;
          mapUserMemes.forEach((userMemes) => {
            count += userMemes.size;
          });
          if (count < 3) {
            targetChannel.send(
              `# 🏆**LEADERBOARD**🏆` +
                `\n\n### No han habido los suficientes memes para seleccionar un ganador, por lo tanto nadie recibirá el premio de 10 000 gramos.`
            );
            return;
          }
          interface MemeEntry {
            user: string;
            meme: string;
            value: number;
          }

          let memesArray: MemeEntry[] = [];
          mapUserMemes.forEach((userMemes, user) => {
            userMemes.forEach((value, meme) => {
              memesArray.push({ user, meme, value });
            });
          });

          memesArray.sort((a, b) => b.value - a.value);
          let leaderboardEmbed = new EmbedBuilder()
            .setTitle(` 🏆**LEADERBOARD**🏆`)
            .setColor(0x45d6fd)
            .setFooter({ text: "A" });
          leaderboardEmbed.setDescription(
            `## 🥇TOP 1: <@${memesArray[0].user}> con ${memesArray[0].value} reacciones: \n${memesArray[0].meme}` +
              `\n### 🥈TOP 2: <@${memesArray[1].user}> con ${memesArray[1].value} reacciones: \n${memesArray[1].meme}` +
              `\n\n🥉**TOP 3: <@${memesArray[2].user}> con ${memesArray[2].value} reacciones:** \n${memesArray[2].meme}`
          );

          leaderboardEmbed.setFooter({
            text: `Enhorabuena al ganador del top 1 por haber ganado el premio de 10 000 gramos`,
          });
          targetChannel.send({ embeds: [leaderboardEmbed] });
          mapUserMemes.clear();
        });
      }
    } catch (error) {
      console.error(`Hubo un error en el evento de ranking: ${error}`);
    }
  };

  checkRanking();
  setInterval(checkRanking, 604800000);
}
