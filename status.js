const { google } = require('googleapis');

exports.handler = async function(event, context) {
  const YT_API_KEY = process.env.YT_API_KEY;
  const CLIENT_ID = process.env.YT_CLIENT_ID;
  const CLIENT_SECRET = process.env.YT_CLIENT_SECRET;

  const youtube = google.youtube({ version: 'v3', auth: YT_API_KEY });

  try {
    const res = await youtube.channels.list({
      part: 'snippet,statistics',
      mine: true
    });

    if (res.data.items && res.data.items.length > 0) {
      const channel = res.data.items[0];
      const quotaUsed = parseInt(res.headers['x-google-quota-usage'] || '0', 10);
      const quotaMax = parseInt(res.headers['x-google-quota-max'] || '10000', 10);

      return {
        statusCode: 200,
        body: JSON.stringify({
          email: channel.snippet.title,
          quotaUsed: quotaUsed,
          quotaMax: quotaMax,
          subscriberCount: channel.statistics.subscriberCount
        })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ email: 'Unknown', quotaUsed: 0, quotaMax: 10000 })
    };
  } catch (err) {
    return {
      statusCode: 200,
      body: JSON.stringify({ email: 'Not authenticated', quotaUsed: 0, quotaMax: 10000 })
    };
  }
};