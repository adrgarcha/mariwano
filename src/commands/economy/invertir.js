const { ChatInputCommandInteraction,
    ApplicationCommandOptionType } = require("discord.js");
const User = require("../../models/User");
module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    if (!interaction.inGuild) {
      interaction.reply({
        content: "Solo puedes ejecutar este comando en un servidor.",
        ephemeral: true,
      });
      return;
    }
    const cantidad = interaction.options.get("cantidad")?.value;
    const targetUserId =
      interaction.options.get("usuario")?.value || interaction.member.id;
    try {
      await interaction.deferReply();
        if(cantidad === undefined || targetUserId === undefined){
            interaction.reply("Inverte en el usuario una cantidad mínima de 10 000 gramos. Cuanto más ganancias logre el usuario que ha"+
            " embolsado tu dinero, más remuneras en tu cuenta");
        }
      let query = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };
      let porrero = {
        userId: targetUserId,
        guildId: interaction.guild.id,
      };
      let user = await User.findOne(query);
      let porrazo = await User.findOne(porrero);
      if (user) {
        const userBalance = user.balance;

        if (userBalance < 10000 || cantidad < 10000) {
          interaction.editReply(`Como mínimo tienes que invertir 10 000 gramos de cocaína.`);
          return;
        }
      } else {
        user = new User({
          ...query,
          kahootLimit: 0,
        });
      }

      user.kahootLimit -= cantidad;
        await user.save();

        porrazo.balance += cantidad;
        await porrazo.save();

        interaction.editReply(`Acabas de invertir ${cantidad} en <@${targetUserId}>`);
          
    } catch (error) {
      console.log(`Ha ocurrido un error: ${error}`);
    }
  },
  data: {
    name: "invertir",
    description: "Dona dinero a alguien. Si aumenta ganancias, tu también y si no, ambos perdéis dinero",
    options: [
        {
            name: "usuario",
            description: "El usuario al que quieres que embolse el dinero",
            type: ApplicationCommandOptionType.Mentionable,
        },
        {
            name: "cantidad",
            description: "La cantidad de dinero que vas a invertir. Tiene que ser más de 10 000",
            type: ApplicationCommandOptionType.Number,
            min_length: 5,
        },
    ],
  },
};
