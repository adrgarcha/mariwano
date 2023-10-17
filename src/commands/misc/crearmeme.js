const {
  Client,
  GatewayIntentBits,
  ApplicationCommandOptionType,
} = require("discord.js");
const Jimp = require("jimp");

module.exports = {
  run: async ({ interaction, client }) => {
    const textoSuperior = interaction.options.getString("textoarriba");
    const textoInferior = interaction.options.getString("textoabajo");
    const url = interaction.options.getString("urlimagen");
    const efecto = interaction.options.get("efectos")?.value;
    try {
      const imageObject = await Jimp.read(url);
      if (efecto) {
        try {
          switch (efecto) {
            case 1:
              imageObject.flip(false, true);
              break;
            case 2:
              imageObject.blur(5);
              break;
            case 3:
              imageObject.fisheye();
              break;
            case 4:
              imageObject.invert();
              break;
            case 5:
              imageObject.rotate(90);
              break;
          }
        } catch (err) {
          console.error(err);
          await interaction.reply(
            `Hubo un error al añadir efecto: ${err.message}`
          );
        }
      }
      const font = await Jimp.loadFont("./roboto.fnt");

      imageObject.print(
        font,
        0,
        0,
        {
          text: textoSuperior,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_TOP,
        },
        imageObject.getWidth(),
        imageObject.getHeight()
      );

      imageObject.print(
        font,
        0,
        0,
        {
          text: textoInferior,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_BOTTOM,
        },
        imageObject.getWidth(),
        imageObject.getHeight()
      );

      const memeBuffer = await imageObject.getBufferAsync(Jimp.MIME_PNG);
      await interaction.reply({ files: [memeBuffer] });
    } catch (e) {
      console.error(e);
      await interaction.reply(`Hubo un error al crear el meme: ${e.message}`);
    }
  },
  data: {
    name: "crearmeme",
    description: "adhiere un texto arriba y abajo de una foto",
    options: [
      {
        name: "textoarriba",
        description: "texto de arriba de la foto",
        type: ApplicationCommandOptionType.String,
        max_length: 75,
        required: true,
      },
      {
        name: "textoabajo",
        description: "texto de abajo de la foto",
        type: ApplicationCommandOptionType.String,
        max_length: 75,
        required: true,
      },
      {
        name: "urlimagen",
        description: "URL de la imagen",
        type: ApplicationCommandOptionType.String,
        required: true,
      },
      {
        name: "efectos",
        description: "añadir efectos a la imagen",
        type: ApplicationCommandOptionType.Integer,
        choices: [
          {
            name: "invertir",
            value: 1,
          },
          {
            name: "desenfocar",
            value: 2,
          },
          {
            name: "esferizar",
            value: 3,
          },
          {
            name: "invertir_color",
            value: 4,
          },
          {
            name: "rotar",
            value: 5,
          },
        ],
      },
    ],
  },
};
