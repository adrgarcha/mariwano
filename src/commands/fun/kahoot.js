const {
  ChatInputCommandInteraction,
  EmbedBuilder,
  ApplicationCommandOptionType,
} = require("discord.js");
const User = require("../../models/User");

var preguntas = {
  pregunta1: {
    pregunta:
      "En la película de FNAF, ¿qué dice William Afton antes de volver a ponerse su traje?",
    respuesta: '"Yo siempre vuelvo"',
    r1: '"Yo soy el Five Nights at Freddy\'s"',
    r2: "Nada",
    r3: '"O cholera czy to Freddy Fazbear?"',
    dificultad: 2,
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
    pregunta: "¿Cómo se llama el perro de Markiplier?",
    respuesta: "Chica",
    r1: "Bonnie",
    r2: "Foxy",
    r3: "Doge",
    dificultad: 1,
  },
  pregunta10: {
    pregunta: "¿Cómo llamaba Jordi Wild al alien de Alien Isolation?",
    respuesta: "Manueh",
    r1: "Manolo",
    r2: "Black Alien",
    r3: "Juan",
    dificultad: 3,
  },
  pregunta11: {
    pregunta: "¿Qué palabras eligió Lolito para terminar su infame rap?",
    respuesta: "Pero con su odio se atragantaron",
    r1: "Dedicación y mucha pasión",
    r2: "Ya estoy por aquí",
    r3: "Hizo que en esto fuera el mejor",
    dificultad: 2,
  },
  pregunta12: {
    pregunta: "¿A qué velocidad van los autobuses en los servidores árabes de RP de FiveM, en km/h?",
    respuesta: "300",
    r1: "120",
    r2: "60",
    r3: "40",
    dificultad: 4,
  },
  pregunta13: {
    pregunta: "¿Es Porrero bueno haciendo comandos de discord?",
    respuesta: "Sí",
    r1: "Sí",
    r2: "Sí",
    r3: "Sí",
    dificultad: 1,
  },
  pregunta14: {
    pregunta: "¿Cuántas veces han baneado a IlloJuan en Twitch, en total?",
    respuesta: "0",
    r1: "1",
    r2: "2",
    r3: "3",
    dificultad: 1,
  },
  pregunta15: {
    pregunta: "¿Cuántas veces han baneado a Orslok en Twitch, en total?",
    respuesta: "9",
    r1: "12",
    r2: "7",
    r3: "14",
    dificultad: 3,
  },
  pregunta16: {
    pregunta: "¿Cuántas veces han baneado a Ibai en Twitch, en total?",
    respuesta: "4",
    r1: "0",
    r2: "1",
    r3: "8",
    dificultad: 3,
  },
  pregunta17: {
    pregunta: "¿Puedes fumar porros en Twitch?",
    respuesta: "Solo si es legal en su país",
    r1: "No",
    r2: "Solo si está bueno el porro",
    r3: "Sí",
    dificultad: 1,
  },
  pregunta18: {
    pregunta: "¿Qué animal no está en el Minecraft?",
    respuesta: "Luciérnaga",
    r1: "Renacuajo",
    r2: "Oso polar",
    r3: "Panda",
    dificultad: 2,
  },
  pregunta19: {
    pregunta: "¿Qué mob de minecraft se agregó en la edición de April Fools?",
    respuesta: "Insecto de redstone",
    r1: "Steve negro",
    r2: "Caballo zombi",
    r3: "Gólem agresivo",
    dificultad: 1,

  },
  pregunta20: {
    pregunta: "¿En qué año salió Minecraft?",
    respuesta: "2009",
    r1: "2011",
    r2: "2008",
    r3: "2013",
    dificultad: 1,
  }
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
        if (user) {
          const lastKahootDate = user.lastKahoot;
          const currentDate = new Date();
          var kahootUserCount = user.kahootLimit;
          if (lastKahootDate.toDateString() !== currentDate.toDateString()) {
            user.kahootLimit = 5;
            await user.save();
          }
          if (kahootUserCount <= 0) {
            interaction.reply(
              `Has excedido el límite de preguntas por hoy. El límite diario es de 5 preguntas`
            );
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

        console.log(kahootUserCount);

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
