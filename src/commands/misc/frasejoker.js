const { ApplicationCommandOptionType } = require("discord.js");
const frasesJoker = ['quien madruga se encuentra con todo cerrado😔🤙',
        'para mi el locomotor es solo motor🥵😫',
        'el tiempo sin ti es empo🙏🤟',
        'a veces las personas más frías solo necesitan un sueter😯🥶',
        'la piedad es la edad de los pies😔🤙'];
module.exports = {

    callback: async (client, interaction) => {
        await interaction.deferReply();
        
        const fraseAgregada = interaction.options.get("add")?.value;
        const frases = interaction.options.get("all")?.value;
        
        if(fraseAgregada){
            frasesJoker.push(fraseAgregada);
            interaction.editReply(`Se ha agregado la frase ${fraseAgregada}.`);
            return;
        }
        if(frases){
            interaction.editReply(frasesJoker.join("\n"));
            return;
        }
        const fraseJoker = frasesJoker[Math.floor(Math.random() * frasesJoker.length)];
        interaction.editReply(`${fraseJoker}`);
    },
    name: "frasejoker", 
    description: "Dropea una frase aleatoria que diría el joker",
    options: [
        {
            name: "add",
            description: "añade una frase",
            type: ApplicationCommandOptionType.String,
        },
        {
            name: "all",
            description: "muestra todas las frases (no usar, solo para el admin)",
            type: ApplicationCommandOptionType.Boolean,
        }
    ],
}