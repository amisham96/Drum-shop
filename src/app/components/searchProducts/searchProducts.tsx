'use client';

import React, { useState } from 'react';
import styles from './searchProducts.module.css';
import { LuSearch } from 'react-icons/lu';
import { useRouter, useSearchParams } from 'next/navigation';

function SearchProducts() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('query') || '');

  // function to search word and redirect
  function searchProduct() {
    if (searchQuery.length === 0) return;

    // refresh the store page with correct query params
    router.push(`/store?query=${searchQuery}`);
    router.refresh();
  }

  return (
    <div className={styles.search_container}>
      <input
        type='text'
        placeholder='Search products'
        onKeyUp={(e) => {
          if (e.key === 'Enter') searchProduct();
        }}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {/* search icon */}
      <div onClick={() => searchProduct()} className={styles.search_icon}>
        <LuSearch size={20} />
      </div>
    </div>
  )
}

export default SearchProducts;
