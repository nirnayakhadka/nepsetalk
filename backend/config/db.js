const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'nepsetalk_cms',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
    logging: false
  }
);

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || '127.0.0.1',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'nepsetalk_cms',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Sequelize connected to MySQL successfully');
  } catch (err) {
    console.error('❌ Sequelize connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = { sequelize, sequelizeInstance: sequelize, testConnection, pool };