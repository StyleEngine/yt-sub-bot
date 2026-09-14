const { OAuth2Client } = require('google-auth-library');

exports.handler = async function(event, context) {
  const CLIENT_ID = process.env.YT_CLIENT_ID;
  const CLIENT_SECRET = process.env.YT_CLIENT_SECRET;
  const REDIRECT_URI = process.env.YT_REDIRECT_URI || `${process.env.URL}/.netlify/functions/auth-callback`;

  const url = new URL(event.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No authorization code received' }) };
  }

  const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    return {
      statusCode: 200,
      body: JSON.stringify({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to exchange code for token', details: err.message })
    };
  }
};
