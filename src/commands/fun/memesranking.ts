import {
  ChannelType,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { CommandProps } from "../../lib/types";
import { MemeConfiguration } from "../../models/MemeRanking";

export const run = async ({ interaction }: CommandProps) => {
  /*
  if (!interaction.memberPermissions?.has("Administrator")) {
    await interaction.reply(
      "Solo los administradores pueden ejecutar este comando."
    );
    return;
  }*/
  if (!interaction.guild) {
    interaction.reply("Solo puedes ejecutar este comando en un servidor.");
    return;
  }

  let memeGuildConfiguration = await MemeConfiguration.findOne({
    guildId: interaction.guildId,
  });

  if (!memeGuildConfiguration) {
    memeGuildConfiguration = new MemeConfiguration({
      guildId: interaction.guildId,
    });
  }

  const subcommand = interaction.options.getSubcommand();

  if (subcommand === "setup") {
    const channel = interaction.options.getChannel("canal");

    if (memeGuildConfiguration.rankingChannelId) {
      await interaction.reply(
        `Ya hay un canal de ranking de memes configurado.`
      );
      return;
    }

    memeGuildConfiguration = new MemeConfiguration({
      guildId: interaction.guildId,
      rankingChannelId: channel!.id,
      lastRanking: new Date().setMonth(9),
    });
    
    await memeGuildConfiguration.save();

    await interaction.reply(`Se ha agregado ${channel} como canal de memes.`);
    return;
  } else if (subcommand === "disable") {
    try {
      const channel = interaction.options.getChannel("canal2");

      if (!memeGuildConfiguration.rankingChannelId) {
        await interaction.reply(
          `${channel} no es un canal de ranking de memes.`
        );
        return;
      }
      const memeConfigs = await MemeConfiguration.find();
      for (const memeConfig of memeConfigs) {
        await memeConfig.deleteOne();
      }

      await memeGuildConfiguration.deleteOne();

      await interaction.reply(
        `Se ha eliminado ${channel} como canal de ranking de memes.`
      );
      return;
    } catch (error) {
      await interaction.reply(`Hubo un error al eliminar el canal: ` + error);
    }
  }

  try {
  } catch (error) {
    console.error(`Hubo un error al configurar el auto-rol: ${error}`);
  }
};

export const data = new SlashCommandBuilder()
  .setName("memesranking")
  .setDescription("Crea un ranking de los mejores memes de la semana")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("setup")
      .setDescription(`Configura memesranking`)
      .addChannelOption((option) =>
        option
          .setName("canal")
          .setDescription("Canal de memes a configurar")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("disable")
      .setDescription("Elimina un canal de ranking de memes")
      .addChannelOption((option) =>
        option
          .setName("canal2")
          .setDescription("El canal que quieres eliminar.")
          .addChannelTypes(ChannelType.GuildText)
          .setRequired(true)
      )
  ); /*.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)*/
