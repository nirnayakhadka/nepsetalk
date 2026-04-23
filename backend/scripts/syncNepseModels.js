/**
 * scripts/syncNepseModels.js
 *
 * Run once to create / migrate all NEPSE tables:
 *   node scripts/syncNepseModels.js
 *
 * Uses { alter: true } — safe for adding new columns; won't drop data.
 * Switch to { force: true } ONLY in dev to drop and recreate.
 */

require('dotenv').config();
const {
  NepseSnapshot,
  NepsePrice,
  NepseIndex,
  NepseTopMover,
  NepseSector,
  NepseFloorsheet,
  NepseCompany,
  NepseBroker,
  NepseAlert,
  NepseIPO,
  NepseSectorPE,
} = require('../models/nepse');

const models = [
  NepseSnapshot,
  NepsePrice,
  NepseIndex,
  NepseTopMover,
  NepseSector,
  NepseFloorsheet,
  NepseCompany,
  NepseBroker,
  NepseAlert,
  NepseIPO,
  NepseSectorPE,
];

const FORCE = process.argv.includes('--force'); // ⚠️ drops tables

(async () => {
  console.log(`\n🔧 Syncing NEPSE models (force=${FORCE})…\n`);
  for (const Model of models) {
    try {
      await Model.sync({ force: FORCE, alter: !FORCE });
      console.log(`  ✅ ${Model.tableName}`);
    } catch (e) {
      console.error(`  ❌ ${Model.tableName}: ${e.message}`);
    }
  }
  console.log('\n✅ All NEPSE tables synced.\n');
  process.exit(0);
})();