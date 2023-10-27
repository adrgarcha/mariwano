const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");
const User = require("../../models/User");

var preguntas = {
  pregunta1: {
    pregunta: "¿Cuál es el nombre original de Godfrey?",
    respuesta: "Hoarah Loux",
    r1: "Malenia",
    r2: "Horux Loux",
    r3: "JPelirrojo",
    dificultad: 1,
  },
  pregunta2: {
    pregunta: "¿En qué juego fue la primera aparición de Waluigi?",
    respuesta: "Mario Tenis",
    r1: "Mario Party 3",
    r2: "Mario Golf: Toadstool Tour",
    r3: "Mario Kart: Double Dash",
    dificultad: 4,
  },
  pregunta3: {
    pregunta:
      "¿Qué dinero tenía Porreria en el banco cuando el admin baneó a Porrero, en lingotes de oro?",
    respuesta: "30000",
    r1: "122600",
    r2: "7100",
    r3: "Nada",
    dificultad: 1,
  },
  pregunta4: {
    pregunta: "¿Quién causó la segunda guerra mundial?",
    respuesta: "Hitler",
    r1: "Mi padre borracho",
    r2: "Churchill",
    r3: "Un francés",
    dificultad: 1,
  },
  pregunta5: {
    pregunta:
      "¿Cuáles son los países que saqueó Porrero en mcatlas (cuyo saqueo provocó que el admin lo banease)?",
    respuesta: "Irlanda y Cuba",
    r1: "Benín, Burkina Faso, Cabo Verde, Costa de Marfil, Gambia, Ghana, Guinea, Guinea-Bissau, Liberia, Mali, Níger, Nigeria, Senegal, Sierra Leona, Togo, Comoras, Yibuti, Etiopía, Eritrea, Kenia, Madagascar, Mauricio, Uganda, Ruanda, Seychelles, Somalia, Sudán del Sur, Sudán y Tanzania",
    r2: "Francia y Reino Unido",
    r3: "Marruecos y Polonia",
    dificultad: 1,
  },
  pregunta6: {
    pregunta: "¿Qué carrera estudió Jordi Wild?",
    respuesta: "Psicología",
    r1: "Pornografía",
    r2: "Filología",
    r3: "Magisterio",
    dificultad: 1,
  },
  pregunta7: {
    pregunta:
      "¿Qué método se emplea para la visualización de la estructura de una proteína?",
    respuesta: "Cristalografía",
    r1: "HSQC",
    r2: "SEXS",
    r3: "Citometría de flujo",
    dificultad: 4,
  },
  pregunta8: {
    pregunta:
      "¿Cuál es el método que emplearías para la transgénesis en una célula germinal?",
    respuesta: "Lentivirus",
    r1: "CRISPR-Cas9",
    r2: "Un cubo lleno de líquido blanco sospechoso que te ha dado un vagabundo",
    r3: "Un polla de latex modelo Folagor",
    dificultad: 2,
  },
  pregunta9: {
    pregunta: "¿Dónde se halla Malenia?",
    respuesta: "El árbol Hierático",
    r1: "Leyndell",
    r2: "Liurnia",
    r3: "Picos de los Gigantes",
    dificultad: 2,
  },
  pregunta10: {
    pregunta: "",
  },
};
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
    if (!interaction.inGuild) {
      interaction.reply({
        content: "Solo puedes ejecutar este comando en un servidor.",
        ephemeral: true,
      });
      return;
    }
    try {
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
        const respuestasReply = [botPr.respuesta, botPr.r1, botPr.r2, botPr.r3];
        const respuestasDef = shuffle(respuestasReply);
        user.kahootLimit -= 1;
        await user.save();
        var kahootUserCount = user.kahootLimit;
        console.log(kahootUserCount);
        if (kahootUserCount <= 0) {
          interaction.reply(
            `Has excedido el límite de tiradas del kahoot. Cómprale a Porrero más intentos en /kahootrecarga por sólo 475 gramos`
          );
          return;
        }

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
        const filter = (response) =>
          response.author.id === interaction.member.id;
        const collector = interaction.channel.createMessageCollector({
          filter,
          time: 15000, // Tiempo en milisegundos (15 segundos )
        });

        collector.on("collect", (response) => {
          const respuestaUsuario = response.content;

          if (
            respuestaUsuario
              .toLowerCase()
              .trim()
              .includes(botPr.respuesta.trim().toLowerCase())
          ) {
            interaction.followUp("¡Respuesta correcta!");
            user.balance += 175 * botPr.dificultad;
            user.save();

            interaction.followUp(
              `${
                175 * botPr.dificultad
              } gramos de cocaína fueron agregadas a tu inventario.`
            );
          } else {
            interaction.followUp(
              `Perdiste. Ahora sabes cuál no es la correcta socio`
            );
            return;
          }

          collector.stop(); // Detener el colector después de la respuesta del usuario
        });

        collector.on("end", (collected, reason) => {
          if (reason === "time") {
            interaction.followUp("¡Tiempo agotado!");
            return;
          }
        });
      } else {
        user = new User({
          ...query,
          kahootLimit: 5,
        });
      }
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
