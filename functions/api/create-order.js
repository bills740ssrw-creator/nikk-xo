export async function onRequestPost(context) {
  try {
    const { amount, currency = 'INR' } = await context.request.json();

    if (!amount || amount < 100) {
      return new Response(JSON.stringify({ error: 'Minimum amount is 100 paise (₹1)' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const auth = btoa(
      context.env.RAZORPAY_KEY_ID + ':' + context.env.RAZORPAY_KEY_SECRET
    );

    const res = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'basic ' + auth,
      },
      body: JSON.stringify({ amount: parseInt(amount), currency }),
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ error: 'Razorpay API error', status: res.status, response: err }), {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const order = await res.json();
    return new Response(JSON.stringify({
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Failed to create order' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
