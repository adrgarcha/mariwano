import cron from 'node-cron';
import { Client, EmbedBuilder, TextChannel } from 'discord.js';
import { Burn } from '../../models/Burn';
import { BurnSettings } from '../../models/BurnSettings';
import { getIsoWeekId } from '../../utils/date';

// Production: every Sunday at 21:00 -> '0 21 * * 0'
// Development: every minute -> '* * * * *'
const cronExpression = process.env.NODE_ENV === 'production' ? '0 21 * * 0' : '* * * * *';

export default function (client: Client) {
   cron.schedule(cronExpression, () => publishBurnersRanking(client), { timezone: 'Europe/Madrid' });
}

async function publishBurnersRanking(client: Client) {
   try {
      const allSettings = await BurnSettings.find();

      for (const settings of allSettings) {
         const { guildId, channelId, roleId } = settings;

         const guild = client.guilds.cache.get(guildId);
         if (!guild) continue;

         const channel = guild.channels.cache.get(channelId) as TextChannel;
         if (!channel) {
            console.error(`[rankBurners] Canal no encontrado: ${channelId} en guild ${guildId}`);
            continue;
         }

         const weekId = getIsoWeekId();

         const topBurners = await Burn.aggregate([
            { $match: { guildId, weekId } },
            { $group: { _id: '$userId', total: { $sum: '$amount' }, firstBurn: { $min: '$createdAt' } } },
            { $sort: { total: -1, firstBurn: 1 } },
            { $limit: 10 },
         ]);

         const embed = new EmbedBuilder()
            .setTitle('🔥 Ranking Semanal de Derrochadores 🔥')
            .setColor(0xe74c3c)
            .setTimestamp()
            .setFooter({ text: `Semana ${weekId}` });

         if (topBurners.length === 0) {
            embed.setDescription('Nadie quemó gramos esta semana. ¡Empezad a derrochar!');
            await channel.send({ embeds: [embed] });
            continue;
         }

         const medals = ['🥇', '🥈', '🥉'];
         const description = topBurners
            .map((entry, i) => {
               const position = i < 3 ? medals[i] : `**${i + 1}.**`;
               return `${position} <@${entry._id}>: **${entry.total}** gramos quemados`;
            })
            .join('\n');

         embed.setDescription(description);
         await channel.send({ embeds: [embed] });

         const topUserId = topBurners[0]._id as string;

         const role = await guild.roles.fetch(roleId).catch(() => null);
         if (!role) {
            console.error(`[rankBurners] Rol no encontrado: ${roleId} en guild ${guildId}`);
            continue;
         }

         for (const [, member] of role.members) {
            if (member.id === topUserId) continue;
            await member.roles.remove(role).catch(err => console.error(`[rankBurners] Error al retirar rol de ${member.id}: ${err}`));
         }

         const topMember = await guild.members.fetch(topUserId).catch(() => null);
         if (!topMember) {
            console.error(`[rankBurners] Miembro no encontrado: ${topUserId} en guild ${guildId}`);
            continue;
         }

         if (!topMember.roles.cache.has(roleId)) {
            await topMember.roles.add(role).catch(err => console.error(`[rankBurners] Error al asignar rol a ${topUserId}: ${err}`));
         }

         await BurnSettings.updateOne({ guildId }, { currentHolderId: topUserId });
      }
   } catch (error) {
      console.error(`[rankBurners] Error en el cron de ranking de quemadores: ${error}`);
   }
}
