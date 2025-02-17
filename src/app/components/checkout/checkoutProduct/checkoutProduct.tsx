import { CartProduct } from '../../../../types/cart';
import styles from './checkoutProduct.module.css';
import { useEffect, useState } from 'react';

type PropsType = {
  product: CartProduct
}

function CheckoutProduct(props: PropsType) {

  const [cartProduct, setCartProduct] = useState<CartProduct>();
  const [total, setTotal] = useState(0);
  const [variant, setVariant] = useState('');

  useEffect(() => {
    setCartProduct(props.product);
    
    const cartProduct = props.product;
    const product = cartProduct.productId;
    let price = 0;

    // get the price of the product
    if (cartProduct.groupId) {
      // if cartProduct has a groupId, then fetch the group with matching id
      const matchingGrp = product.groups.find((group) => group._id === cartProduct.groupId);
      price = matchingGrp?.price || product.sellingPrice;

      // update the variant
      let tempVariant = '';
      if (matchingGrp) {
        if (matchingGrp.color) tempVariant += matchingGrp.color; 
        if (tempVariant.length > 0) tempVariant += ', ';
        if (matchingGrp.size) tempVariant += matchingGrp.size;
        if (tempVariant.length > 0) tempVariant += ', ';
        if (matchingGrp.material) tempVariant += matchingGrp.material;

        setVariant(tempVariant);
      }
    } else {
      price = product.sellingPrice;
    }

    setTotal(price * cartProduct.quantity);
  }, [setCartProduct, props]);

  return (
    <div className={styles.checkout_product}>
      <div>
        <img
          src={cartProduct?.productId.images[0]}
          alt={`${cartProduct?.productId.name} image`} 
        />
      </div>

      {/* TODO: when the cart product is possibly null, display a loader or error message */}

      <div className={styles.product_info}>
        <div>
          <h3 className={styles.product_name}>{cartProduct?.productId.name}</h3>
          <p className={styles.product_category}>{cartProduct?.productId.category
                .split(' ')
                .map((word: string) => {
                  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                })
                .join(' ')}
          </p>
        </div>

        <div className={styles.price_container}>
          <p className={styles.price}>₹ {total.toLocaleString('en-IN')}</p>
          <p className={styles.quantity}>Quantity: {cartProduct?.quantity || 0}</p>
          {(variant.length > 0) &&
            <p className={styles.variant}>Variant: {variant}</p>
          }
        </div>
      </div>
    </div>
  )
}

export default CheckoutProduct;
