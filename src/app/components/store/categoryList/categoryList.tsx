'use client';
import { useEffect, useRef, useState } from 'react';
import { ProductType } from '../../../../types/product';
import Product from '../product/product';
import styles from './categoryList.module.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ClockLoader } from 'react-spinners';
import { UserType } from '../../../../helpers/auth/getUser';

type CategoryListPropType = {
  _id: string,
  products: ProductType[],
}

function ProductCategoryList(
  { categoryList, user }: { categoryList: CategoryListPropType, user: (UserType | null)}
) {
  const [category, setCategory] = useState(categoryList._id);
  
  const productContainerRef = useRef<HTMLDivElement | null>(null);

  // state to store the products fetched for this category
  const [products, setProducts] = useState([...categoryList.products]);
  
  // next page number, start with 0
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5); // 5 products per page

  // state to switch pagination
  const [disablePagination, setDisablePagination] = useState(categoryList.products.length < 5);

  const [isLoading, setIsLoading] = useState(false);

  // refs required to implement intersection observer
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastProductRef = useRef<HTMLAnchorElement | null>(null);

  // function to fetch data when the last product is visible
  async function onLastProductVisible() {
    if (disablePagination === true) return;

    setIsLoading(true);

    try {
      const res = await axios.get('/api/products', {
        params: { page, limit, category }
      });

      const { data } = res.data;

      if (data.products.length > 0) {
        setProducts((prevData) => [...prevData, ...data.products]);
        setPage((prevPage) => prevPage + 1);
      } 
      
      if (data.products.length < 5) {
        setDisablePagination(true);
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    // set the event listeners for the horizontal slider
    const slider = productContainerRef.current;
    if (!slider) return;

    let isDown = false;
    let startX: number;
    let scrollLeft: number;

    const mouseDownListener = (e: MouseEvent) => {
      e.preventDefault();
      isDown = true;
      slider.classList.add(`${styles.product_list_container_active}`);
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    }

    const mouseLeaveListener = () => {
      isDown = false;
      slider.classList.remove(`${styles.product_list_container_active}`);
    }

    const mouseUpListener = () => {
      isDown = false;
      slider.classList.remove(`${styles.product_list_container_active}`);
    }

    const mouseMoveListener = (e: MouseEvent) => {
      if(!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 3;
      slider.scrollLeft = scrollLeft - walk;
    }

    slider.addEventListener('mousedown', mouseDownListener as EventListener);
    slider.addEventListener('mouseleave', mouseLeaveListener as EventListener);
    slider.addEventListener('mouseup', mouseUpListener as EventListener);
    slider.addEventListener('mousemove', mouseMoveListener as EventListener);


    return () => {
      slider.removeEventListener('mousedown', mouseDownListener);
      slider.removeEventListener('mouseleave', mouseLeaveListener);
      slider.removeEventListener('mouseup', mouseUpListener);
      slider.removeEventListener('mousemove', mouseMoveListener);
    }
  }, [productContainerRef]);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // create the intersection observer with a callback and options
    observerRef.current = new IntersectionObserver(
      async (entries) => {
        if ((entries[0].isIntersecting) && (!isLoading)) {
          await onLastProductVisible();
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
  }, [page]);

  return (
    <div className={styles.category_list_container}>
      {/* main heading for the list */}
      <h2>{categoryList._id.toUpperCase()}</h2>

      {/* display the list of the products for this category */}
      <div 
        ref={productContainerRef} 
        className={styles.product_list_container}
      >
        {products.map((product, idx) => {
          const isLastProduct = (products.length - 1 === idx);
          return (
            <Product 
              product={product}
              key={product._id + idx} 
              ref={isLastProduct ? lastProductRef : null}
              user={user}
            />
          );
        })}

        <div className={styles.loading_screen}>
          {isLoading ?
            <ClockLoader />:
            null
          }
        </div>
      </div>
    </div>
  );
}

export default ProductCategoryList;
