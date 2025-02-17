'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import axios from 'axios';
import { BarLoader, ClockLoader } from 'react-spinners';

import styles from './productsContent.module.css';
import AdminProduct from './product/product';
import ProductsSearch from '../search/search';
import { ProductType } from '../../../../types/product';

function ProductsContent() {
  const urlParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  // sample url: /admin/products?param={}&value={}
  const [searchParam, setSearchParam] = useState(urlParams.get('param') || '');
  const [searchVal, setSearchVal] = useState(urlParams.get('value') || '');
  
  const [isLoading, setIsLoading] = useState(false);

  // state to store the fetched products (for scrolling)
  const [products, setProducts] = useState<ProductType[]>([]);

  const [showSearchRes, setShowSearchRes] = useState(false);

  // state to store the searched products
  const [searchedProducts, setSearchedProducts] = useState<ProductType[]>([]);

  // state for pagination
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    disable: false,
  });

  // refs required to implement intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLTableRowElement | null>(null);

  // function to search the product based on url search params
  async function searchProduct() {    
    setShowSearchRes(true);
    setIsLoading(true);

    // firstly, update the url params if the value is not empty
    const params = new URLSearchParams(urlParams);
    if (searchVal) {
      params.set('param', searchParam);
      params.set('value', searchVal);
    } else {
      params.delete('param');
      params.delete('value');
    }

    replace(`${pathname}?${params.toString()}`);

    try {
      const res = await axios.get('/api/admin/products', {
        params: {
          param: searchParam,
          value: searchVal,
          pagination: false,
        }
      });

      const { products } = res.data;
      setSearchedProducts(products);
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);   
    } finally {
      setIsLoading(false);
    } 
  }
  
  // function to fetch products
  async function fetchProducts() {
    if (pagination.disable === true) return;
       
    setIsLoading(true);

    try {
      const res = await axios.get(
        '/api/admin/products', 
        {
          params: {
            page: pagination.page,
            limit: pagination.limit,
            pagination: true,
          }
        }
      );

      const { products } = res.data;

      // add fetched products to state and increment the page number
      if (products.length > 0) {
        setProducts((prevData) => [...prevData, ...products]);
        setPagination((prevState) => {
          return {...prevState, page: prevState.page + 1};
        });
      }

      // if the products fetched is less than per page limit, disable pagination
      if (products.length < pagination.limit) {
        setPagination((prevState) => { 
          return {...prevState, disable: true }
        });
      }
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // check the validity of the search params
  useEffect(() => {
    let currSearchParam = urlParams.get('param') || '';
    const validSearchParams = ['name', 'id', 'hsnCode'];

    if ((!currSearchParam) ||
      (!validSearchParams.includes(currSearchParam))
    ) {
      // if the `param` is invalid, revert to default state
      setSearchVal('');
      setSearchParam('name');

      // update the url and remove the parameters
      const params = new URLSearchParams(urlParams);
      params.delete('value');
      params.delete('param');
      replace(`${pathname}?${params.toString()}`);

      fetchProducts();
    } else {
      // if the params are valid, do not update them
      setShowSearchRes(true);

      // search for the product
      searchProduct();
    }
  }, [urlParams, replace, pathname]);

  // add the intersection observer
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // create the intersection observer with a callback and options
    observerRef.current = new IntersectionObserver(
      async (entries) => {
        if ((entries[0].isIntersecting) && (!isLoading)) {
          await fetchProducts();
        }
      },
      { threshold: 0.4 }
    );

    // observe the last product element
    if (lastProductRef.current) {
      observerRef.current.observe(lastProductRef.current);
    }

    // Cleanup observer on component unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [products, showSearchRes]);

  useEffect(() => {
    // if the search value is cleared by the user, display fetched products
    if (searchVal.length === 0) {
      setShowSearchRes(false);

      // remove the parameters
      const params = new URLSearchParams(urlParams);
      params.delete('value');
      params.delete('param');
      replace(`${pathname}?${params.toString()}`);
    }
  }, [searchVal]);

  ////// The state and functions are used for product deletion /////// 
  const [productToDelete, setProductToDelete] = useState<ProductType | null>(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);

  // function to delete the product
  async function deleteProduct() {
    if (!productToDelete) return;

    setDeletingProduct(true);

    try {     
      const res = await axios.delete(`/api/admin/products/${productToDelete._id}/delete`);
      const { message } = res.data;
      
      toast.success(message);

      setShowDeletePopup(false);

      // remove the product from the state
      setSearchedProducts((prevState) => {
        return prevState.filter((product) => product._id !== productToDelete._id);
      });
      setProducts((prevState) => {
        return prevState.filter((product) => product._id !== productToDelete._id);
      })
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setDeletingProduct(false);
    }
  }

  return (
    <main className={styles.main}>
      {/* search bar to search products */}
      <ProductsSearch 
        searchParam={searchParam}
        searchVal={searchVal}
        setSearchParam={setSearchParam}
        setSearchVal={setSearchVal}
        handleSubmit={searchProduct}
      />

      {/* pop up to verify the delete product action */}
      {showDeletePopup && (
        <div className={styles.delete_popup_container}>
          <div className={styles.delete_popup}>
            <p>
              Do you want to delete this product? This action is irreversible.
            </p>
            <h4>{productToDelete?.name}</h4>

            <div className={styles.delete_popup_actions}>
              {deletingProduct ?
                <BarLoader /> :
                <>
                  <button onClick={() => deleteProduct()}>Delete</button>
                  <button onClick={() => setShowDeletePopup(false)}>Cancel</button>
                </>  
              }
            </div>
          </div>
        </div>
      )}

      {/* display fetched products */}
      <section className={styles.product_container}>
        <table className={styles.proudcts_table}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(showSearchRes) ?
              searchedProducts.map((product, idx) => {
                return (
                  <AdminProduct 
                    key={idx} 
                    product={product} 
                    setShowDeletePopup={setShowDeletePopup}
                    setProductToDelete={setProductToDelete}
                  />
                )
              }) :
              products.map((product, idx) => {
                const isLastProduct = (products.length-1 === idx);

                return (
                  <AdminProduct 
                    key={idx}
                    product={product} 
                    setShowDeletePopup={setShowDeletePopup}
                    setProductToDelete={setProductToDelete}
                    ref={(isLastProduct) ? lastProductRef : null}
                  />
                )
              })
            }
          </tbody>
        </table>
        
        <div className={styles.loader}>
          {isLoading && <ClockLoader />}
        </div>          
      </section>
    </main>
  )
}

export default ProductsContent