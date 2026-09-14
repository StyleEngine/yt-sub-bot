const { google } = require('googleapis');

exports.handler = async function (event, context) {
  const { channelId, apiKey } = JSON.parse(event.body || '{}');

  if (!channelId || !apiKey) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing channelId or apiKey' }) };
  }

  try {
    const youtube = google.youtube({ version: 'v3', auth: apiKey });
    const res = await youtube.channels.list({
      part: 'statistics,snippet',
      id: channelId
    });

    if (!res.data.items || res.data.items.length === 0) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Channel not found' }) };
    }

    const channel = res.data.items[0];
    const stats = channel.statistics || {};
    return {
      statusCode: 200,
      body: JSON.stringify({
        channelId,
        title: channel.snippet.title,
        subscriberCount: parseInt(stats.subscriberCount, 10) || 0,
        videoCount: parseInt(stats.videoCount, 10) || 0,
        status: 'active'
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};