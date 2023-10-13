const { Client, Interaction } = require('discord.js');
const User = require('../../models/User');

const dailyAmount = 10000;

module.exports = {
    name: 'daily',
    description: 'Recolecta tus diarias.',

    /**
     * 
     * @param {Client} client 
     * @param {Interaction} interaction 
     */
    callback: async (client, interaction) => {
        if(!interaction.inGuild){
            interaction.reply({
                content: "Solo puedes ejecutar este comando en un servidor.",
                ephemeral: true,
            });
            return;
        }

        try {
            await interaction.deferReply();

            let query = {
                userId: interaction.member.id,
                guildId: interaction.guild.id,
            };

            let user = await User.findOne(query);

            if(user){
                const lastDailyDate = user.lastDaily.toDateString();
                const currentDate = new Date().toDateString();

                if(lastDailyDate === currentDate){
                    interaction.editReply(`Ya has recolectado las diarias de hoy.`);
                    return;
                }
            } else {
                user = new User({
                    ...query,
                    lastDaily: new Date(),
                });
            }

            user.balance += dailyAmount;
            await user.save();

            interaction.editReply(`${dailyAmount} fueron agregados a tu cuenta para comprar marihuana. Ahora mismo tienes ${user.balance}`);
        } catch (error) {
            console.log(`Ha ocurrido un error con las diarias: ${error}`);
        }
    },
}