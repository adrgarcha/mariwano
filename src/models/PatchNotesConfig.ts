import mongoose from 'mongoose';

const PatchNotesConfigSchema = new mongoose.Schema({
   guildId: { type: String, required: true, unique: true },
   channelId: { type: String, required: true },
   lastReleaseId: { type: String },
});

export const PatchNotesConfig = mongoose.model('PatchNotesConfig', PatchNotesConfigSchema);
