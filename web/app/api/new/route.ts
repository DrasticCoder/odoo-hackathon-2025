import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, note } = body;

    if (!amount || amount <= 0 || isNaN(amount)) {
      return new Response(JSON.stringify({ error: 'Amount is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const apiResponse = await fetch('https://api.razorpay.com/v1/payment_pages/pl_QH1JaW8Um6l2kt/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notes: {
          comment: note,
        },
        line_items: [
          {
            payment_page_item_id: 'ppi_QH1JaYgyQ1NfWP',
            amount: amount,
          },
        ],
      }),
    });

    const responseData = await apiResponse.json();
    const orderID = responseData.order.id;
    return new Response(
      JSON.stringify({
        orderID,
        key_id: 'rzp_live_oauth_QH0ZpRGiOuJDWW',
        payment_link_id: 'pl_QH1JaW8Um6l2kt',
        amount,
        currency: 'INR',
      }),
      {
        status: apiResponse.status,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
