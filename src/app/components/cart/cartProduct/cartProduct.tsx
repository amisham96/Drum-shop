import { useContext, useEffect, useState } from 'react';
import { IoMdAdd, IoMdRemove } from 'react-icons/io';
import { RiDeleteBin6Line } from 'react-icons/ri';
import styles from './cartProduct.module.css';
import toast from 'react-hot-toast';

import { CartContext } from '../../../context/cart/provider';
import { type CartProductWithPrice } from '../../../../types/cart';
import { type GroupsType } from '../../../../types/product';
import { removeProduct, updateQuantity } from '../../../../actions/cart';

function CartProduct({ cartProductId }: { cartProductId: string}) {
  const {state, dispatch} = useContext(CartContext);

  // state to hold the prop
  const temp = state.products.find((cartProduct) => cartProduct._id === cartProductId);
  const [cartProduct, setCartProduct] = useState<CartProductWithPrice>(temp!);

  // state to hold the group info of the selected product
  const [group, setGroup] = useState<(GroupsType | null)>(null);

  // total price of this particular product
  const [total, setTotal] = useState(0);

  // max quantity of the product present in the db
  const [maxQuantity, setMaxQuantity] = useState(0);

  // function to increase quantity of the product in cart
  async function increaseQuantity() {
    if (cartProduct.quantity === maxQuantity) {
      toast.error('Max quantity available');
      return;
    }

    const productId = cartProduct.productId._id;
    const {success, message} = await updateQuantity(productId, cartProduct._id, 1);

    if (!success) {
      toast.error(message);
      return;
    }

    // update the local product state
    setCartProduct((prevState) => {
      return {
        ...prevState,
        quantity: prevState.quantity + 1,
      }
    });

    // update the context
    dispatch({
      type: 'increase_quantity',
      payload: cartProduct,
    });

    // update the `total` price of the product
    setTotal((prevTotal) => prevTotal + getPrice());
  }

  // function to decrease quantity of the product in cart
  async function decreaseQuantity() {
    if (!cartProduct || cartProduct.quantity === 1) return;

    const productId = cartProduct.productId._id;
    const {success, message} = await updateQuantity(productId, cartProduct._id, -1);

    if (!success) {
      toast.error(message);
      return;
    }

    setCartProduct((prevState) => {
      return {
        ...prevState,
        quantity: (prevState) ? prevState.quantity - 1 : 0,
      }
    });
    dispatch({
      type: 'decrease_quantity',
      payload: cartProduct,
    });

    setTotal((prevTotal) => prevTotal - getPrice());
  }

  // function to remove product from the cart
  async function removeProductFromCart() {
    // call server action to update in the db
    const res = await removeProduct(cartProductId);

    if (res.success) {
      dispatch({
        type: 'remove_from_cart',
        payload: cartProduct,
      });
  
      toast.success('Removed an item from the product');
    } else {
      toast.error('Error removing item from the cart.')
    }
  }

  // function to get the price of the product (not to calculate total)
  function getPrice() {
    if (group !== null) {
      return group.price;
    } else {
      return cartProduct?.productId.sellingPrice;
    }
  }

  useEffect(() => {
    // get the product using the id
    const temp = state.products.find((cartProduct) => cartProduct._id === cartProductId);

    if (!temp) return;

    // calculate the price of the product
    const tempProduct = temp.productId;
    let matchingGroup = tempProduct.groups.find((group) => (group._id === temp.groupId)) || null;

    // calculate the total for this product
    const total = temp.quantity * temp.price!;

    setCartProduct(temp);
    setGroup(matchingGroup);
    setTotal(total);
    setMaxQuantity(matchingGroup?.quantity || tempProduct.quantity || 0);
  }, [state.products, cartProductId]);

  return (
    <div className={styles.cart_product}>
      <div>
        <img
          src={cartProduct?.productId.images[0]}
          alt={`${cartProduct?.productId.name} image`} 
        />
      </div>

      {/* TODO: when the cart product is possibly null, display a loader or error message */}

      <div className={styles.product_info}>
        <h3 className={styles.product_name}>{cartProduct?.productId.name}</h3>
        <p className={styles.product_category}>{cartProduct?.productId.category
              .split(' ')
              .map((word: string) => {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              })
              .join(' ')}
        </p>

        <div className={styles.quantity_btns}>
          <button 
            className={`${styles.decrease_btn} ${(cartProduct?.quantity === 1) ? styles.disable_btn : ''}`} 
            onClick={() => decreaseQuantity()}
          >
            <IoMdRemove />
          </button>
          <span>{cartProduct?.quantity}</span>
          <button
            className={`${styles.increase_btn} ${(cartProduct?.quantity === maxQuantity) ? styles.disable_btn : ''}`}
            onClick={() => increaseQuantity()}
          >
            <IoMdAdd />
          </button>
        </div>

        <div className={styles.price_container}>
          <button onClick={() => removeProductFromCart()}>
            Remove from cart
            <RiDeleteBin6Line />
          </button>
          <p>₹ {total.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
}

export default CartProduct;
