import mongoose from 'mongoose';
import { Player } from './models/Player.js';
import { Case } from './models/Case.js';
import { Appeal } from './models/Appeal.js';
import { SEED_PLAYERS, buildSeedCases } from './data/seed.data.js';

if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI missing — copy server/.env.example to server/.env');

await mongoose.connect(process.env.MONGODB_URI);
await Promise.all([Player.deleteMany({}), Case.deleteMany({}), Appeal.deleteMany({})]);
await Player.insertMany(SEED_PLAYERS);
const cases = await Case.insertMany(buildSeedCases());

console.log(`Seeded ${SEED_PLAYERS.length} players and ${cases.length} cases into "${mongoose.connection.name}"`);
for (const c of cases) console.log(`  ${c.playerId}: appeal deadline ${c.appealDeadline.toISOString()}`);
await mongoose.disconnect();