const { Schema, model } = require("mongoose");

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
  lastWordle: {
    type: Date,
  },
  kahootLimit: {
    type: Number,
    default: 5,
  },
  lastKahoot: {
    type: Date,
    default: new Date(),
  },
  customRoleId: {
    type: String,
    default: "",
  },
  invested: {
    type: Number,
    default: 0,
  },
  investBankFactor: {
    type: Number,
    default: 0,
  },
  investFactor: {
    type: Number,
    default: 0,
  }

});

module.exports = model("User", userSchema);
