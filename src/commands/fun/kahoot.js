const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");

const User = require("../../models/User");

const preguntas = require("../../utils/kahootQuestions.json");

// funciones necesarias:
// ordenar los elementos de un array aleatoriamente
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex > 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
// escoger una propiedad de un objeto aleatoriamente
function randomProperty(obj, hardcored) {
  var keys = Object.keys(obj);
  if (!hardcored) {
    return obj[keys[(keys.length * Math.random()) << 0]];
  } else {
    var validKeys = keys.filter(function (key) {
      return obj[key].dificultad > 1;
    });

    if (validKeys.length === 0) {
      return undefined; // Devuelve undefined si no hay propiedades con dificultad mayor que 1
    }

    var randomKey = validKeys[(validKeys.length * Math.random()) << 0];
    return obj[randomKey];
  }
}
// fin funciones
module.exports = {
  /**
   *
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
      if (!interaction.inGuild) {
        interaction.reply({
          content: "Solo puedes ejecutar este comando en un servidor.",
          ephemeral: true,
        });
        return;
      }

      var botPr = randomProperty(
        preguntas,
        interaction.options.getBoolean("hardcore")
      );
      let query = {
        userId: interaction.member.id,
        guildId: interaction.guild.id,
      };

      let user = await User.findOne(query);

      if (user) {
        const lastKahootDate = user.lastKahoot.toDateString();
        const currentDate = new Date().toDateString();
        var kahootUserCount = user.kahootLimit;

        if (lastKahootDate !== currentDate) {
          user.kahootLimit = 5;
          await user.save();
        }

        if (kahootUserCount <= 0) {
          interaction.reply({
            content: `Has excedido el límite de preguntas por hoy. El límite diario es de 5 preguntas`,
            ephemeral: true,
          });
          return;
        }
      } else {
        user = new User({
          ...query,
          lastKahoot: new Date(),
          kahootLimit: 5,
        });
      }

      const respuestasReply = [botPr.respuesta, botPr.r1, botPr.r2, botPr.r3];
      const respuestasDef = shuffle(respuestasReply);
      user.kahootLimit -= 1;
      user.lastKahoot = new Date();
      await user.save();

      let leaderboardEmbed = new EmbedBuilder()
        .setTitle(`${botPr.pregunta}`)
        .setColor(0x45d6fd)
        .setFooter({
          text: "Escribe en tu siguiente mensaje la respuesta y no la letra (da igual si es mayúsculas o minúsculas)",
        });

      var data = "";
      for (var i = 0; i < respuestasReply.length; i++) {
        data += "\n" + String.fromCharCode(i + 65) + ") " + respuestasDef[i];
      }
      leaderboardEmbed.setDescription(data);

      await interaction.reply({ embeds: [leaderboardEmbed] });
      const filter = (response) => response.author.id === interaction.member.id;
      const collector = interaction.channel.createMessageCollector({
        filter,
        time: 15000,
      });

      collector.on("collect", (response) => {
        const respuestaUsuario = response.content;

        if (
          respuestaUsuario
            .toLowerCase()
            .trim()
            .includes(botPr.respuesta.trim().toLowerCase())
        ) {
          const amountWon = 175 * botPr.dificultad;
          user.balance += amountWon;
          user.save();

          interaction.followUp(`¡Respuesta correcta! | ${amountWon} gramos de cocaína fueron agregadas a tu inventario.`);
        } else {
          interaction.followUp(
            `Perdiste. Ahora sabes cuál no es la correcta socio`
          );
        }

        collector.stop();
        return;
      });

      collector.on("end", (collected, reason) => {
        if (reason === "time") {
          interaction.followUp({
            content: "¡Tiempo agotado!",
            ephemeral: true,
          });
          return;
        }
      });
    } catch (error) {
      console.log(`Ha ocurrido un error con el kahoot: ${error}`);
    }
  },
  data: {
    name: "kahoot",
    description:
      "Si aciertas una pregunta de cultura clásica, serás recompensado con gramos de cocaina",
    options: [
      {
        name: "hardcore",
        description: "Preguntas más difíciles pero ganas más gramos",
        type: ApplicationCommandOptionType.Boolean,
        required: true,
      },
    ],
  },
};
