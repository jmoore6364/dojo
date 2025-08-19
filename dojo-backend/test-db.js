const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('dojo_platform', 'postgres', 'postgres', {
  host: 'localhost',
  port: 5432,
  dialect: 'postgres',
  logging: console.log,
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    console.error('Full error:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();