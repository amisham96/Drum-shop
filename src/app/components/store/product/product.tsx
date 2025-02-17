'use client';

import { LiaCartPlusSolid } from 'react-icons/lia';
import toast from 'react-hot-toast';
import { forwardRef, MouseEvent, useState } from 'react';
import { ClipLoader } from 'react-spinners';
import Link from 'next/link';

import styles from './product.module.css';
import { addProduct } from '../../../../actions/cart';
import { ProductType } from '../../../../types/product';
import { UserType } from '../../../../helpers/auth/getUser';

// TODO: Add the important note on the products (i.e., `discount`, `out of stock`...etc.,)

interface ProductProps {
  product: ProductType,
  user: (UserType | null),
}

const  Product = forwardRef<HTMLAnchorElement, ProductProps>(({ product, user }, ref) => {
  const [isLoading, setIsLoading] = useState(false);

  async function addToCart(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    setIsLoading(true);

    try {
      let groupId = null;
  
      if (product.groups.length > 0) {
        groupId = product.groups[0]._id;
      }
  
      if (user !== null) {
        const data = await addProduct({ 
          productId: product._id,
          groupId: groupId,
          quantity: 1,
        });

        if (data.error) {
          throw new Error(data.message);
        } else {
          toast.success('Added product to the cart!!');
        }
      } else {
        toast.error('Please login to add product to cart');
      }  
    } catch (error: any) {
      toast.error(error.message || 'Error adding product to cart');
    } finally {
      setIsLoading(false);
    }
  }

  // function to get the selling price of the product
  function getPrice() {
    if (product.sellingPrice) return product.sellingPrice;
    else return product.groups[0].price;
  }

  // function to generate a note based on special cases of the product
  function getProductNote() {
    /**
     * based on quantity
     *  - out of stock, less than 20 left,
     * 
     * based on price
     *  - special offer
     */
    
    let note = '';
    let color = '';
    const productQuantity = product.quantity;

    if ((productQuantity) && (productQuantity === 0)) {
      note = 'OUT OF STOCK';
      color = '#D94C4C';
    } else if ((productQuantity) && (productQuantity <= 30)) {
      note = `ONLY ${productQuantity} LEFT!`;
      color = '#F4AB36';
    } else if ((product.discount) >= (0.1 * product.sellingPrice)) {
      note = 'SPECIAL OFFER';
      color = '#019FB4';
    }

    return { note, color };
  }

  return (
    <Link 
      href={`/products/${product._id}`} 
      target='_blank'
      className={styles.product_container}
      ref={ref}
    >
      {(getProductNote().note.length > 0) &&
        <div 
          className={styles.product_note}
          style={{backgroundColor: getProductNote().color}}
        >
          {getProductNote().note}
        </div>
      }

      <div className={styles.product_image_container}>
        <img 
          src={product.images[0]}
          alt={`${product.name} image`} 
        />

        <p className={styles.offer_tag}></p>
      </div>

      <p className={styles.product_name}>
        {product.name.slice(0, 100) + (product.name.length > 100 ? '....' : '')}
      </p>
      <p className={styles.product_category}>
        {product.category.charAt(0).toUpperCase() + product.category.slice(1).toLowerCase()}
      </p>

      <p className={styles.product_price}>
        ₹ {getPrice().toLocaleString('en-In')}
      </p>

      <button
        onClick={(e) => addToCart(e)}
        className={styles.add_to_cart_btn}
        disabled={isLoading}
      >
        {(isLoading === true) ?
          <ClipLoader size={20} />:
          <LiaCartPlusSolid /> 
        }
      </button>


    </Link>
  );
});

Product.displayName = 'Product';

export default Product