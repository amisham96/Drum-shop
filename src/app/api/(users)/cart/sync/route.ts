import { verifyToken } from '../../../../../helpers/jwt';
import dbConnect from '../../../../../lib/dbConnect';
import Cart from '../../../../../models/cart';
import { CartProduct } from '../../../../../types/cart';
import { NextRequest, NextResponse } from 'next/server';

type QuantityErrorType = { 
  cartProductId: string,
  productId: string,
  variant?: string,
  name: string, 
  cartQuantity: number, 
  availableQuantity: number
};

export async function GET(req: NextRequest) {
  const userTokenCookie = req.cookies.get('token');  

  // if the user is unauthenticated, cart info is not saved in the db
  if (!userTokenCookie) {
    return NextResponse.json(
      { message: 'Unauthenticated' },
      { status: 401 }
    );
  }

  try {
    // fetch all the items from the inventory
    const userToken = userTokenCookie.value;

    // get the userId saved in the token
    const userData = await verifyToken(userToken);

    await dbConnect();

    // retrieve the cart using the userId
    const cart = await Cart.findOne({ 
                          userId: userData.userId, 
                          status: 'active' 
                        })
                        .populate({ 
                          path: 'products.productId',
                        });

    const cartProducts: CartProduct[] = cart.products;
    const errors: QuantityErrorType[] = [];

    for (let i = 0; i < cartProducts.length; i += 1) {
      const cartProduct = cartProducts[i];
      const cartProductId = cartProduct._id;
      const actualProduct = cartProduct.productId;
      const groupId = cartProduct.groupId;

      const err: QuantityErrorType = {
        cartProductId,
        productId: actualProduct._id,
        name: actualProduct.name,
        cartQuantity: cartProduct.quantity,
        availableQuantity: 0,
      }

      if (groupId !== null) {
        // if there is a group, verify the quantity with that particular group
        const group = actualProduct.groups.find((grp) => {
          return (grp._id.toString() === (groupId.toString()));
        });

        if ((group) && (cartProduct.quantity > group.quantity)) {
          let variant: string = '';
          if (group.color) variant += group.color;
          if (variant.length > 0) variant += ', ';
          if (group.size) variant += group.size;
          if (variant.length > 0) variant += ', ';
          if (group.material) variant += group.material;

          err.availableQuantity = group?.quantity || 0;
          err.variant = variant;
          errors.push(err);
        }
      } else {
        // if there is no groupId, verify quantity with the original quantity
        if (!actualProduct.quantity) {
          err.availableQuantity =  0;
          errors.push(err);
        } else if (cartProduct.quantity > actualProduct.quantity) {
          err.availableQuantity = actualProduct.quantity;
          errors.push(err);
        }
      }
    }

    return NextResponse.json({
      message: 'Successfully retrieved cart',
      errors,
      cart,
    });
  } catch (error) {    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
};
