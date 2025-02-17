import mongoose from 'mongoose';
import Product from './product';
import User from './user';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: User.modelName,
    required: [true, 'User id is required for saving cart'],
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    required: true,
  },
  products: [{
    productId: {
      type: mongoose.Types.ObjectId,
      ref: Product.modelName,
      required: [true, 'Product id of the item in cart is required'],
    },
    groupId: mongoose.Types.ObjectId,
    quantity: {
      type: Number,
      required: [true, 'Ordered quantity can not be empty'],
    },
  }],
}, {
  timestamps: true,
});

// create required index for this model
cartSchema.index({userId: 1});

const Cart = mongoose.models.carts || mongoose.model('carts', cartSchema);

export default Cart;
