import { Address } from '../types/address';
import { CartType } from '../types/cart';

interface OrderType {
  _id: string,
  
  userId: string,
  address: Address,
  cartId: string, 

  price: number, 
  discount: number,
  shippingCharges: number,
  total: number,

  paymentStatus: string,
  createdAt: string,
};

type OrderWithUserType = OrderType & {
  userId: {
    fullName: string,
    email: string,
    phone: string,
  }
};

type OrderWithCartType = OrderType & {
  cartId: CartType
}

export {
  type OrderType,
  type OrderWithUserType,
  type OrderWithCartType
};
