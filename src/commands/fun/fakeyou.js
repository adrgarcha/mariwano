const {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} = require("discord.js");
const fs = require("fs");
const FakeYou = require("fakeyou.js");

module.exports = {
  /**
   * 
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {

      await interaction.deferReply({ ephemeral: true });

      const textoAVoz = interaction.options.getString("textardo").toString();
      const tipoDeVoz = interaction.options
        .getString("voz")
        .toString()
        .toLowerCase();
      const vocesProhibidas = ["xokas"];
      if (vocesProhibidas.includes(tipoDeVoz.toLowerCase())) {
        interaction.editReply("No puedes utilizar esa voz, lo siento.");
      }

      const fy = new FakeYou.Client({
        usernameOrEmail: "porrazo",
        password: "code100Todo",
      });

      await fy.start();
      
      let model = fy.searchModel(tipoDeVoz).first();
      if (!model) {
        interaction.editReply("Modelo no encontrado.");
      }
      interaction.editReply("Cargando el audio...");

      const result = await model.request(textoAVoz);

      const audioBuffer = Buffer.from(await result.getAudio(), "binary");
      fs.writeFileSync("tts_audio.mp3", audioBuffer);

      await interaction.followUp({
        files: ["tts_audio.mp3"],
      });
    } catch (error) {
      console.log(`Ha ocurrido un error con el comando 'fakeyou': ${error}`);
    }
  },
  data: {
    name: "fakeyou",
    description: "Genera un audio con la voz de tu youtuber favorito",
    options: [
      {
        name: "voz",
        description:
          "Pon el nombre de la persona que quieres que recite el texto",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "textardo",
        description: "muestra todas las frases ",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
    ],
  },
};
