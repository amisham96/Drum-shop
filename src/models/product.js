import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minLength: [1, 'Product name can\'t be empty'],
    maxLength: [150, 'Product name can\'t exceed 150 characters'],
  },
  category: {
    type: String,
    trim: true,
    minLength: [1, 'Category can\'t be empty'],
    maxLength: [50, 'Category can\'t exceed 50 characters'],
  },
  brand: {
    type: String,
    required: [true, 'Brand of the product is required'],
    trim: true,
    minLength: [1, 'Brand can\'t be empty'],
    maxLength: [50, 'Brand can\'t exceed 50 characters'],
  },
  model: {
    type: String,
    required: [true, 'Model(SKU) of the product is required'],
    trim: true,
  },

  // price related fields
  costPrice: {
    type: Number
  },
  sellingPrice: {
    type: Number
  },
  cgst: {
    type: Number
  },
  sgst: {
    type: Number
  },
  discount: {
    type: Number
  },
  hsnCode: {
    type: Number
  },

  // this quantity would be used if the product doesn't have any variants
  quantity: Number,

  description: {
    type: String,
    trim: true,
    required: [true, 'Product description can\'t be empty'],
    minLength: [1, 'Product description can\'t be empty'],   
  },
  specification: {
    type: String,
    trim: true,
    required: [true, 'Product specification can\'t be empty'],
    minLength: [1, 'Product specification can\'t be empty'],   
  },

  images: [String],

  // all the available variants
  variants: {
    color: [String],
    size: [String],
    material: [String],
  },

  // all the possible combos with the variants
  groups: [{
    color: String,
    size: String,
    material: String,
    quantity: Number,
    price: Number,
  }],
}, {
  timestamps: true,
});

productSchema.index({ name: 'text', model: 'text' });
productSchema.index({ hsnCode: 1 });

const Product = mongoose.models.products || mongoose.model('products', productSchema);

export default Product;