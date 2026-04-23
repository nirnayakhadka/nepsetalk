'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdEvent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      AdEvent.belongsTo(models.Ad, { foreignKey: 'ad_id', as: 'ad' });
    }
  }
  AdEvent.init({
    id: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    ad_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'ads',
        key: 'id'
      }
    },
    event_type: {
      type: DataTypes.ENUM('impression', 'click'),
      allowNull: false
    },
    ip: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    page_url: {
      type: DataTypes.STRING(1000),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'AdEvent',
    tableName: 'ad_events',
    timestamps: false,
    indexes: [
      { fields: ['ad_id'] },
      { fields: ['event_type'] }
    ]
  });
  return AdEvent;
};