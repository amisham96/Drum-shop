/**
 * File: types/product.ts
 * Description: This file contains all the types for the data of products 
*/

type VariantsType = {
  color: string[],
  size: string[],
  material: string[],
};

type GroupsType = {
  color: string | null,
  size: string | null,
  material: string | null,
  quantity: number,
  price: number,
  _id: string,
};

type ProductType = {
  _id: string,
  name: string,
  category: string,
  brand: string,
  model: string,
  quantity ?: number,
  sellingPrice: number,
  discount: number,
  hsnCode: number,
  description: string,
  specification: string,
  images: string[],
  variants: VariantsType,
  groups: GroupsType[],
}

export {
  type VariantsType,
  type GroupsType,
  type ProductType,
};
