const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = '/tmp/yt-sub-bot.db';

function getDb() {
  const db = new sqlite3.Database(DB_PATH);
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channelId TEXT,
    channelName TEXT,
    status TEXT DEFAULT 'pending',
    createdAt TEXT
  )`);
  return db;
}

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const db = getDb();

  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM orders ORDER BY id DESC', [], (err, rows) => {
      db.close();
      if (err) {
        return resolve({
          statusCode: 200,
          body: JSON.stringify({ orders: [] })
        });
      }
      resolve({
        statusCode: 200,
        body: JSON.stringify({ orders: rows || [] })
      });
    });
  });
};