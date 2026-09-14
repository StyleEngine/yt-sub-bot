const { google } = require('googleapis');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.YT_API_KEY;
  const channelId = event.queryStringParameters?.channelId;

  if (!channelId) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: true, data: null })
    };
  }

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: 'YT_API_KEY not configured', data: null })
    };
  }

  const youtube = google.youtube({ version: 'v3', auth: apiKey });

  try {
    let resolvedChannelId = channelId;

    if (!channelId.startsWith('UC') && channelId.length < 24) {
      const searchRes = await youtube.search.list({
        part: 'snippet',
        q: channelId,
        type: 'channel',
        maxResults: 1
      });

      const channelResult = searchRes.data.items?.[0];
      if (channelResult?.id?.channelId) {
        resolvedChannelId = channelResult.id.channelId;
      } else {
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ valid: false, error: 'Channel not found', data: null })
        };
      }
    }

    const res = await youtube.channels.list({
      part: 'snippet,statistics',
      id: resolvedChannelId
    });

    const item = res.data.items?.[0];
    if (!item) {
      return {
        statusCode: 404,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valid: false, error: 'Channel not found', data: null })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valid: true,
        data: {
          channelName: item.snippet?.title || 'Unknown',
          channelId: item.id,
          subscribers: item.statistics?.subscriberCount || '--',
          viewCount: item.statistics?.viewCount || '--',
          videoCount: item.statistics?.videoCount || '--',
          description: item.snippet?.description?.substring(0, 200) || ''
        }
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: err.message, data: null })
    };
  }
};
