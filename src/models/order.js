import mongoose from 'mongoose';
import Cart from './cart';
import User from './user';

/**
 * Address is copied to each 'order', so that it
 * is not lost after(if) it is deleted by the user.
 */

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: User.modelName,
    required: [true, 'User id is required to save address'],
  },

  address: {  
    name: {
      type: String,
      required: [true, 'Name can\'t be empty'],
      minLength: [1, 'Name can\'t be empty'],
      maxLength: [50, 'Name can\'t exceed 50 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number can\'t be empty'],
      minLength: [1, 'Phone number can\'t be empty'],
      maxLength: [10, 'Phone number can\'t exceed 10 characters'],
    },
    address: {
      type: String,
      required: [true, 'Address can\'t be empty'],
      minLength: [1, 'Address can\'t be empty'],
      maxLength: [300, 'Address can\'t exceed 300 characters'],
    },
    city: {
      type: String,
      required: [true, 'City can\'t be empty'],
      minLength: [1, 'City can\'t be empty'],
      maxLength: [50, 'City can\'t exceed 50 characters'],
    },
    pinCode: {
      type: String,
      required: [true, 'Pin code can\'t be empty'],
      minLength: [1, 'Pin code can\'t be empty'],
      maxLength: [6, 'Pin code can\'t exceed 6 characters'],
    },
    state: {
      type: String,
      required: [true, 'State can\'t be empty'],
      minLength: [1, 'State can\'t be empty'],
    },
    landmark: String,
    addressType: String,
  },

  cartId: {
    type: mongoose.Types.ObjectId,
    ref: Cart.modelName,
    required: [true, 'User id is required to save address'],
  },  

  price: Number, 
  discount: Number,
  shippingCharges: Number,
  total: Number,

  paymentStatus: {
    type: String,
    enum: ['not_paid', 'paid'],
    default: 'not_paid',
  },

  orderStatus: {
    type: String,
    enum: [
      'pending', 
      'processing', 
      'shipped', 
      'delivered', 
      'cancelled',
      'refunded',
      'failed'
    ],
    default: 'pending',
  },
}, {
  timestamps: true,
});

const Order = mongoose.models.orders || mongoose.model('orders', orderSchema);

export default Order;
