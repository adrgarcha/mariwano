const {
  ChatInputCommandInteraction,
  Client,
  EmbedBuilder,
  ActionRowBuilder,
  ComponentType,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} = require("discord.js");
const fs = require("fs");
const path = require("path");

module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   * @param {Client} param0.client
   */
  run: async ({ interaction, client }) => {
    const emojis = {
      admin: "⚙",
      economy: "💲",
      fun: "😂",
      general: "ℹ",
      moderation: "🛠",
      music: "🎵",
    };

    const formatString = (str) =>
      `${str[0].toUpperCase()}${str.slice(1).toLowerCase()}`;

    let categoryCommands = {};
    const commandFolders = fs.readdirSync(path.join(__dirname, ".."));

    for (const commandFolder of commandFolders) {
      const commandFiles = fs
        .readdirSync(path.join(__dirname, `../${commandFolder}`))
        .filter((file) => file.endsWith(".js"));
      categoryCommands[`${formatString(commandFolder)}`] = [];

      for (const commandFile of commandFiles) {
        const command = require(`../${commandFolder}/${commandFile}`);

        categoryCommands[`${formatString(commandFolder)}`].push(command);
      }
    }

    const helpEmbed = new EmbedBuilder().setDescription(
      "Por favor eliga una categoría en el menú desplegable."
    );

    const components = (state) => [
      new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId("help-menu")
          .setPlaceholder("Seleccione una categoría")
          .setDisabled(state)
          .addOptions(
            Object.keys(categoryCommands).map((category) => {
              return new StringSelectMenuOptionBuilder()
                .setLabel(category)
                .setValue(category.toLowerCase())
                .setDescription(`Comandos de la categoría ${category}`)
                .setEmoji(emojis[category.toLowerCase()]);
            })
          )
      ),
    ];

    const initialMessage = await interaction.reply({
      embeds: [helpEmbed],
      components: components(false),
    });

    const filter = (interaction) =>
      interaction.user.id === interaction.member.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      componentType: ComponentType.StringSelect,
    });

    collector.on("collect", (interaction) => {
      const [directory] = interaction.values;
      const category = Object.keys(categoryCommands).find(
        (category) => category.toLowerCase() === directory
      );

      const categoryEmbed = new EmbedBuilder()
        .setTitle(`Comandos de ${formatString(directory)}`)
        .setDescription(
          `Una lista de todos los comandos dentro de la categoría ${directory}`
        )
        .addFields(
          categoryCommands[category].map((command) => {
            return {
              name: `\`${command.data.name}\``,
              value: command.data.description,
              inline: true,
            };
          })
        );

      interaction.update({ embeds: [categoryEmbed] });
    });

    collector.on("end", () => {
      initialMessage.edit({ components: components(true) });
    });
  },
  data: {
    name: "help",
    description: "Muestra todos los comandos disponibles para el bot.",
  },
};
