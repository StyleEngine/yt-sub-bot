const orders = [];

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const channelId = event.queryStringParameters?.channelId || null;

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      success: true,
      channelId: channelId,
      orders: orders.filter(o => !channelId || o.channelId === channelId),
      total: orders.length
    })
  };
};
