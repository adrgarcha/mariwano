const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    guildId: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 0,
    },
    lastDaily: {
        type: Date,
    },
    kahootLimit:{
        type: Number,
        default: 0,
    },
    lastKahoot:{
        type: Date,
    }
});

module.exports = model('User', userSchema);