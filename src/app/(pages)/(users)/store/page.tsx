import NeedHelp from '../../../components/needHelp/needHelp';
import styles from './store.module.css';
import AdsCarousel from '../../../components/carousel/store/ads/adsCarousel';
import Image from 'next/image';
import Link from 'next/link';
import { BsArrowRight } from 'react-icons/bs';
import ProductCategoryList from '../../../components/store/categoryList/categoryList';
import { ProductType } from '../../../../types/product';
import { getUser } from '../../../../helpers/auth/getUser';
import ProductList from '../../../components/productList/productList';

type CategoryDataType = {
  _id: string,
  products: ProductType[],
}

type StoreResponseType = {
  categoryData: CategoryDataType[] 
} 

type FilterProductsResponseType = {
  products: ProductType[],
}

async function fetchStoreData() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products?store=true`, 
      { next: { revalidate: 3600 * 24 } } // cache for a day, unless revalidated
    );
    return await res.json();
  } catch (error) {
    return { data: { categoryData: [] } };
  }
}

async function fetchFilteredProducts(query?: string, brand?: string) {
  let urlParams = '';

  try {
    if (query) urlParams += `&query=${query}`;
    else if (brand) urlParams += `&brand=${brand}`;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/search?${urlParams}`, 
      { cache: 'no-store' } // cache for a day, unless revalidated
    );

    return await res.json();
  } catch(error) {
    return { data: {products: [] }};
  }
}

async function Store({ 
  searchParams 
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  let storeData: StoreResponseType | null = null;
  let filteredProductsData: FilterProductsResponseType | null = null;

  const user = await getUser();

  const params = (await searchParams);
  const query = params.query;
  const brand = params.brand;

  // if there are filters provided, fetch data based on that
  if (query || brand) {
    const res = await fetchFilteredProducts(query, brand);
    filteredProductsData = res;
  } else {
    // else generic store data
    const res = await fetchStoreData();
    storeData = res.data;
  }

  return (
    <main className={styles.main}>
      {/* ads carousel */}
      <div className={styles.ads_carousel}>
        <AdsCarousel />
      </div>

      {/* shop by brand container */}
      <section className={styles.brand_container}>
        <h1>Shop by brand</h1>
        <p>Looking for a specific brand? we’ve got you covered.</p>

        <div className={styles.brand_image_container}>
          <div className={styles.brand_image}>
            <Image
              src={'/images/home/brand_image_1.svg'}
              alt='available brand'
              fill={true}
            />
          </div>

          <div className={styles.brand_image}>
            <Image
              src={'/images/home/brand_image_2.svg'}
              alt='available brand'
              fill={true}
            />
          </div>

          <div className={styles.brand_image}>
            <Image
              src={'/images/home/brand_image_3.svg'}
              alt='available brand'
              fill={true}
            />
          </div>

          <div className={styles.brand_image}>
            <Image
              src={'/images/home/brand_image_4.svg'}
              alt='available brand'
              fill={true}
            />
          </div>

          <div className={styles.brand_image}>
            <Image
              src={'/images/home/brand_image_5.svg'}
              alt='available brand'
              fill={true}
            />
          </div>
        </div>

        <Link href='/store'>
          See more brands
          <BsArrowRight />
        </Link>
      </section>

      {/* convinient purchase container */}
      <section className={styles.purchase_info_container}>
        <h1>Convinient purchase</h1>
        <p>
          Discover a world of exceptional services designed to enhance your 
          purchase and bring your musical aspirations to life.
        </p>

        <div className={styles.purchase_info_point_container}>
          <div className={styles.purchase_info_point}>
            <h2>Easy EMI</h2>
            <p>
              We provide easy EMI options such as Bajaj Finance & Credit Card EMI Options.
            </p>
          </div>

          <div className={styles.purchase_info_point}>
            <h2>Free Installation</h2>
            <p>
              Enjoy hassle-free setup with our complimentary installation service, 
              ensuring your drum kit is tuned to perfection from the moment you bring it home
            </p>
          </div>

          <div className={styles.purchase_info_point}>
            <h2>Consultation</h2>
            <p>
              Expert advice tailored to your needs ensures you find the perfect percussion gear.
              Our dedicated team is here to make your purchasing experience smooth and enjoyable.
            </p>
          </div>
        </div>
      </section>

      {/* shop by category */}
      {storeData &&
        <section className={styles.shop_by_category_container}>
          <h1>SHOP BY CATEGORY</h1>
          
          {storeData.categoryData.map((ctData, idx: number) => {
            return (
              <ProductCategoryList 
                categoryList={ctData}
                key={idx}
                user={user}
              />
            );
          })}
        </section>
      }

      {/* display searched products */}
      {filteredProductsData &&
        <section className={styles.filtered_products_container}>
          <h2>Items related to '{query}'</h2>

          {/* {filteredProductsData.products.map} */}
          <ProductList 
            products={filteredProductsData.products}
            user={user}
          />
        </section>
      }

      <NeedHelp />
    </main>
  );
}

export default Store