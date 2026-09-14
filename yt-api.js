const { google } = require('googleapis');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.YT_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'YT_API_KEY is not configured' })
    };
  }

  const youtube = google.youtube({ version: 'v3', auth: apiKey });

  try {
    const res = await youtube.channels.list({
      part: 'snippet',
      mine: true
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ valid: true, channelCount: res.data.items?.length || 0 })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ valid: false, error: err.message })
    };
  }
};