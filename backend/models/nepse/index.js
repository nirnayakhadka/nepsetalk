/**
 * models/nepse/index.js
 *
 * Sequelize models for every NEPSE data type.
 *
 * Tables created:
 *   nepse_snapshots          – full raw payload from every scheduled fetch
 *   nepse_prices             – per-scrip daily OHLCV (upserted on each fetch)
 *   nepse_indices            – market index history (NEPSE, Sensitive, Float, etc.)
 *   nepse_top_movers         – top gainers / losers / turnover snapshots
 *   nepse_sector_summary     – sector-wise index & turnover
 *   nepse_floorsheet         – individual trade records (broker-level)
 *   nepse_companies          – company master list
 *   nepse_brokers            – broker master list
 *   nepse_alerts             – NEPSE announcements / news bulletins
 *   nepse_ipo_calendar       – upcoming & past IPOs
 *   nepse_sector_pe          – sector PE ratios from NepseAlpha
 *
 * Usage:
 *   const { NepsePrice, NepseIndex, ... } = require('./models/nepse');
 */

const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/db').sequelizeInstance; // adjust to your setup

// ─── 1. Full raw snapshots ────────────────────────────────────────────────
class NepseSnapshot extends Model {}
NepseSnapshot.init(
  {
    id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    fetchSchedule: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'manual' },
    isMarketOpen:  { type: DataTypes.BOOLEAN, defaultValue: false },
    marketIndexValue: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    payload:       { type: DataTypes.JSON, allowNull: false }, // full _raw blob
    fetchedAt:     { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: 'NepseSnapshot', tableName: 'nepse_snapshots', timestamps: true }
);

