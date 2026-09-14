const db = require('better-sqlite3')('./data.db');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    return {
      statusCode: 200,
      body: JSON.stringify({ orders })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
