const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'INR', receipt } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ error: 'Minimum amount is 100 paise (₹1)' });
    }

    const order = await razorpay.orders.create({
      amount: parseInt(amount),
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    res.status(200).json({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.error('Create order error:', err);
    if (err.statusCode === 401) {
      return res.status(401).json({ error: 'Invalid Razorpay credentials' });
    }
    res.status(500).json({ error: 'Failed to create order' });
  }
};