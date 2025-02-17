/*
 * Description: This page is to edit a product from the admin dashboard
*/

'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { BeatLoader, ClockLoader } from 'react-spinners';
import { useParams, useRouter } from 'next/navigation';

import { GrAdd } from 'react-icons/gr';
import { FaXmark } from 'react-icons/fa6';
import { MdDeleteForever } from 'react-icons/md';

import styles from './edit.module.css';
import { AddProductValidationSchema } from '../../../../../../../validation/product';

type FormStateType = {
  name: string,
  category: string,
  brand: string,
  model: string,

  quantity: number,
  costPrice: number,
  sellingPrice: number,
  cgst: number,
  sgst: number,
  discount: number,
  hsnCode: number,

  description: string,
  specification: string,
};

type VariantType = {
  name: string,
  values: string[],
}

type GroupType = {
  color: string | null,
  size: string | null,
  material: string | null,
  quantity: number,
  price: number,
}

type DisplayImageType = {
  url: string,
  type: ('new' | 'old'),
  delete: boolean,
  isPrimary: boolean,
}

function AddProduct() {
  // get the url parameters
  const params = useParams<{productId: string}>();

  const router = useRouter();

  // different loading state
  const [fetchingProduct, setFetchingProduct] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const MAX_IMAGE_SIZE = 150; // KB

  const defaultFormState: FormStateType = {
    name: '',
    category: 'drums',
    brand: '',
    model: '',

    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
    cgst: 0,
    sgst: 0,
    discount: 0,
    hsnCode: 0,

    description: '',
    specification: '',
  };

  // state to hold all the form input, except variants and groups
  const [formState, setFormState] = useState<FormStateType>(defaultFormState);

  // state that holds the newly uploaded images
  const [images, setImages] = useState<FileList | null>(null);

  // display uploaded images (both old and new ones)
  const [displayImgs, setDisplayImgs] = useState<DisplayImageType[]>([]);

  // show 'add variant' fields
  const [showAddVarient, setShowAddVarient] = useState(false);

  // all variants data
  const [variants, setVariants] = useState<VariantType[]>([]);

  // variant values for certain type
  const [variantVal, setVariantVal] = useState<string[]>([]);

  // compute all possible 'groups' for all variants added
  const [groups, setGroups] = useState<GroupType[]>();

  // function to add variant value entered by the user
  function addVariantValue() {
    const valInputContainer = document.querySelector(`.${styles.variant_val_input}`);
    const input = valInputContainer?.querySelector('input');
    const inputVal = input?.value;

    if (!inputVal) return;
    if (inputVal.trim().length === 0) return;
    
    setVariantVal((prevState) => Array.from(new Set([...prevState, inputVal])));
    input.value = '';
  }

  // function to remove variant val 
  function removeVariantVal(val: string, idx: number) {
    setVariantVal((prevState) => {
      return prevState.filter((variantVal) => variantVal !== val); 
    });
  }

  // save the variants added by user so far
  function saveVariantVal() {
    const variantName: HTMLSelectElement = document.querySelector('#variantName')!;
    
    // check if the variant type already exist
    for(let i = 0; i < variants.length; i += 1) {
      if (variants[i].name === variantName.value) {
        toast.error('Variant type already added');
        return;
      }
    }

    // if the variants value is empty, don't add the variant
    if (variantVal.length === 0) {
      toast.error('Variant values can\'t be empty');
      return;
    }

    // add the new variant 
    const newVariant = {
      name: variantName.value,
      values: variantVal,
    }

    setVariants((prevData) => [...prevData, newVariant]);

    // clear other states
    setShowAddVarient(false);
    setVariantVal([]);
  }

  // function to remove variant type completely
  function removeVariant(variantName: string) {
    setVariants((prevData) => {
      return prevData.filter((val) => val.name !== variantName);
    })
  }

  // function to update form state on user input
  function updateFormState(name: string, value: string) {
    // on input reset the state of the input element
    resetInputElement(name);

    const newFormState: {[key: string]: (string | number)} = {...formState};
    const keyname = name as keyof FormStateType;

    const stringFields: Array<keyof FormStateType> = ['name', 'category', 'brand', 'model', 'description', 'specification'];

    if (stringFields.includes(keyname)) {
      newFormState[keyname] = value;
    } else {
      if (value.length === 0 || parseFloat(value) < 0) {
        newFormState[keyname] = 0; 
      }
      else {
        newFormState[keyname] = parseFloat(value);
      }
    }

    setFormState(newFormState as FormStateType);
  }

  // function to handle image uploads
  function handleImageUpload(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      const images = Array.from(e.target.files);
      setImages(e.target.files);
      
      let invalidFileType = 0;
      let invalidFileSize = 0;

      // reject files that are above limited size and create object url to display
      const displayImgs = images
                        .filter(img => {
                          if (img.type.split('/')[0] === 'image') {
                            return true;
                          } else {                            
                            invalidFileType += 1;
                          }
                        }) // filter by image type
                        .filter(img => {
                          if (img.size <= (MAX_IMAGE_SIZE * 1024)) {
                            return true;
                          } else {
                            invalidFileSize += 1;
                          }
                        }) // filter by image size
                        .map(img => {
                          return {
                            url: URL.createObjectURL(img),
                            type: 'new',
                            delete: false,
                            isPrimary: false,
                          } as DisplayImageType
                        }) 

      setDisplayImgs((prevState) => {
        return [...prevState, ...displayImgs];
      }); 

      // display warning message if any files were rejected
      if (invalidFileSize > 0) {
        toast.error(`${invalidFileSize} images rejected as they were above size limit`)
      }
      if (invalidFileType > 0) {
        toast.error(`${invalidFileType} files rejected, as the file type was invalid`)  
      }
    }    
  }
  
  // function to change primary image
  function changePrimaryImage(idx: number) {
    const tempImages = [...displayImgs];
    
    // remove current image from primary
    tempImages[0].isPrimary = false;

    // get the image selected and mark as primary
    const image = tempImages.splice(idx, 1)[0];
    image.isPrimary = true;

    // remove the image at the given index and add it to the beginning
    tempImages.unshift(image);
    setDisplayImgs(tempImages);
  }

  // function to validate fields
  function validateField(name: string, value: (string | number)) {
    // get the appopriate schema for the field
    const schemaShape = AddProductValidationSchema.shape;
    const fieldSchemaShape = schemaShape[name as keyof typeof schemaShape];

    const validateField = fieldSchemaShape.safeParse(value);

    // if the field has an invalid value, show error
    if (validateField.success === false) {
      // display the error message one at a time
      const issue = validateField.error.issues[0];
      const message = issue.message;

      addClassToInformUser(name, 'invalid', message);
    } else {
      // add success class to the input field
      addClassToInformUser(name, 'valid');
    }
  }

   // function to add different classes to input elements based on valid/invalid inputs
   function addClassToInformUser(name: string, status: 'invalid' | 'valid', message ?: string) {
    // get the correct input element using the name attribute
    let inputElement = document.querySelector(`input[name="${name}"]`);

    // if input element is empty, check for textarea
    if (inputElement === null) {
      inputElement = document.querySelector(`textarea[name="${name}"]`)
    }

    // add the correct class and display message if needed
    if (status === 'invalid') {
      // inputElement.classList
      inputElement?.classList.add(styles.input_invalid);

      // if there is a message provided, display it
      const messageContainer = document.querySelector(`[data-name="${name}"]`);
      if (message && messageContainer) {
        messageContainer.innerHTML = message;
        messageContainer.classList.add(styles.display_error_message);
      }
    } else if (status === 'valid') {
      inputElement?.classList.add(styles.input_valid);
    }
  }

  // function to reset the classes added to inform user
  function resetInputElement(name: string) {
    let inputElement = document.querySelector(`input[name="${name}"]`);

    if (inputElement === null) {
      inputElement = document.querySelector(`textarea[name="${name}"]`)
    }

    inputElement?.classList.remove(styles.input_invalid);
    inputElement?.classList.remove(styles.input_valid);
    
    const messageContainer = document.querySelector(`[data-name="${name}"]`);
    if (messageContainer) {
      messageContainer.classList.remove(styles.display_error_message);
      messageContainer.innerHTML = '';
    }
  }

  // function to submit all the data to the backend
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // convert variants object into array before adding it to productData
    const tempVariants: {[key: string]:string[] } = {};
    
    variants.forEach((variant) => {
      tempVariants[variant.name] = [...variant.values];
    });

    const productData = {
      ...formState,
      variants: {...tempVariants},
      groups,
    };

    // validate the input data
    const validationRes = AddProductValidationSchema.safeParse(productData);

    if (!validationRes.success) {
      // if validation fails, show error
      toast.error('Invalid input data');

      validationRes?.error.errors.forEach(error => {
        const { path, message } = error;
        addClassToInformUser(path[0].toString(), 'invalid', message);
      });
    } else {
      // else send the data to the api
      setIsLoading(true);
  
      const formData = new FormData();
      formData.append('productData', JSON.stringify(productData));

      // iterate over each file and add them to the formData
      if (images) {
        for (let i = 0; i < images.length; i += 1) {
          formData.append('images', images[i]);
        }
      }

      // add the status of the old images
      const oldImages = displayImgs.filter((img, idx) => {
        return (img.type === 'old');
      });

      formData.append('oldImages', JSON.stringify(oldImages));

      try {
        const res = await axios.put(
          `/api/admin/products/${params.productId}/edit`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
          }
        );

        const successMessage = res.data.message;
        toast.success(successMessage);

        // redirect the admin user to new product page
        router.push(`/products/${params.productId}`);
      } catch (error: any) {
        const errorData = error.response.data;
        const errorMessage = errorData.message;
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }    
  }

  // function to fetch the product being edited
  async function fetchProduct() {
    setFetchingProduct(true);

    try {
      const { productId } = params;
      const res = await axios.get(`/api/admin/products/${productId}`);
      
      const { product } = res.data;      
      setFormState(product);
      
      // add the old images to state
      const imagesArr: DisplayImageType[] = product.images.map((img: string, idx: number) => {
        return { 
          url: img, 
          type: 'old', 
          delete: false,
          isPrimary: (idx === 0) // the first image is primary by default
        }
      });
      setDisplayImgs(imagesArr);
      
      // convert the variants into VariantType objects and then update the state
      const variantsObj: VariantType[] = [];
      Object.keys(product.variants).forEach((variantType) => {
        const values = product.variants[variantType];
        if (values.length > 0) {
          variantsObj.push({
            name: variantType,
            values,
          });
        }
      });

      setVariants(variantsObj);      
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setFetchingProduct(false);
    }
  }

  // mark an uploaded image as deleted
  function markImageAsDeleted(idx: number) {
    setDisplayImgs((prevState) => {
      const tempImgs = [...prevState];

      // toggle the delete property
      tempImgs[idx].delete = !tempImgs[idx].delete;      

      if (idx === 0) {
        tempImgs[idx].isPrimary = false;
        tempImgs[1].isPrimary = true;
      }

      return [...tempImgs];
    })
  }

  // update groups as variants change
  useEffect(() => {
    const colors = variants.find(v => v.name === 'color')?.values || [];
    const sizes = variants.find(v => v.name === 'size')?.values || [];
    const materials = variants.find(v => v.name === 'material')?.values || [];

    let allGrps: GroupType[] = [];

    const genericPrice = formState.sellingPrice;

    sizes?.forEach((size) => {
      allGrps.push({
        color: null,
        size: size,
        material: null,
        quantity: 0,
        price: genericPrice,
      });
    });

    // if some groups were generated due to sizes, add colors for each one of them
    if (allGrps.length > 0) {
      if (colors.length > 0) {
        const temp = [...allGrps];
        allGrps = [];
  
        temp.forEach((grp) => {
          colors.forEach((color) => {
            allGrps.push({...grp, color});
          });  
        });
      }
    } else {
      // else just create new groups from colors
      colors?.forEach((color) => {
        allGrps.push({
          color: color,
          size: null,
          material: null,
          quantity: 0,
          price: genericPrice,
        });
      });
    }

    if (allGrps.length > 0) {
      if (materials.length > 0) {
        const temp = [...allGrps];
        allGrps = [];

        temp.forEach((grp) => {
          materials.forEach((material) => {
            allGrps.push({...grp, material});
          });  
        });
      }
    } else {
      materials?.forEach((material) => {
        allGrps.push({
          color: null,
          size: null,
          material: material,
          quantity: 0,
          price: genericPrice,
        });
      });
    }

    setGroups(allGrps);
  }, [variants, formState.sellingPrice]);

  // fetch the product to be edited
  useEffect(() => {
    fetchProduct();
  }, []);

  return (
    <main className={styles.main}>
      <h1>Edit product</h1>

      {/* display this loader while fetching product data */}
      {fetchingProduct && 
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          margin: '2rem 0'
        }}>
          <ClockLoader />          
        </div>
      }

      <form 
        className={styles.edit_product_form} 
        onSubmit={(e) => handleSubmit(e)}
      >
        {/* form part one containing basic information of the product */}
        <div className={styles.form_part}>
          <div className={styles.form_control}>
            <label htmlFor="name">Product Name</label>
            <input 
              type="text" 
              name='name'
              value={formState.name}
              onChange={(e) => updateFormState('name', e.target.value)}
              onBlur={(e) => validateField('name', e.target.value)}
            />
            <span data-name='name' className={styles.error_msg}></span>
          </div>

          <div className={styles.form_control}>
            <label htmlFor="category">Category</label>
            <select 
              name='category' 
              value={formState.category} 
              onChange={(e) => updateFormState('category', e.target.value)}
            >
              <option value="drums">Drums</option>
              <option value="cymbals">Cymbals</option>
              <option value="electric kits and pads">Electric kits and pads</option>
              <option value="tabla">Tabla</option>
              <option value="cajon">Cajon</option>
            </select>
          </div>

          <div className={styles.form_control}>
            <label htmlFor="brand">Brand</label>
            <input 
              type="text" 
              name='brand'
              value={formState.brand}
              onChange={(e) => updateFormState('brand', e.target.value)}
              onBlur={(e) => validateField('brand', e.target.value)}
            />
            <span data-name='brand' className={styles.error_msg}></span>
          </div>

          <div className={styles.form_control}>
            <label htmlFor="model">Model(SKU)</label>
            <input 
              type="text"
              name='model' 
              value={formState.model}
              onChange={(e) => updateFormState('model', e.target.value)}
              onBlur={(e) => validateField('model', e.target.value)}
            />
            <span data-name='model' className={styles.error_msg}></span>
          </div>

          <div className={styles.form_control}>
            <label htmlFor="costPrice">Cost price</label>
            <input 
              type="number" 
              name='costPrice'
              value={formState.costPrice.toString()}
              onChange={(e) => updateFormState('costPrice', e.target.value)}
              onBlur={(e) => validateField('costPrice', parseFloat(e.target.value))}
            />
            <span data-name='costPrice' className={styles.error_msg}></span>
          </div>

          <div className={styles.form_control}>
            <label htmlFor="sellingPrice">Selling price</label>
            <input 
              type="number" 
              name='sellingPrice'
              value={formState.sellingPrice.toString()}
              onChange={(e) => updateFormState('sellingPrice', e.target.value)}
              onBlur={(e) => validateField('sellingPrice', parseFloat(e.target.value))}
            />
            <span data-name='sellingPrice' className={styles.error_msg}></span>
          </div>

          <div className={styles.form_control}>
            <label htmlFor="quantity">Quantity</label>
            <input 
              type="number" 
              name='quantity'
              value={formState.quantity.toString()}
              onChange={(e) => updateFormState('quantity', e.target.value)}
              onBlur={(e) => validateField('quantity', parseFloat(e.target.value))}
            />
            <span data-name='sellingPrice' className={styles.error_msg}></span>
          </div>
          
          <div className={styles.form_control}>
            <label htmlFor="cgst">CGST</label>
            <input 
              type="number" 
              name='cgst'
              value={formState.cgst.toString()}
              onChange={(e) => updateFormState('cgst', e.target.value)}
              onBlur={(e) => validateField('cgst', parseFloat(e.target.value))}
            />
            <span data-name='cgst' className={styles.error_msg}></span>
          </div>

          <div className={styles.form_control}>
            <label htmlFor="sgst">SGST</label>
            <input 
              type="number" 
              name='sgst'
              value={formState.sgst.toString()}
              onChange={(e) => updateFormState('sgst', e.target.value)}
              onBlur={(e) => validateField('sgst', parseFloat(e.target.value))}
            />
            <span data-name='sgst' className={styles.error_msg}></span>
          </div>

          <div className={styles.form_control}>
            <label htmlFor="discount">Discount</label>
            <input 
              type="number" 
              name='discount'
              value={formState.discount.toString()}
              onChange={(e) => updateFormState('discount', e.target.value)}
              onBlur={(e) => validateField('discount', parseFloat(e.target.value))}
            />
            <span data-name='discount' className={styles.error_msg}></span>
          </div>

          <div className={styles.form_control}>
            <label htmlFor="hsnCode">HSN Code</label>
            <input 
              type="number" 
              name='hsnCode'
              value={formState.hsnCode}
              onChange={(e) => updateFormState('hsnCode', e.target.value)}
              onBlur={(e) => validateField('hsnCode', parseFloat(e.target.value))}
            />
            <span data-name='hsnCode' className={styles.error_msg}></span>
          </div>
        </div>

        {/* form part two: image inputs */}
        <div className={styles.form_part}>
          <div className={styles.form_control}>
            <label htmlFor="images">Upload images</label>
            <input
              type="file" 
              accept='image/*'
              name='images'
              multiple
              onChange={(e) => handleImageUpload(e)}
            />            
            <span>
              - Maximum size of an image should be {MAX_IMAGE_SIZE} KB <br />
              - Click on image to make it primary image <br />
              - Images uploaded previously (while adding products) can be marked for removal
            </span>
          </div>

          {/* display the images after they are uploaded */}
          {(displayImgs.length > 0) && (
            <div className={styles.images_added}>
              {displayImgs.map((img, idx) => {
                if (img.delete === true) return;

                return (
                  <div key={idx}>
                    {(img.isPrimary) && (<span>Primary image</span>)}
                    <img 
                      src={img.url}
                      alt='product image'
                      onClick={() => changePrimaryImage(idx)}
                    />
                    {(img.type === 'old') && (
                      <div>
                        <label>Delete this image?</label>
                        <input 
                          type='checkbox' 
                          checked={img.delete}
                          onChange={() => markImageAsDeleted(idx)}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* display deleted images */}
          {(displayImgs.length > 0) && (
            <>
              <h4>Images marked for deletion</h4>
              <div className={styles.images_deleted}>
                {displayImgs.map((img, idx) => {
                  if (img.delete === false) return;

                  return (
                    <div key={idx}>
                      <img 
                        src={img.url}
                        alt='product image'
                      />
                      {(img.type === 'old') && (
                        <div>
                          <label>Add this image back?</label>
                          <input 
                            type='checkbox' 
                            checked={img.delete}
                            onChange={() => markImageAsDeleted(idx)}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* form part three: containing description and specs */}
        <div className={styles.form_part}>
          <div className={styles.form_control}>
            <label htmlFor="description">Description</label>
            <textarea
              name='description'
              value={formState.description}
              onChange={(e) => updateFormState('description', e.target.value)}
              onBlur={(e) => validateField('description', e.target.value)}
            />
            <span data-name='description' className={styles.error_msg}></span>
          </div>

          <div className={styles.form_control}>
            <label htmlFor="specification">Specification</label>
            <textarea 
              name='specification'
              value={formState.specification}
              onChange={(e) => updateFormState('specification', e.target.value)}
              onBlur={(e) => validateField('specification', e.target.value)}
            />
            <span data-name='specification' className={styles.error_msg}></span>
          </div>
        </div>

        {/* form part four: variant options */}
        <div className={styles.form_part}>
          <div className={styles.form_control}>
            <label htmlFor="variants">Variants</label>

            {/* display the variants added so far */}
            <div className={styles.variants_added}>
              {variants.map((variant, idx) => {
                return (
                  <div key={idx}>
                    <h4>{variant.name} : </h4>
                    {variant.values.map((val, id) => {
                      return (<span key={id}>{val} </span>);
                    })}
                    <MdDeleteForever
                      className={styles.delete_variant} 
                      onClick={() => removeVariant(variant.name)}
                    />
                  </div>
                );
              })}
            </div>
            
            {/* form to add more variants */}
            {(showAddVarient === true) &&
              <div className={styles.variant_sub_form}>
                <div className={styles.form_control}>
                  <label htmlFor="optionName">Option name</label>
                  <select id='variantName' name="variantName">
                    <option value="color">Color</option>
                    <option value="size">Size</option>
                    <option value="material">Material</option>
                  </select>
                </div>

                <div className={`${styles.form_control} ${styles.variant_val_input}`}>
                  <label htmlFor="optionValue">Option value</label>
                  <div>
                    <input
                      type="text"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                        }
                      }} 
                    />
                    <GrAdd onClick={addVariantValue} />
                  </div>

                  {/* display the variant values added above */}
                  <div className={styles.variant_inputs}>
                    {variantVal.map((val, idx) => {
                      return (
                        <div key={idx}>
                          {val}
                          <FaXmark onClick={() => removeVariantVal(val, idx)} />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button type='button' onClick={saveVariantVal}>Save</button>
                <button type='button' onClick={() => setShowAddVarient(false)}>Close</button>
              </div>          
            }

            {(variants.length < 3) &&
              <button
                type='button'
                className={styles.add_variant_btn}
                onClick={() => setShowAddVarient(true)}
              >
                <GrAdd /> Add variant
              </button>
            }
          </div>
        </div>

        {/* form part five: adding quantity and price for each variant */}
        {(variants.length > 0) && (
          <div className={styles.form_part}>
            <h4>All groups</h4>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Color</th>
                  <th>Material</th>
                  <th>Price (INR)</th>
                  <th>Quantity</th>
                </tr>
              </thead>
            
              <tbody>
              {groups?.map((group, idx) => {
                return (
                  <tr key={idx}>
                    <td>{group?.size || '-'}</td>
                    <td>{group?.color || '-'}</td>
                    <td>{group?.material || '-'}</td>
                    <td>
                      <input
                        type="number"
                        placeholder='₹ 0.00' 
                        value={group.price.toString()}
                        onChange={(e) => {
                          const temp = [...groups];
                          const val = e.target.value;                          

                          if ((val.length === 0) || (parseInt(val) < 0)) {
                            temp[idx].price = 0;
                          } else {
                            temp[idx].price = parseInt(e.target.value);
                          }

                          setGroups(temp);
                        }}
                      />
                    </td>
                    <td>
                      <input 
                        type="number"
                        placeholder='0' 
                        value={group.quantity.toString()}
                        onChange={(e) => {
                          const temp = [...groups];                          
                          const val = e.target.value;                          

                          if ((val.length === 0) || (parseInt(val) < 0)) {
                            temp[idx].quantity = 0;
                          } else {
                            temp[idx].quantity = parseInt(e.target.value);
                          }

                          setGroups(temp);
                        }}
                      />
                    </td>
                  </tr>
                )
              })}
              </tbody>
            </table>
          </div>
        )}

        <button
          className={styles.submit_btn}
          type='submit'
        >
          {(isLoading === true) ?
            <BeatLoader color='white' /> :  
          'Edit product'
          }
        </button>
      </form>
    </main>
  );
}

export default AddProduct;