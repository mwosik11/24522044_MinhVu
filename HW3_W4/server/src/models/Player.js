import mongoose from 'mongoose';

const playerSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true, unique: true, match: /^[a-z0-9-]+$/ },
    handle: { type: String, required: true, trim: true, maxlength: 40 },
    realName: { type: String, required: true, trim: true, maxlength: 80 },
    team: { type: String, required: true, trim: true, maxlength: 60 },
    game: { type: String, required: true, trim: true, maxlength: 60 },
    role: { type: String, required: true, trim: true, maxlength: 40 },
  },
  { timestamps: true, versionKey: false },
);

export const Player = mongoose.models.Player ?? mongoose.model('Player', playerSchema);