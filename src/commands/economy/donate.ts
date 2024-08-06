import { GuildMember, SlashCommandBuilder } from 'discord.js';
import { CommandProps } from '../../lib/types';
import { User } from '../../models/User';

export const run = async ({ interaction }: CommandProps) => {
   if (!interaction.guild) {
      interaction.reply({
         content: 'Solo puedes ejecutar este comando en un servidor.',
         ephemeral: true,
      });
      return;
   }

   try {
      const receiveUser = interaction.options.getMentionable('user') as GuildMember;
      const donateAmount = interaction.options.getNumber('amount');

      const user = await User.findOne({
         userId: interaction.user.id,
         guildId: interaction.guild.id,
      });

      if (!user) {
         await interaction.reply({
            content: 'No estás en el sistema monetario. Prueba a usar el comando /daily.',
            ephemeral: true,
         });
         return;
      }

      const balance = user.balance;
      if (balance < donateAmount!) {
         await interaction.reply({
            content: `No tienes ${donateAmount} gramos.`,
            ephemeral: true,
         });
         return;
      }

      if (donateAmount! < 1) {
         await interaction.reply({
            content: `Tienes que donar como mínimo 1 gramo de cocaína. No seas rata.`,
            ephemeral: true,
         });
         return;
      }

      const receiveUserData = await User.findOneAndUpdate(
         {
            userId: receiveUser.id,
            guildId: interaction.guild.id,
         },
         {
            $inc: {
               balance: donateAmount,
            },
         }
      );

      if (!receiveUserData) {
         await interaction.reply({
            content: `<@${receiveUser.id}> no está en el sistema monetario.`,
            ephemeral: true,
         });
         return;
      }

      await interaction.deferReply();

      await User.findOneAndUpdate(
         {
            userId: interaction.user.id,
            guildId: interaction.guild.id,
         },
         {
            $inc: {
               balance: -donateAmount!,
            },
         }
      );

      interaction.editReply(`Has donado ${donateAmount} gramos de cocaína al pobre de <@${receiveUser.id}>.`);
   } catch (error) {
      console.error(`Ha ocurrido un error con el comando 'donate': ${error}`);
   }
};

export const data = new SlashCommandBuilder()
   .setName('donate')
   .setDescription('Donale a un miembro pobre asqueroso.')
   .addMentionableOption(option => option.setName('user').setDescription('El pobre asqueroso al que le quieres donar.').setRequired(true))
   .addIntegerOption(option => option.setName('amount').setDescription('La cantidad que le quieres donar al pobre asqueroso.').setRequired(true));
