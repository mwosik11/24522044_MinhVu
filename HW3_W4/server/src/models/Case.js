import mongoose from 'mongoose';
import { VIOLATION_TYPES } from '../../../shared/guidelines.js';

const violationSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, match: /^V\d+$/ },
    type: { type: String, required: true, enum: VIOLATION_TYPES },
    matchId: { type: String, required: true },
    evidenceStrength: { type: Number, required: true, min: 0, max: 1 },
    sanctionDays: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const caseSchema = new mongoose.Schema(
  {
    playerId: { type: String, required: true, unique: true }, // one open case per player
    caseRef: { type: String, required: true, unique: true, match: /^FP-\d{4}-\d{4}$/ },
    verdictAt: { type: Date, required: true },
    appealDeadline: { type: Date, required: true },
    violations: { type: [violationSchema], default: [] },
  },
  { timestamps: true, versionKey: false },
);

export const Case = mongoose.models.Case ?? mongoose.model('Case', caseSchema);