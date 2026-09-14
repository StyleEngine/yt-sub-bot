const db = require('better-sqlite3')('./data.db');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body);
    const { channelId } = body;

    if (!channelId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'channelId required' })
      };
    }

    const insert = db.prepare(`
      INSERT INTO orders (channel_id, status, created_at)
      VALUES (?, 'pending', datetime('now'))
    `);
    const result = insert.run(channelId);

    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(result.lastInsertRowid);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        orderId: order.id,
        message: 'Order created'
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
