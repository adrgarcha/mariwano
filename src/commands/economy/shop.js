const {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} = require("discord.js");
const User = require("../../models/User");
const {
  customRoleCost,
  customRoleEditCost,
} = require("../../utils/shopPrices.json");

module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
      const { balance, customRoleId } = await User.findOne({
        userId: interaction.user.id,
        guildId: interaction.guild.id,
      });
      const shopCommand = interaction.options.getSubcommand();

      if (shopCommand === "custom-role") {
        const action = interaction.options.getString("action");
        const name = interaction.options.getString("name");
        const color = interaction.options.getString("color");

        if (action === "buy") {
          if (customRoleId !== "") {
            await interaction.reply({
              content: "Ya tienes un rol personalizado.",
              ephemeral: true,
            });
            return;
          }

          if (balance < customRoleCost) {
            await interaction.reply({
              content: `Necesitas ${customRoleCost} gramos para comprar un rol personalizado.`,
              ephemeral: true,
            });
            return;
          }

          await interaction.deferReply({ ephemeral: true });

          const customRole = await interaction.guild.roles.create({
            name,
            permissions: [],
            color,
          });

          interaction.member.roles.add(customRole);

          await User.findOneAndUpdate(
            {
              userId: interaction.user.id,
              guildId: interaction.guild.id,
            },
            {
              $set: {
                customRoleId: customRole.id,
              },
              $inc: {
                balance: -customRoleCost,
              },
            }
          );

          await interaction.editReply(
            `Se ha completado correctamente la compra del rol ${name} por ${customRoleCost} gramos 🤑💸.`
          );
        }

        if (action === "edit") {
          if (customRoleId === "") {
            await interaction.reply({
              content: "Necesitas comprar un rol personalizado primero.",
              ephemeral: true,
            });
            return;
          }

          if (balance < customRoleEditCost) {
            await interaction.reply({
              content: `Necesitas ${customRoleEditCost} gramos para editar tu rol personalizado.`,
              ephemeral: true,
            });
            return;
          }

          await interaction.deferReply({ ephemeral: true });

          const customRole = await interaction.guild.roles.fetch(customRoleId);

          customRole.edit({ name, color });

          await User.findOneAndUpdate(
            {
              userId: interaction.user.id,
              guildId: interaction.guild.id,
            },
            {
              $inc: {
                balance: -customRoleEditCost,
              },
            }
          );

          await interaction.editReply(
            `Se ha completado correctamente la edición del rol a ${name} por ${customRoleEditCost} gramos 🤑💸.`
          );
        }
      }

      if (shopCommand === "custom-role-remove") {
        if (customRoleId === "") {
          await interaction.reply({
            content: "Necesitas comprar un rol personalizado primero.",
            ephemeral: true,
          });
          return;
        }

        await interaction.deferReply({ ephemeral: true });

        const customRole = await interaction.guild.roles.fetch(customRoleId);

        customRole.delete();

        await User.findOneAndUpdate(
          {
            userId: interaction.user.id,
            guildId: interaction.guild.id,
          },
          {
            $set: {
              customRoleId: "",
            },
          }
        );

        await interaction.editReply(`Tu rol personalizado ha sido eliminado.`);
      }
    } catch (error) {
      console.log(`Ha ocurrido un error con el comando 'shop': ${error}`);
    }
  },
  data: new SlashCommandBuilder()
    .setName("shop")
    .setDescription("Tienda dónde puedes gastar tus gramos de cocaína.")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("custom-role")
        .setDescription(
          `Compra un rol personalizado por ${customRoleCost} gramos.`
        )
        .addStringOption((option) =>
          option
            .setName("action")
            .setDescription(
              "Elige entre comprar o editar tu rol personalizado."
            )
            .addChoices(
              {
                name: `Comprar rol (${customRoleCost} gramos)`,
                value: "buy",
              },
              {
                name: `Editar rol (${customRoleEditCost} gramos)`,
                value: "edit",
              }
            )
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("name")
            .setDescription("Elige el nombre de tu rol.")
            .setMinLength(1)
            .setMaxLength(25)
            .setRequired(true)
        )
        .addStringOption((option) =>
          option
            .setName("color")
            .setDescription("Elige el color de tu rol (En inglés -> 'Green').")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("custom-role-remove")
        .setDescription("Elimina tu rol personalizado GRATIS.")
    ),
};
