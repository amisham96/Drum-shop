/**
 * File: product.tsx
 * Description: this file consists of the component rendered
 * on the view product page
 * 
 * /products/[productId]
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import styles from './product.module.css';
import toast from 'react-hot-toast';

import { addProduct } from '../../../actions/cart';
import { type UserType } from '../../../helpers/auth/getUser';

import {
  type VariantsType,
  type GroupsType,
  type ProductType,
} from '../../../types/product';

function Product(
  { product, user }: { product: ProductType, user: (UserType | null) }
) {
  const router = useRouter();
  const pathName = usePathname();

  // get groupId present in the query
  const searchParams = useSearchParams();
  const groupId = searchParams.get('group');

  // index of the image to be displayed
  const [activeImg, setActiveImg] = useState(0);

  // state to store active group based on selected variant
  const [color, setColor] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [material, setMaterial] = useState<string| null>(null);
  const [activeGroup, setActiveGroup] = useState<GroupsType | null>(null);

  // function to update variant button ui to indicate 'active' status.
  function makeVariantActive(name: string, val: string) {
    // clear previous active states
    const allVariantBtns = document.querySelectorAll(`[data-variant-type="${name}"]`);

    if (allVariantBtns) {
      Array.from(allVariantBtns).forEach((btn) => {
        btn.classList.remove(`${styles.active_variant}`);
      });
    }

    if (name === 'color') setColor(val);
    if (name === 'size') setSize(val);
    if (name === 'material') setMaterial(val);

    // mark the clicked variant active
    const id = `${name}_${val}`;
    const variantBtn = document.querySelector(`[data-variant-id="${id}"]`);
    variantBtn?.classList.add(`${styles.active_variant}`);
  }

  // function to add a product to the cart
  async function addProductToCart() {
    try {
      // if the user is authenticated, add product using server action
      if (user !== null) {
        const data = await addProduct({
          productId: product._id,
          groupId: activeGroup?._id || null,
          quantity: 1,
        });

        if (data.error) {
          throw new Error(data.message);
        } else {
          toast.success('Added product to the cart!!');
        }
      } else {
        toast.error('Please login to add the product to your cart.')
      }
    } catch (error: any) {
      toast.error(error.message || 'Error adding product to the cart');
    }
  }

  useEffect(() => {
    function updateVariants(group: GroupsType) {
      if (group.color) {
        setColor(group.color);
        makeVariantActive('color', group.color);
      }      
  
      if (group.size) {
        setSize(group.size);
        makeVariantActive('size', group.size);
      }
  
      if (group.material) {
        setMaterial(group.material);
        makeVariantActive('material', group.material);
      }
    }

    const groups = product.groups;
    if (groups.length === 0) return;

    // check if there is a variant id provided in query
    if (groupId) {
      let validGroupId = false;

      // if the groupId is valid, then add those variants
      groups.forEach((grp) => {
        if (grp._id === groupId) {
          validGroupId = true;
          updateVariants(grp);
          return;
        }
      });

      if (validGroupId === false) updateVariants(groups[0]);
    } else {
      // by default first group would be active
      updateVariants(groups[0]);      
    }
  }, []);

  useEffect(() => {
    // function to update group when user selects on various variant options
    function updateGroup() {
      const groups = product.groups;

      groups.forEach((grp) => {
        if ((grp.color === color) &&
            (grp.size === size) &&
            (grp.material === material)) 
        {
          setActiveGroup(grp);
          return;
        }
      });
    }

    // when any variant is changed, update the group
    updateGroup();
  }, [color, size, material, product.groups]);

  useEffect(() => {
    if (!activeGroup) return;

    // when a group is changed, update the url
    const params = new URLSearchParams(searchParams.toString())
    params.set('group', activeGroup._id)

    router.push(`${pathName}?${params.toString()}`);
  }, [activeGroup, pathName, router, searchParams]);

  return (
    <div className={styles.outer_container}>

      {/* product info container */}
      <div className={styles.product_container}>
        <div className={styles.left_container}>

          {/* container containing images */}
          <div className={styles.images_container}>
            <div className={styles.all_images}>
              {product.images.map((img, idx) => {
                return (
                  <div 
                    className={`${styles.small_img} ${(idx === activeImg) ? styles.active_img : ''}`} 
                    key={idx}
                  > 
                    <img 
                      src={img}
                      alt={`${product.name} image`} 
                      onClick={() => setActiveImg(idx)}
                    />
                  </div>
                );
              })}
            </div>

            <div className={styles.display_img}>
              <img 
                src={product.images[activeImg]} 
                alt="Product image"
              />
            </div>
          </div>

          {/* cta buttons */}
          <div className={styles.cta_container}>
            <button 
              className={styles.add_to_cart}
              onClick={() => addProductToCart()}
            >
              Add to Cart
            </button>
            <button 
              className={styles.call_to_order}
              onClick={() => {
                // TODO: change the telephone number
                window.open('tel:+919740564850');
              }}
            >
              Call to order
            </button>
          </div>
        </div>

        {/* container containing product info */}
        <div className={styles.right_container}>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.description}>{product.description}</p>
          <h1 className={styles.selling_price}>₹ 
            {(activeGroup === null) ?
              product.sellingPrice.toLocaleString('en-IN') :
              activeGroup.price.toLocaleString('en-IN')
            }
          </h1>

          <div className={styles.variant_container}>
            {Object.keys(product.variants).map((variant, idx) => {
              const variantKey = variant as keyof VariantsType;
              const variantData = product.variants[variantKey];

              // if the variant type is empty, return null;
              if (variantData.length === 0) return null;

              return (
                <div className={styles.variant} key={idx}>
                  <h3>{variant}</h3>

                  {variantData.map((val, i) => {
                    return (
                    <button
                      data-variant-type={variantKey}
                      data-variant-id={`${variantKey}_${val}`}
                      key={i}
                      onClick={() => makeVariantActive(variantKey, val)}
                    >
                      {val}
                    </button>);
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Frequently bought together container */}

      {/* Similar products container */}
    </div>
  )
}

export default Product;
