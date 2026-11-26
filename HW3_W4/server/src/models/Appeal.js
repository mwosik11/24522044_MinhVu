import mongoose from 'mongoose';
import { GROUNDS, STATEMENT_MAX, STATEMENT_MIN } from '../../../shared/appealRules.js';

const appealSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true, index: true },
    caseRef: { type: String, required: true, unique: true }, // one appeal per case
    email: { type: String, required: true, lowercase: true, trim: true },
    grounds: { type: String, required: true, enum: GROUNDS.map((g) => g.value) },
    contestedCodes: { type: [String], required: true },
    statement: { type: String, required: true, minlength: STATEMENT_MIN, maxlength: STATEMENT_MAX },
    evidenceUrl: { type: String, default: '' },
    acknowledged: { type: Boolean, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const Appeal = mongoose.models.Appeal ?? mongoose.model('Appeal', appealSchema);