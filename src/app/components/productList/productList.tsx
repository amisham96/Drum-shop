'use client'; 

import { ProductType } from '../../../types/product';
import styles from './productList.module.css';
import Product from '../store/product/product';
import { UserType } from '../../../helpers/auth/getUser';

type PropsType = {
  products: ProductType[],
  user: UserType | null,
}

function ProductList({ products, user }: PropsType) {
  return (
    <div className={styles.filtered_products_container}>
      {products.map((product) => {
        return (
          <Product
            product={product}
            key={product._id}
            user={user}
          />
        )
      })}
    </div>
  )
}

export default ProductList;
