'use client';

import { Dispatch, SetStateAction } from 'react';

import styles from './search.module.css';

type SearchPropsType = {
  searchVal: string,
  searchParam: string,
  setSearchVal: Dispatch<SetStateAction<string>>,
  setSearchParam: Dispatch<SetStateAction<string>>,
  handleSubmit: () => Promise<void>
}

function ProductsSearch(
  { searchVal, searchParam, setSearchVal, setSearchParam, handleSubmit }: SearchPropsType
) {
  return (
    <form
      className={styles.search_container}
      onKeyDown={(e) => {
        if (e.code === 'Enter') {
          e.preventDefault();
        }
      }}
    >
      <select 
        name="searchParam"
        value={searchParam}
        onChange={(e) => setSearchParam(e.target.value)}
      >
        <option value='name'>Name</option>
        <option value='id'>Id</option>
        <option value='hsnCode'>HSN Code</option>
      </select>

      <input 
        type="text" 
        placeholder={`Search items by ${searchParam}`}
        name='item_name'
        value={searchVal}
        onChange={(e) => setSearchVal(e.target.value)}
      />
      <button
        type='submit'
        onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        Search
      </button>
    </form>
  );
}

export default ProductsSearch;
