import mongoose from 'mongoose';
import Order from './order';

const paymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Types.ObjectId,
    ref: Order.modelName,
    required: [true, 'Order id is required']
  },
  razorpayOrderId: {
    type: String,
    required: [true, 'RazorPay order id is required'],
  },
  razorpayPaymentId: {
    type: String,
    required: [true, 'RazorPay payment id is required'],
  },
  razorpaySignature: {
    type: String,
    required: [true, 'RazorPay signature id is required'],
  },
});

const Payment = mongoose.models.payments || mongoose.model('payments', paymentSchema);

export default Payment;
