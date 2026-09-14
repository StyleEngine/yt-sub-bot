// In-memory order store — resets on each function cold start.
// For persistent storage, swap this for a database or Supabase table.
const orders = [];

exports.handler = async function (event, context) {
  if (event.httpMethod === 'GET') {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders })
    };
  }

  if (event.httpMethod === 'POST') {
    const { channelId, apiKey } = JSON.parse(event.body || '{}');
    if (!channelId || !apiKey) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing channelId or apiKey' }) };
    }

    const order = {
      id: 'ord_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
      channelId,
      apiKey,
      subscriberCount: null,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Try to fetch current subscriber count
    try {
      const youtube = require('googleapis').google.youtube({ version: 'v3', auth: apiKey });
      const res = await youtube.channels.list({
        part: 'statistics',
        id: channelId
      });
      if (res.data.items && res.data.items.length > 0) {
        order.subscriberCount = parseInt(res.data.items[0].statistics.subscriberCount, 10) || 0;
        order.status = 'active';
      } else {
        order.status = 'not_found';
      }
    } catch (err) {
      order.status = 'error';
      order.error = err.message;
    }

    orders.push(order);

    return {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order })
    };
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
};
