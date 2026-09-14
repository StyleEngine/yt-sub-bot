const { GoogleAuth } = require('google-auth-library');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const CLIENT_ID = process.env.YT_CLIENT_ID;
  const CLIENT_SECRET = process.env.YT_CLIENT_SECRET;
  const REDIRECT_URI = process.env.YT_REDIRECT_URI || `${process.env.URL}/.netlify/functions/auth-callback`;

  const state = Math.random().toString(36).substring(2, 15);

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&response_type=code` +
    `&scope=https://www.googleapis.com/auth/youtube.readonly` +
    `&access_type=offline` +
    `&state=${state}` +
    `&prompt=consent`;

  return {
    statusCode: 200,
    body: JSON.stringify({ authUrl, state })
  };
};