// ─── 2. Per-scrip prices (upserted) ──────────────────────────────────────
class NepsePrice extends Model {}
NepsePrice.init(
  {
    id:             { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    symbol:         { type: DataTypes.STRING(20), allowNull: false },
    tradeDate:      { type: DataTypes.DATEONLY, allowNull: false },
    ltp:            { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    openPrice:      { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    highPrice:      { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    lowPrice:       { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    prevClose:      { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    change:         { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    percentChange:  { type: DataTypes.DECIMAL(8, 4), allowNull: true },
    volume:         { type: DataTypes.BIGINT, allowNull: true },
    turnover:       { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    transactions:   { type: DataTypes.INTEGER, allowNull: true },
    week52High:     { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    week52Low:      { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    source:         { type: DataTypes.STRING(30), defaultValue: 'nepalstock' },
    fetchedAt:      { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'NepsePrice',
    tableName: 'nepse_prices',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['symbol', 'tradeDate'] },
      { fields: ['tradeDate'] },
      { fields: ['symbol'] },
    ],
  }
);

// ─── 3. Market indices history ────────────────────────────────────────────
class NepseIndex extends Model {}
NepseIndex.init(
  {
    id:           { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    indexName:    { type: DataTypes.STRING(60), allowNull: false },
    tradeDate:    { type: DataTypes.DATEONLY, allowNull: false },
    indexValue:   { type: DataTypes.DECIMAL(12, 4), allowNull: true },
    change:       { type: DataTypes.DECIMAL(10, 4), allowNull: true },
    percentChange:{ type: DataTypes.DECIMAL(8, 4), allowNull: true },
    turnover:     { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    source:       { type: DataTypes.STRING(30), defaultValue: 'nepalstock' },
    fetchedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'NepseIndex',
    tableName: 'nepse_indices',
    timestamps: false,
    indexes: [
      { unique: true, fields: ['indexName', 'tradeDate'] },
      { fields: ['tradeDate'] },
    ],
  }
);

// ─── 4. Top movers snapshot ───────────────────────────────────────────────
class NepseTopMover extends Model {}
NepseTopMover.init(
  {
    id:           { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tradeDate:    { type: DataTypes.DATEONLY, allowNull: false },
    category:     { type: DataTypes.ENUM('gainer','loser','turnover','volume','transactions'), allowNull: false },
    rank:         { type: DataTypes.TINYINT, allowNull: false },
    symbol:       { type: DataTypes.STRING(20), allowNull: false },
    ltp:          { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    change:       { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    percentChange:{ type: DataTypes.DECIMAL(8, 4), allowNull: true },
    turnover:     { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    volume:       { type: DataTypes.BIGINT, allowNull: true },
    source:       { type: DataTypes.STRING(30), defaultValue: 'nepalstock' },
    fetchedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'NepseTopMover',
    tableName: 'nepse_top_movers',
    timestamps: false,
    indexes: [{ fields: ['tradeDate', 'category'] }],
  }
);

// ─── 5. Sector summary ────────────────────────────────────────────────────
class NepseSector extends Model {}
NepseSector.init(
  {
    id:           { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tradeDate:    { type: DataTypes.DATEONLY, allowNull: false },
    sectorName:   { type: DataTypes.STRING(80), allowNull: false },
    indexValue:   { type: DataTypes.DECIMAL(12, 4), allowNull: true },
    change:       { type: DataTypes.DECIMAL(10, 4), allowNull: true },
    percentChange:{ type: DataTypes.DECIMAL(8, 4), allowNull: true },
    turnover:     { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    source:       { type: DataTypes.STRING(30), defaultValue: 'nepalstock' },
    fetchedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'NepseSector',
    tableName: 'nepse_sector_summary',
    timestamps: false,
    indexes: [{ unique: true, fields: ['tradeDate', 'sectorName'] }],
  }
);

// ─── 6. Floorsheet (individual trades) ───────────────────────────────────
class NepseFloorsheet extends Model {}
NepseFloorsheet.init(
  {
    id:           { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    tradeDate:    { type: DataTypes.DATEONLY, allowNull: false },
    contractNo:   { type: DataTypes.STRING(40), allowNull: true },
    symbol:       { type: DataTypes.STRING(20), allowNull: false },
    buyerBroker:  { type: DataTypes.SMALLINT, allowNull: true },
    sellerBroker: { type: DataTypes.SMALLINT, allowNull: true },
    quantity:     { type: DataTypes.INTEGER, allowNull: true },
    rate:         { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    amount:       { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    fetchedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'NepseFloorsheet',
    tableName: 'nepse_floorsheet',
    timestamps: false,
    indexes: [
      { fields: ['tradeDate'] },
      { fields: ['symbol', 'tradeDate'] },
      { fields: ['contractNo'] },
    ],
  }
);

// ─── 7. Company master list ───────────────────────────────────────────────
class NepseCompany extends Model {}
NepseCompany.init(
  {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    symbol:       { type: DataTypes.STRING(20), allowNull: false, unique: true },
    name:         { type: DataTypes.STRING(200), allowNull: false },
    sector:       { type: DataTypes.STRING(80), allowNull: true },
    listedShares: { type: DataTypes.BIGINT, allowNull: true },
    paidUpValue:  { type: DataTypes.DECIMAL(12, 2), allowNull: true },
    totalPaidUp:  { type: DataTypes.DECIMAL(18, 2), allowNull: true },
    marketCap:    { type: DataTypes.DECIMAL(20, 2), allowNull: true },
    isin:         { type: DataTypes.STRING(20), allowNull: true },
    listingDate:  { type: DataTypes.DATEONLY, allowNull: true },
    source:       { type: DataTypes.STRING(30), defaultValue: 'nepalstock' },
    updatedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'NepseCompany',
    tableName: 'nepse_companies',
    timestamps: false,
    indexes: [{ fields: ['sector'] }],
  }
);

// ─── 8. Broker master list ────────────────────────────────────────────────
class NepseBroker extends Model {}
NepseBroker.init(
  {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    brokerNo:     { type: DataTypes.SMALLINT, allowNull: false, unique: true },
    name:         { type: DataTypes.STRING(200), allowNull: false },
    contact:      { type: DataTypes.STRING(100), allowNull: true },
    email:        { type: DataTypes.STRING(100), allowNull: true },
    address:      { type: DataTypes.STRING(200), allowNull: true },
    source:       { type: DataTypes.STRING(30), defaultValue: 'nepalstock' },
    updatedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'NepseBroker',
    tableName: 'nepse_brokers',
    timestamps: false,
  }
);

// ─── 9. Alerts / announcements ────────────────────────────────────────────
class NepseAlert extends Model {}
NepseAlert.init(
  {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    externalId:   { type: DataTypes.STRING(60), allowNull: true },
    title:        { type: DataTypes.STRING(500), allowNull: false },
    description:  { type: DataTypes.TEXT, allowNull: true },
    publishedAt:  { type: DataTypes.DATE, allowNull: true },
    url:          { type: DataTypes.STRING(500), allowNull: true },
    source:       { type: DataTypes.STRING(30), defaultValue: 'nepalstock' },
    fetchedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'NepseAlert',
    tableName: 'nepse_alerts',
    timestamps: false,
    indexes: [{ fields: ['publishedAt'] }, { fields: ['source'] }],
  }
);

// ─── 10. IPO calendar ─────────────────────────────────────────────────────
class NepseIPO extends Model {}
NepseIPO.init(
  {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    company:      { type: DataTypes.STRING(200), allowNull: false },
    symbol:       { type: DataTypes.STRING(20), allowNull: true },
    type:         { type: DataTypes.STRING(30), allowNull: true },  // IPO, FPO, Right, Debenture
    units:        { type: DataTypes.STRING(30), allowNull: true },
    openDate:     { type: DataTypes.DATEONLY, allowNull: true },
    closeDate:    { type: DataTypes.DATEONLY, allowNull: true },
    pricePerUnit: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
    status:       { type: DataTypes.STRING(20), defaultValue: 'upcoming' }, // upcoming|open|closed
    source:       { type: DataTypes.STRING(30), defaultValue: 'sharesansar' },
    fetchedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'NepseIPO',
    tableName: 'nepse_ipo_calendar',
    timestamps: false,
    indexes: [{ fields: ['openDate'] }, { fields: ['status'] }],
  }
);

// ─── 11. Sector PE ratios ─────────────────────────────────────────────────
class NepseSectorPE extends Model {}
NepseSectorPE.init(
  {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    tradeDate:    { type: DataTypes.DATEONLY, allowNull: false },
    sectorName:   { type: DataTypes.STRING(80), allowNull: false },
    pe:           { type: DataTypes.DECIMAL(10, 4), allowNull: true },
    pb:           { type: DataTypes.DECIMAL(10, 4), allowNull: true },
    roe:          { type: DataTypes.DECIMAL(10, 4), allowNull: true },
    source:       { type: DataTypes.STRING(30), defaultValue: 'nepsealpha' },
    fetchedAt:    { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,
    modelName: 'NepseSectorPE',
    tableName: 'nepse_sector_pe',
    timestamps: false,
    indexes: [{ unique: true, fields: ['tradeDate', 'sectorName'] }],
  }
);

module.exports = {
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
};