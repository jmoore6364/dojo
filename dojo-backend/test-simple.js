const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5433,
  user: 'postgres',
  password: 'postgres',
  database: 'dojo_platform'
});

async function test() {
  try {
    console.log('Connecting with:', {
      host: 'localhost',
      port: 5433,
      user: 'postgres',
      password: '***',
      database: 'dojo_platform'
    });
    
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const res = await client.query('SELECT NOW()');
    console.log('Current time:', res.rows[0].now);
    
    await client.end();
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Error code:', err.code);
  }
}

test();