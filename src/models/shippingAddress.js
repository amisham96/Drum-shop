import mongoose from 'mongoose';
import User from './user';

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: User.modelName,
    required: [true, 'User id is required to save address'],
  },
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
});

const ShippingAddress = mongoose.models.address || mongoose.model('address', addressSchema);

export default ShippingAddress;
