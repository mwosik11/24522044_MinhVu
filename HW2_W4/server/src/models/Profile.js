import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    // Stable, URL-safe id used by the client and by Swipe.profileSlug.
    slug: { type: String, required: true, unique: true, trim: true, match: /^[a-z0-9-]+$/ },
    name: { type: String, required: true, trim: true, maxlength: 60 },
    age: { type: Number, required: true, min: 18, max: 99 },
    city: { type: String, required: true, trim: true, maxlength: 60 },
    bio: { type: String, required: true, trim: true, maxlength: 280 },
    greenFlags: { type: [String], default: [] },
    redFlags: { type: [String], default: [] },
    // Display order of the deck (lower first).
    order: { type: Number, required: true },
  },
  { timestamps: true, versionKey: false },
);

export const Profile = mongoose.models.Profile ?? mongoose.model('Profile', profileSchema);