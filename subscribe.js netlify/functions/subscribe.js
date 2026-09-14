const { google } = require('googleapis');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const YT_API_KEY = process.env.YT_API_KEY;
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
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const body = JSON.parse(event.body || '{}');
  const channelId = body.channelId;

  if (!channelId) {
    return { statusCode: 400, body: JSON.stringify({ error: 'channelId is required' }) };
  }

  const youtube = google.youtube({ version: 'v3', auth: YT_API_KEY });

  try {
    const res = await youtube.channels.list({
      part: 'snippet',
      id: channelId
    });

    let channelName = channelId;
    if (res.data.items && res.data.items.length > 0) {
      channelName = res.data.items[0].snippet.title;
    }

    const db = getDb();
    const createdAt = new Date().toISOString();

    db.run(
      'INSERT INTO orders (channelId, channelName, status, createdAt) VALUES (?, ?, ?, ?)',
      [channelId, channelName, 'pending', createdAt],
      function(err) {
        db.close();
        if (err) {
          return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Database error', details: err.message })
          };
        }
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, orderId: this.lastID })
        };
      }
    );
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch channel info', details: err.message })
    };
  }
};
