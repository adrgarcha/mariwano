import { Schema, model } from 'mongoose';

const autoRoleSchema = new Schema({
   guildId: {
      type: String,
      required: true,
      unique: true,
   },
   roleId: {
      type: String,
      required: true,
   },
});

export const AutoRole = model('AutoRole', autoRoleSchema);
