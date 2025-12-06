import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { PatchNotesConfig } from '../../models/PatchNotesConfig';
import { fetchLatestRelease } from '../../utils/github';

export default function (client: Client) {
   const checkGitHubReleases = async () => {
      try {
         const patchNotesConfigs = await PatchNotesConfig.find();

         if (!patchNotesConfigs.length) return;

         const latestRelease = await fetchLatestRelease();

         if (!latestRelease) return;

         for (const config of patchNotesConfigs) {
            const lastReleaseId = config.lastReleaseId;

            if (lastReleaseId && String(latestRelease.id) === lastReleaseId) continue;

            const targetGuild = await client.guilds.fetch(config.guildId).catch(() => null);

            if (!targetGuild) {
               await PatchNotesConfig.findOneAndDelete({ _id: config._id });
               continue;
            }

            const targetChannel = (await targetGuild.channels.fetch(config.channelId).catch(() => null)) as TextChannel | null;

            if (!targetChannel) {
               await PatchNotesConfig.findOneAndDelete({ _id: config._id });
               continue;
            }

            config.lastReleaseId = String(latestRelease.id);

            await config.save();

            const releaseDate = new Date(latestRelease.publishedAt).toLocaleDateString('es-ES', {
               day: 'numeric',
               month: 'long',
               year: 'numeric',
            });

            const truncatedBody = latestRelease.body.length > 4000 ? latestRelease.body.substring(0, 4000) + '...' : latestRelease.body;

            const embed = new EmbedBuilder()
               .setTitle(`📌 Notas del Parche – ${latestRelease.name}`)
               .setDescription(truncatedBody)
               .setColor(0x5865f2)
               .setURL(latestRelease.htmlUrl)
               .addFields({ name: '🗓️ Fecha de lanzamiento', value: releaseDate, inline: true })
               .setFooter({ text: '¡Gracias por vuestro apoyo! Si encuentras algún problema, no dudes en compartirlo.' })
               .setTimestamp(new Date(latestRelease.publishedAt));

            await targetChannel.send({ content: '@everyone', embeds: [embed] });
         }
      } catch (error) {
         console.error(`Hubo un error al comprobar los releases de GitHub: ${error}`);
      }
   };

   checkGitHubReleases();
   setInterval(checkGitHubReleases, 300000);
}
