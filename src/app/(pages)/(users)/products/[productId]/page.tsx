import NeedHelp from '../../../../components/needHelp/needHelp';
import ProductPage from '../../../../components/product/product';
import { getUser } from '../../../../../helpers/auth/getUser';
import { Suspense } from 'react';

async function fetchProduct(productId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${productId}`,
    { next: { revalidate: 3600 } } 
  );
  const data = await res.json();

  return data;
}

async function Product({ params }: { params: {productId: string} }) {
  const {productId} = params;
  const { product, message } = await fetchProduct(productId);

  const user = await getUser();
 
  // if data couldn't be fetched, display this component instead
  // TODO: instead of displaying the error like this, send it to the client 
  // component further down and handle it there
  if (!product) {
    return <main>{message}</main>;
  }

  return (
    <main style={{minHeight: 'unset'}}>
      <Suspense>
        <ProductPage product={product} user={user} />
      </Suspense>
      
      {/* 'contact us' container */}
      <NeedHelp />
    </main>
  );
}

export default Product;