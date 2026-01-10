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
      type: Number,
      get: (n: number) => Math.floor(n),
      set: (n: number) => Math.floor(n),
      default: 0,
   },
   lastDaily: {
      type: Date,
      default: new Date(0),
   },
   dailyStreak: {
      type: Number,
      default: 0,
   },
   lastWeekly: {
      type: Date,
      default: new Date(0),
   },
   weeklyStreak: {
      type: Number,
      default: 0,
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
      type: Number,
      get: (n: number) => Math.floor(n),
      set: (n: number) => Math.floor(n),
      default: 0,
   },
   investBankFactor: {
      type: Number,
      get: (n: number) => Math.floor(n),
      set: (n: number) => Math.floor(n),
      default: 0,
   },
   investFactor: {
      type: Number,
      get: (n: number) => Math.floor(n),
      set: (n: number) => Math.floor(n),
      default: 0,
   },
});

export const User = model('User', userSchema);
