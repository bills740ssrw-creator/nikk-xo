const https = require('https');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR' } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum amount is 100 paise (₹1)' });
    }

    const options = {
      hostname: 'api.razorpay.com',
      path: '/v1/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'basic ' + Buffer.from(
          process.env.RAZORPAY_KEY_ID + ':',
        ).toString('base64'),
      },
    };

    const req2 = https.request(options, (res2) => {
      let data = '';

      res2.on('data', (chunk) => {
        data += chunk;
      });

      res2.on('end', () => {
        if (res2.statusCode !== 200) {
          return res.status(res2.statusCode).json({
            error: 'Razorpay API error',
            status: res2.statusCode,
            response: data,
          });
        }
        const order = JSON.parse(data);
        res.status(200).json({
          order_id: order.id,
          amount: order.amount,
          currency: order.currency,
        });
      });
    });

    req2.on('error', (e) => {
      console.error('Razorpay request error:', e);
      res.status(500).json({ error: 'Failed to connect to Razorpay' });
    });

    req2.write(JSON.stringify({ amount: parseInt(amount), currency }));
    req2.end();
  } catch (err) {
    console.error('Create order catch error:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
};