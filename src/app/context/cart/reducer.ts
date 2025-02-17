import { CartProductWithPrice } from '../../../types/cart';

export type CartStateType = {
  products: CartProductWithPrice[],
}

// TODO: update the payload type
export type ActionType = {
  type: string,
  payload: any,
}

export const initialState: CartStateType = {
  products: []
};

export const reducer = (
  state = initialState, 
  action: ActionType
): CartStateType => {
  const {type, payload} = action;

  switch (type) {
    case 'add_to_cart': {
      // TODO: check if the product already exists, if not then add it

      // NOTE: payload here would be of type CartProductWithPrice,
      const newProducts = [...state.products, payload];
      return { products: newProducts };
    };

    case 'remove_from_cart': {
      const cartProductId = payload._id;

      const newProducts = state.products.filter((product) => (product._id !== cartProductId));
      return { products: newProducts };  
    };

    case 'increase_quantity': {
      // get the cartProduct id
      const cartProductId = payload._id;

      // update the product based on their productId
      const updatedProducts = state.products.map((product) => {
        // if their product ids match
        if ((product._id) === (cartProductId)) { 
          // check if the groups ids match too
          return { ...product, quantity: product.quantity + 1};
        } else {
          return product;
        }
      });

      return { products: updatedProducts };
    }

    case 'decrease_quantity': {
      // get the cartProduct id
      const cartProductId = payload._id;

      // update the product based on their productId
      const updatedProducts = state.products.map((product) => {
        // if their product ids match
        if ((product._id) === (cartProductId)) { 
          // check if the groups ids match too
          return { ...product, quantity: product.quantity - 1};
        } else {
          return product;
        }
      });

      return { products: updatedProducts };
    }

    case 'update_quantity': {
      const { cartProductId, newQuantity } = payload;

      // update the product based on their productId
      const updatedProducts = state.products.map((product) => {
        // if their product ids match
        if ((product._id) === (cartProductId)) { 
          // check if the groups ids match too
          return { ...product, quantity: newQuantity};
        } else {
          return product;
        }
      });

      return { products: updatedProducts };
    }

    default:
      return state;
  }
};
