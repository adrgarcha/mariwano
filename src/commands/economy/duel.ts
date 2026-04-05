import {
   ActionRowBuilder,
   ButtonBuilder,
   ButtonStyle,
   EmbedBuilder,
   GuildMember,
   InteractionContextType,
   MessageFlags,
   SlashCommandBuilder,
} from 'discord.js';
import mongoose from 'mongoose';
import { CommandProps } from '../../lib/types';
import { DuelHistory } from '../../models/DuelHistory';
import { User } from '../../models/User';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      await interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         flags: MessageFlags.Ephemeral,
      });
      return;
   }

   try {
      const opponent = interaction.options.getMentionable('opponent') as GuildMember;
      const amount = interaction.options.getInteger('amount')!;

      if (opponent.id === interaction.user.id) {
         await interaction.reply({
            content: 'No puedes retarte a ti mismo.',
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      if (opponent.user.bot) {
         await interaction.reply({
            content: 'No puedes retar a un bot.',
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      if (amount < 100) {
         await interaction.reply({
            content: 'Debes apostar al menos 100 gramos de cocaína.',
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      const challenger = await User.findOne({
         userId: interaction.user.id,
         guildId: interaction.guild.id,
      });

      if (!challenger) {
         await interaction.reply({
            content: 'No estás en el sistema monetario. Prueba a usar el comando /daily.',
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      if (challenger.balance < amount) {
         await interaction.reply({
            content: `No tienes suficientes gramos. Tienes ${challenger.balance} gramos.`,
            flags: MessageFlags.Ephemeral,
         });
         return;
      }

      const acceptButton = new ButtonBuilder().setCustomId('duel_accept').setLabel('Aceptar').setStyle(ButtonStyle.Success).setEmoji('⚔️');

      const rejectButton = new ButtonBuilder().setCustomId('duel_reject').setLabel('Rechazar').setStyle(ButtonStyle.Danger).setEmoji('🏳️');

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(acceptButton, rejectButton);

      const challengeEmbed = new EmbedBuilder()
         .setTitle('⚔️ ¡Duelo de gramos!')
         .setColor(0xe67e22)
         .setDescription(
            `<@${interaction.user.id}> reta a <@${opponent.id}> a un duelo por **${amount} gramos**.\n\n` +
               `<@${opponent.id}>, ¿aceptas el duelo? Tienes 60 segundos para responder.`
         )
         .addFields(
            { name: '🥊 Retador', value: `<@${interaction.user.id}>`, inline: true },
            { name: '🛡️ Retado', value: `<@${opponent.id}>`, inline: true },
            { name: '💰 Apuesta', value: `${amount} gramos cada uno`, inline: true }
         )
         .setTimestamp()
         .setFooter({ text: 'El ganador se lleva el bote completo.' });

      const message = await interaction.reply({
         embeds: [challengeEmbed],
         components: [row],
         fetchReply: true,
      });

      const collector = message.createMessageComponentCollector({ time: 60_000 });

      collector.on('collect', async i => {
         if (i.user.id !== opponent.id) {
            await i.reply({
               content: 'Solo el retado puede responder a este duelo.',
               flags: MessageFlags.Ephemeral,
            });
            return;
         }

         collector.stop(i.customId);

         if (i.customId === 'duel_reject') {
            const rejectedEmbed = EmbedBuilder.from(challengeEmbed)
               .setColor(0x95a5a6)
               .setDescription(`<@${opponent.id}> ha rechazado el duelo. ¡Cobarde!`);

            await i.update({ embeds: [rejectedEmbed], components: [] });
            return;
         }

         await i.deferUpdate();

         const session = await mongoose.startSession();
         session.startTransaction();

         try {
            const [challengerData, opponentData] = await Promise.all([
               User.findOne({ userId: interaction.user.id, guildId: interaction.guild!.id }),
               User.findOne({ userId: opponent.id, guildId: interaction.guild!.id }),
            ]);

            if (!challengerData || challengerData.balance < amount) {
               await session.abortTransaction();
               session.endSession();

               const noFundsEmbed = EmbedBuilder.from(challengeEmbed)
                  .setColor(0xe74c3c)
                  .setDescription(`El duelo no pudo completarse: <@${interaction.user.id}> ya no tiene suficientes gramos.`);

               await message.edit({ embeds: [noFundsEmbed], components: [] });
               return;
            }

            if (!opponentData || opponentData.balance < amount) {
               await session.abortTransaction();
               session.endSession();

               const noFundsEmbed = EmbedBuilder.from(challengeEmbed)
                  .setColor(0xe74c3c)
                  .setDescription(`El duelo no pudo completarse: <@${opponent.id}> ya no tiene suficientes gramos.`);

               await message.edit({ embeds: [noFundsEmbed], components: [] });
               return;
            }

            const challengerWins = Math.random() < 0.5;
            const winnerId = challengerWins ? interaction.user.id : opponent.id;
            const loserId = challengerWins ? opponent.id : interaction.user.id;

            await User.updateOne(
               { userId: interaction.user.id, guildId: interaction.guild!.id },
               { $inc: { balance: challengerWins ? amount : -amount } },
               { session }
            );

            await User.updateOne(
               { userId: opponent.id, guildId: interaction.guild!.id },
               { $inc: { balance: challengerWins ? -amount : amount } },
               { session }
            );

            await DuelHistory.create(
               [{ guildId: interaction.guild!.id, challengerId: interaction.user.id, opponentId: opponent.id, amount, winnerId }],
               { session }
            );

            await session.commitTransaction();
            session.endSession();

            const winnerBalance = challengerWins ? challengerData.balance + amount : opponentData.balance + amount;

            const resultEmbed = EmbedBuilder.from(challengeEmbed)
               .setColor(0x2ecc71)
               .setDescription(
                  `⚔️ ¡El duelo ha terminado!\n\n` +
                     `🏆 <@${winnerId}> ha ganado y se lleva **${amount * 2} gramos**.\n` +
                     `💀 <@${loserId}> ha perdido **${amount} gramos**.\n\n` +
                     `<@${winnerId}> ahora tiene **${winnerBalance} gramos**.`
               );

            await message.edit({ embeds: [resultEmbed], components: [] });
         } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
         }
      });

      collector.on('end', (_, reason) => {
         if (reason === 'duel_accept' || reason === 'duel_reject') return;

         const timedOutEmbed = EmbedBuilder.from(challengeEmbed)
            .setColor(0x95a5a6)
            .setDescription(`El duelo ha expirado. <@${opponent.id}> no respondió a tiempo.`);

         message.edit({ embeds: [timedOutEmbed], components: [] });
      });
   } catch (error) {
      console.error(`Ha ocurrido un error con el comando 'duel': ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('duel')
   .setDescription('Reta a otro usuario a un duelo de gramos. El ganador se lleva el bote.')
   .setContexts([InteractionContextType.Guild])
   .addMentionableOption(option => option.setName('opponent').setDescription('El usuario al que quieres retar.').setRequired(true))
   .addIntegerOption(option =>
      option.setName('amount').setDescription('La cantidad de gramos que apuesta cada uno (mínimo 100).').setMinValue(100).setRequired(true)
   );
