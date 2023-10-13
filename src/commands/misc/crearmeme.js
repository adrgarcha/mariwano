const { Client, GatewayIntentBits, ApplicationCommandOptionType } = require('discord.js');
const Jimp = require('jimp');

module.exports = {
    run: async ({ interaction, client }) => {
        const textoSuperior = interaction.options.getString("textoarriba");
        const textoInferior = interaction.options.getString("textoabajo");
        const url = interaction.options.getString("urlimagen");

        try {
            const imageObject = await Jimp.read(url);
            const font = await Jimp.loadFont("./roboto.fnt");

            imageObject.print(
                font, 0, 0, {
                    text: textoSuperior,
                    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    alignmentY: Jimp.VERTICAL_ALIGN_TOP,
                },
                imageObject.getWidth(),
                imageObject.getHeight()
            );

            imageObject.print(
                font, 0, 0, {
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
            }
        ],
    }
}
