import mongoose from 'mongoose';
import { Profile } from './models/Profile.js';
import { SEED_PROFILES } from './data/profiles.seed.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing — copy server/.env.example to server/.env');

await mongoose.connect(process.env.MONGODB_URI);
await Profile.deleteMany({});
const inserted = await Profile.insertMany(SEED_PROFILES);
console.log(`Seeded ${inserted.length} profiles into "${mongoose.connection.name}"`);
await mongoose.disconnect();