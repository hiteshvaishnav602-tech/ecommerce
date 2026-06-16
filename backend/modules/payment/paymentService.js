import Razorpay from 'razorpay';
import crypto from 'crypto';

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

let razorpay = null;
if (keyId !== 'rzp_test_demo') {
  try {
    razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  } catch (e) {
    console.error('Failed to initialize Razorpay:', e.message);
  }
}

export const createRazorpayOrder = async (amount, currency = 'INR', receipt = '') => {
  if (keyId === 'rzp_test_demo') {
    return {
      id: `order_mock_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      amount: Math.round(amount * 100),
      currency,
      receipt,
      status: 'created',
    };
  }
  const options = {
    amount: Math.round(amount * 100), // Razorpay uses paise
    currency,
    receipt,
    payment_capture: 1,
  };
  return await razorpay.orders.create(options);
};

export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  if (keyId === 'rzp_test_demo') {
    return signature === 'mock_signature_success';
  }
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return expectedSignature === signature;
};

export const getRazorpayKey = () => keyId;
