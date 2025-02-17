import { verifyToken } from '../../../../helpers/jwt';
import dbConnect from '../../../../lib/dbConnect';
import Cart from '../../../../models/cart';
import Order from '../../../../models/order';
import ShippingAddress from '../../../../models/shippingAddress';
import { CartType } from '../../../../types/cart';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

function calculatePrice(cart: CartType) {
  // calculate total price
  let allProductPrice = 0, discount = 0, shipping = 0;

  // TODO: Get shipping price before creating order
  cart.products.forEach((cartProduct) => {
    const product = cartProduct.productId;

    let price = 0;
    if (cartProduct.groupId) {
      const matchingGrp = product.groups.find((grp) => grp._id.toString() == cartProduct.groupId.toString());
      if (matchingGrp) price = matchingGrp.price;
      else price = product.sellingPrice;
    } else {
      price = product.sellingPrice;
    }

    allProductPrice += (price * cartProduct.quantity);
    discount += (product.discount * cartProduct.quantity);
  });  

  return { allProductPrice, discount, shipping };
}

export async function POST(req: NextRequest) {
 try {
  // authenticate the user
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json(
      { message: 'Unauthenticated' }, 
      { status: 401 }
    );
  }

  const decodedToken = await verifyToken(token);
  const userId = decodedToken.userId;

  // get the data sent
  const reqBody = await req.json();
  const { cartId, addressId } = reqBody;

  // validate the data recieved
  if (!addressId || !cartId) {
    return NextResponse.json(
      { message: 'Missing required data' }, 
      { status: 400 }
    );  
  }

  await dbConnect();

  // get the address and the cart from the database
  const address = await ShippingAddress.findById(addressId);
  const cart: (CartType | null) = await Cart.findOne({
                            _id: cartId,
                            status: 'active'
                          })
                          .populate({ 
                            path: 'products.productId'
                          });

  if (!address) {
    return NextResponse.json(
      { message: 'Address not found in the profile' }, 
      { status: 404 }
    );
  }
  if (!cart) {
    return NextResponse.json(
      { message: 'Cart not found' }, 
      { status: 404 }
    );
  }

  // check if there exists an order with the given cartId
  let order: CartType;
  const existingOrder = await Order.findOne({ userId, cartId });
  const { allProductPrice, discount, shipping } = calculatePrice(cart);
  const totalCost = allProductPrice - discount + shipping;

  if (existingOrder) {
    // update address and pricing
    const updatedOrder = await Order.findOneAndUpdate(
          { userId, cartId }, 
          { 
            address, 
            price: allProductPrice,
            discount: discount,
            shippingCharges: shipping,
            total: totalCost,
            paymentStatus: 'not_paid'
          }, 
          { new: true }
        );

    order = updatedOrder;
  } else {
    const newOrder = new Order({
      userId: userId,
      address: address,
      cartId: cartId,
      price: allProductPrice,
      discount: discount,
      shippingCharges: shipping,
      total: totalCost,
      paymentStatus: 'not_paid',
    });

    await newOrder.save();  
    order = newOrder;
  }


  return NextResponse.json(
    { order: order }, 
    { status: 200 }
  );
 } catch (error: any) {
    // if the error is because of the jwtoken expiry, the user is unauthenticated
    if (error && error.code) {
      if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
        return NextResponse.json(
          { message: 'Invalid token' },
          { status: 400 }
        );
      } else if (error.code === 'ERR_JWT_EXPIRED') {
        return NextResponse.json(
          { message: 'Login to perform action.' },
          { status: 401 }
        );
      }
    }

  return NextResponse.json(
    { message: 'Internal server error' }, 
    { status: 500 }
  );
 }
}