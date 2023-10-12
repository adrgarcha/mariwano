const { Client, Message } = require("discord.js");

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 * @returns 
 */
module.exports = (message, client) => {
    if(message.author.bot) return;
        
    if(message.content === 'iyow'){
        message.reply('ke paza iyow');
    }
        
    if(message.content.includes('sale evento')){
        message.reply('el de mis huevos al viento');
    }
}