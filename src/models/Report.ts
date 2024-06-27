const { Schema, model } = require("mongoose");
const { randomUUID } = require("crypto");

const reportSchema = new Schema(
  {
    reportId: {
      type: String,
      default: randomUUID,
    },
    authorId: {
      type: String,
      required: true,
    },
    guildId: {
      type: String,
      required: true,
    },
    messageId: {
      type: String,
      required: true,
      unique: true,
    },
    command: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: "not-solved",
    },
  },
  { timestamps: true }
);

module.exports = model("Report", reportSchema);
