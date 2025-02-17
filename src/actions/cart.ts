'use server';

import Cart from '../models/cart';
import dbConnect from '../lib/dbConnect';
import { cookies } from 'next/headers';
import { verifyToken } from '../helpers/jwt';
import Product from '../models/product';
import { GroupsType, ProductType } from '../types/product';

type CartProductType = {
  productId: string,
  groupId: string | null,
  quantity: number,
};

type CartType = {
  _id: string,
  userId: string,
  products: CartProductType[],
}

// util function to check if the userToken is valid or not
async function getUserFromCookies() {
  const userTokenCookie = cookies().get('token') || null;

  // if the auth token is not present return error.
  if (userTokenCookie === null) {
    throw new Error('User not authenticated');
  }

  const userAuthToken = userTokenCookie.value;
  const user = await verifyToken(userAuthToken);

  return user;
}

// function to add a product to the cart
async function addProduct(cartProduct: CartProductType) {
  try {
    const user = await getUserFromCookies();

    await dbConnect();

    // before adding the product to cart, check the availability
    const product = await Product.findById(cartProduct.productId);

    let availQuantity = 0;

    if (product.groups.length === 0) {
      availQuantity = product.quantity || 0;
    } else {
      const matchingGroup = product.groups.find((grp: GroupsType) => (grp._id.toString() === cartProduct.groupId?.toString()));
      availQuantity = matchingGroup?.quantity || 0;
    }

    if (availQuantity <= 0) {
      return {
        error: true,
        message: 'Product currently out of stock',
      }
    }

    // find the existing cart in the db of the given user
    const userCart: (CartType | null) = await Cart.findOne({
      userId: user.userId,
      status: 'active'
    });

    let cartId = '';
    let productsCount = 0;

    // if the user does not have any cart, create new one
    if (!userCart) {
      const newUserCart = new Cart({
        userId: user.userId,
        products: [{
          productId: cartProduct.productId,
          groupId: cartProduct.groupId,
          quantity: cartProduct.quantity
        }],
      });

      cartId = newUserCart._id;
      productsCount = 1;

      await newUserCart.save();
    } else {
      // if cart already exists, add product to it
      cartId = userCart._id;

      // find the index of the product in the cart
      const productIndex = userCart.products.findIndex((product) => {
        // if their product ids match
        if ((product.productId.toString()) === (cartProduct.productId)) { 
          // check if the groups ids match too
          if ((product.groupId) && (cartProduct.groupId)) {
            return (product.groupId.toString() === cartProduct.groupId);
          } else {
            return true;
          }
        }
      });

      // product does not exist in the cart, add it
      if (productIndex === -1) {
        await Cart.updateOne(
          { userId: user.userId, status: 'active' },
          { $push: { products: cartProduct } }
        );

        productsCount = userCart.products.length + 1;
      }
    }

    // save the cartId and productCount in cart to a cookie and send it to user
    cookies().set({
      name: 'cartId',
      value: cartId,
      httpOnly: true,
    });

    cookies().set({
      name: 'cartCount',
      value: productsCount.toString(),
      httpOnly: true,
    });

    return {
      success: true,
      productsCount,
    }
  } catch (error: any) {
    return {
      error: true,
      message: error.message,
    }
  }
}

// function to remove an item from cart
async function removeProduct(cartProductId: string) {
  try {
    const user = await getUserFromCookies();

    await dbConnect();

    // find the existing cart in the db of the given user
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: user.userId, status: 'active' },
      { $pull: { products: { _id: cartProductId } } },
      { new: true }
    );

    // update the `cartCount` cookie
    cookies().set({
      name: 'cartCount',
      value: updatedCart.products.length.toString(),
      httpOnly: true,
    });

    return {
      success: true,
      message: 'Successfully removed product from cart'
    }
  } catch (error: any) {
    return {
      error: true,
      message: error.message,
    }
  }
}

// function to update the quantity of a product
async function updateQuantity(
  productId: string,
  cartProductId: string,
  quantityChange: number
) {
  try {
    const user = await getUserFromCookies();

    // get the quantity currently added in the cart by the user.
    const cart: (CartType | null) = await Cart.findOne(
      { userId: user.userId, status: 'active', 'products._id': cartProductId },
      { 'products.$': 1 }
    );

    if (!cart) {
      throw Error('Couldn\'t find product in cart');
    }

    const cartProduct = cart.products[0];
    const currQuantity = cartProduct.quantity;
    const groupId = cartProduct.groupId;

    // get the available quantity of the product
    const product: (ProductType | null) = await Product.findById(productId);

    if (!product) {
      throw Error('Product not available on store');
    }

    let availQuantity = 0;

    if (product.groups.length === 0) {
      availQuantity = product.quantity || 0;
    } else {
      const matchingGroup = product.groups.find((grp) => (grp._id.toString() === groupId?.toString()));

      availQuantity = matchingGroup?.quantity || 0;
    }

    // check if the change can be accomodated within the available quantity
    const newQuantity = currQuantity + quantityChange;
    if (newQuantity > availQuantity) {
      return {
        error: true,
        message: 'Quantity exceeds available stock',
      }
    } else if (newQuantity <= 0) {
      return {
        error: true,
        message: 'Quantity of product in the cart can\'t be zero/negative',
      }
    }

    // update the quantity in the database, based on availablity
    await Cart.updateOne(
      { userId: user.userId, status: 'active', 'products._id': cartProductId },
      { $set: { 'products.$.quantity': newQuantity } }
    );

    return {
      success: true,
      message: 'Updated the quantity'
    }
  } catch (error: any) {
    return {
      error: true,
      message: error.message,
    }
  }
}
async function changeNewQuantity(
  productId: string,
  cartProductId: string,
  newQuantity: number
) {
  try {
    const user = await getUserFromCookies();

    // get the active cart of the user.
    const cart: (CartType | null) = await Cart.findOne(
      { userId: user.userId, status: 'active', 'products._id': cartProductId },
      { 'products.$': 1 }
    );

    if (!cart) {
      throw Error('Couldn\'t find product in cart');
    }

    const cartProduct = cart.products[0];
    const currQuantity = cartProduct.quantity;
    const groupId = cartProduct.groupId;

    // get the available quantity of the product
    const product: (ProductType | null) = await Product.findById(productId);

    if (!product) {
      // product was removed from the store
      throw Error('Product not available on store');
    }

    let availQuantity = 0;

    if (product.groups.length === 0) {
      availQuantity = product.quantity || 0;
    } else {
      const matchingGroup = product.groups.find((grp) => (grp._id.toString() === groupId?.toString()));

      availQuantity = matchingGroup?.quantity || 0;
    }

    // check if the change can be accomodated within the available quantity
    if (newQuantity > availQuantity) {
      return {
        error: true,
        message: 'Quantity exceeds available stock',
      }
    } else if (newQuantity <= 0) {
      return {
        error: true,
        message: 'Quantity of product in the cart can\'t be zero/negative',
      }
    }

    // update the quantity in the database, based on availablity
    await Cart.updateOne(
      { userId: user.userId, status: 'active', 'products._id': cartProductId },
      { $set: { 'products.$.quantity': newQuantity } }
    );

    return {
      success: true,
      message: 'Updated the quantity'
    }
  } catch (error: any) {
    return {
      error: true,
      message: error.message,
    }
  }
}

export {
  addProduct,
  removeProduct,
  updateQuantity,
  changeNewQuantity,
  type CartProductType,
  type CartType,
};
