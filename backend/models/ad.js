'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ad extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Ad.hasMany(models.AdEvent, { foreignKey: 'ad_id', as: 'events' });
    }
  }
  Ad.init({
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    position: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('image', 'html'),
      allowNull: false,
      defaultValue: 'image'
    },
    image: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    html_content: {
      type: DataTypes.TEXT('long'),
      allowNull: true
    },
    link_url: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    link_target: {
      type: DataTypes.ENUM('_blank', '_self'),
      allowNull: false,
      defaultValue: '_blank'
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'scheduled'),
      allowNull: false,
      defaultValue: 'active'
    },
    priority: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    popup_delay: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 5
    },
    popup_frequency: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 24
    },
    width: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    height: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    impressions: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    clicks: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Ad',
    tableName: 'ads',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['position'] },
      { fields: ['status'] }
    ]
  });
  return Ad;
};