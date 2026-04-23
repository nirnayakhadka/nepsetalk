'use strict';

const { Op, fn, col } = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  const NepseSnapshot = sequelize.define(
    'NepseSnapshot',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      source: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'unknown',
      },
      indexValue: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
      },
      change: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      changePercent: {
        type: DataTypes.DECIMAL(8, 4),
        defaultValue: 0,
      },
      turnover: {
        type: DataTypes.DECIMAL(18, 4),
        defaultValue: 0,
        comment: 'In Billions NPR',
      },
      totalScrips: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      gainers: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      losers: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isMarketOpen: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      payload: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Full normalized response for frontend',
      },
      fetchSchedule: {
        type: DataTypes.ENUM('morning', 'midday', 'closing', 'manual', 'live'),
        defaultValue: 'live',
      },
    },
    {
  tableName: 'nepse_snapshots',
  timestamps: true,
  underscored: true,   // ← maps camelCase fields to snake_case columns
  indexes: [
    { fields: ['created_at'] },
    { fields: ['source'] },
    { fields: ['index_value'] },
  ],
}

  );

  NepseSnapshot.getHistory = async function (days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return NepseSnapshot.findAll({
      where: { createdAt: { [Op.gte]: since } },
      order: [['createdAt', 'ASC']],
      attributes: ['id', 'indexValue', 'change', 'changePercent', 'turnover', 'gainers', 'losers', 'createdAt'],
    });
  };

  NepseSnapshot.getDailyStats = async function (days = 90) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return NepseSnapshot.findAll({
      where: { createdAt: { [Op.gte]: since } },
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('MAX', col('indexValue')), 'high'],
        [fn('MIN', col('indexValue')), 'low'],
        [fn('AVG', col('indexValue')), 'avg'],
        [fn('SUM', col('turnover')), 'totalTurnover'],
      ],
      group: [fn('DATE', col('createdAt'))],
      order: [[fn('DATE', col('createdAt')), 'ASC']],
      raw: true,
    });
  };

  return NepseSnapshot;
};