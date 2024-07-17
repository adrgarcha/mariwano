import { Schema, model } from 'mongoose';

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
      type: BigInt,
      default: 0,
   },
   lastDaily: {
      type: Date,
      default: new Date(),
   },
   lastWordle: {
      type: Date,
      default: new Date(),
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
      default: '',
   },
   invested: {
      type: BigInt,
      default: 0,
   },
   investBankFactor: {
      type: Number,
      default: 0,
   },
   investFactor: {
      type: Number,
      default: 0,
   },
});

export const User = model('User', userSchema);
