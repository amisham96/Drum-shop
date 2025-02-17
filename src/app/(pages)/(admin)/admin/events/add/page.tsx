'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { FaInstagram, FaFacebook, FaYoutube } from 'react-icons/fa6';
import { BsTwitterX } from 'react-icons/bs';
import { FiEdit2 } from 'react-icons/fi';
import { IoMdAdd } from 'react-icons/io';

import { BeatLoader } from 'react-spinners';
import axios from 'axios';
import toast from 'react-hot-toast';

import styles from './addEvent.module.css';
import { AddEventValidationSchema } from '../../../../../../validation/event'
import { ArtistType } from '../../../../../../types/event';
import { MdDeleteForever } from 'react-icons/md';
import { ImCancelCircle } from 'react-icons/im';
import { FaSearch } from 'react-icons/fa';
import { ProductType } from '../../../../../../types/product';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { useRouter } from 'next/navigation';

// TODO: add buttons and functionality to remove added artists and the products

type FormStateType = {
  name: string,
  location: string,
  date: string,
  time: string,
  status: string,
  details: string,
  featuredArtists: ArtistType[],
  featuredProducts: string[],
  socialLinks: {
    facebook: string,
    instagram: string,
    youtube: string,
    x: string,
  }
}

function AddEvent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const initialFormState: FormStateType = {
    name: '',
    location: '',
    date: '',
    time: '11:00',
    status: 'ongoing',
    details: '',
    featuredArtists: [],
    featuredProducts: [],
    socialLinks: {
      facebook: '',
      instagram: '',
      youtube: '',
      x: '',
    },
  }

  // state to input featuredArtists and featuredProducts
  const [showArtistInput, setShowArtistInput] = useState(false);
  const [artistInput, setArtistInput] = useState<ArtistType>({
    name: '',
    title: '',
    link: ''
  });

  const [showProductInputPopup, setShowProductInputPopup] = useState(false);
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [searchedProducts, setSearchedProducts] = useState<ProductType[]>([]);
  const [featuredProductDetails, setFeaturedProductDetails] = useState<ProductType[]>([]);

  // state to represent form state
  const [formState, setFormState] = useState(initialFormState);

  // poster and additional media
  const [poster, setPoster] = useState<File | null>(null);
  const [media, setMedia] = useState<File[]>([]);
  const [displayImgs, setDisplayImgs] = useState<string[]>([]);

  // function to update the form state
  function updateFormState(name: string, value: string) {
    // on input reset the state of the input element
    resetInputElement(name);

    const newFormState: FormStateType = {...formState};
    const keyname = name as keyof FormStateType;

    if (keyname === 'featuredArtists' ||
        keyname === 'socialLinks' || 
        keyname === 'featuredProducts') {
      return;
    }

    newFormState[keyname] = value;
    setFormState(newFormState);
  }

  // function to update social link
  function updateSocialLink(name: string, value: string) {
    setFormState((prevState) => {
      const updatedLinks = {
        ...prevState.socialLinks,
        [name]: value,
      };

      return {
        ...prevState,
        socialLinks: updatedLinks,
      }
    });
  }

  // function to add the artist entered to the form state
  function addFeaturedArtist() {
    setFormState((prevData => {
      return {
        ...prevData,
        featuredArtists: [...prevData.featuredArtists, artistInput],
      }
    }));
    setArtistInput({name: '', title: '', link: ''});
  }
  
  // function to validate fields
  function validateField(name: string, value: (string | number)) {
    // get the appopriate schema for the field
    const schemaShape = AddEventValidationSchema.shape;
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
  
  // function to handle image uploads
  function handleImageUpload(e: ChangeEvent<HTMLInputElement>, type: ('poster' | 'media')) {
    if (!e.target.files) return;
    
    if (type === 'media') {
      const images = (e.target.files);
      
      let invalidFileType = 0;
      let invalidFileSize = 0;

      // reject files that are above limited size and create object url to display
      const filteredFiles = Array.from(images)
                        .filter(img => {
                          if (img.type.split('/')[0] === 'image') {
                            return true;
                          } else {                            
                            invalidFileType += 1;
                          }
                        })

      const fileUrls = filteredFiles.map(img => URL.createObjectURL(img)) 
      
      setMedia(filteredFiles);
      setDisplayImgs(fileUrls);

      // display warning message if any files were rejected
      if (invalidFileSize > 0) {
        toast.error(`${invalidFileSize} images rejected as they were above size limit`)
      }
      if (invalidFileType > 0) {
        toast.error(`${invalidFileType} files rejected, as the file type was invalid`)  
      }
    } else if (type === 'poster') {
      const image = e.target.files[0];
      setPoster(image);

      if (image.type.split('/')[0] !== 'image') {
        toast.error('Poster rejected as the file type was invalid');
      }
    }
  }

  // function to submit the data to the api
  async function handleSubmit() {
    // validate the user input
    const validationRes = AddEventValidationSchema.safeParse(formState);

    // if the input data is invalid, show error
    if (!validationRes.success) {
      toast.error('Invalid input data');
      validationRes?.error.errors.forEach(error => {
        const { path, message } = error;
        addClassToInformUser(path[0].toString(), 'invalid', message);
      });
    } else if (!poster) {
      // if the poster is not uploaded, display error
      toast.error('Please upload poster of the event');
    } else { 
      setIsLoading(true);
      
      // if all the data is valid, send data to the server
      const formData = new FormData();

      formData.append('eventData', JSON.stringify(formState));      
      
      if (poster) {
        formData.append('poster', poster);
      }
      
      if (media) {
        for (let i = 0; i < media.length; i += 1) {
          formData.append('media', media[i]); 
        }
      }

      try {
        const res = await axios.post(
          '/api/admin/events/add',
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

        // clear the form state
        setFormState(initialFormState);
        setMedia([]);
        setPoster(null);
        setFeaturedProductDetails([]);
        setDisplayImgs([]);

        // reset input elements state
        const form = document.querySelector(`.${styles.add_event_form}`);
        const elements = form?.querySelectorAll('input, textarea');

        elements?.forEach((element) => {
          element.classList.remove(`${styles.input_valid}`);
          element.classList.remove(`${styles.input_invalid}`);
        });

        // clear the images input
        const imageInput: HTMLInputElement = document.querySelector('input[type="file"]')!;
        imageInput.value = '';
      } catch (error: any) {
        const errorData = error.response.data;
        const errorMessage = errorData.message;
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  }

  // function to search products based on the query entered
  async function searchProducts() {
    if (searchProductQuery.length == 0) return;

    setIsLoading(true);

    try {
      const res = await axios.get(
        `/api/products/search?query=${searchProductQuery}`,
        {
          withCredentials: true,
        }
      );

      const products = res.data.products;
      setSearchedProducts(products);
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // function to add the clicked product to the featured products
  function addProductToFeaturedProducts(addProduct: ProductType) {
    const addProductId = addProduct._id;
    const newFeaturedProducts = [...formState.featuredProducts];
    const productIdx = newFeaturedProducts.findIndex((product, i) => product === addProductId);
    
    setFormState((prevState) => {
      if (productIdx != -1) return prevState;
      else newFeaturedProducts.push(addProductId);

      return {
        ...prevState,
        featuredProducts: newFeaturedProducts
      }
    });

    setFeaturedProductDetails((prevState) => {
      if (productIdx != -1) return prevState;
      return [...prevState, addProduct];
    })
  }

  // function to remove the product from the featured products
  function removeProductFromFeaturedProducts(product: ProductType) {
    const productId = product._id;

    // remove the product from the formState.featuredProducts
    setFormState((prevState) => {
      const newFeaturedProducts = prevState.featuredProducts.filter((featuredProduct) => featuredProduct !== productId);
      return {
        ...prevState,
        featuredProducts: newFeaturedProducts,
      };
    });

    // remove the product from the featuredProductDetails
    setFeaturedProductDetails((prevState) => {
      return prevState.filter((featuredProduct) => featuredProduct._id != productId);
    });
  }

  // disable scrolling when the pop is being displayed
  useEffect(() => {
    if (showProductInputPopup) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [showProductInputPopup]);

  return (
    <main className={styles.main}>
      <div className={styles.primary_heading}>
        <h1>EVENT INFO</h1>

        <div className={styles.event_actions}>
          <button 
            className={styles.cancel_action}
            onClick={() => router.push('/events')}
          >
              Cancel
          </button>
          <button 
            className={styles.save_action} 
            onClick={(e) => handleSubmit()}
          >
            {(isLoading === true) ? 
              <BeatLoader /> :
              'Save'
            }
          </button>
        </div>
      </div>

      <form 
        className={styles.add_event_form}
      >
        <div className={styles.left_grid}>
          <div className={styles.form_part}>
            <h2 className={styles.section_heading}>BASIC INFORMATION</h2>

            <div className={styles.form_control}>
              <label htmlFor="name">Name</label>

              <input 
                type='text'
                name='name'
                value={formState.name}
                onChange={(e) => updateFormState('name', e.target.value)}
                onBlur={(e) => validateField('name', e.target.value)}
              />
              <span data-name='name' className={styles.error_msg}></span>
            </div>

            <div className={styles.form_control}>
              <label htmlFor="location">Location</label>

              <input 
                type='text'
                name='location'
                value={formState.location}
                onChange={(e) => updateFormState('location', e.target.value)}
                onBlur={(e) => validateField('location', e.target.value)}
              />
              <span data-name='name' className={styles.error_msg}></span>
            </div>

            <div className={styles.form_control}>
              <label htmlFor="date">Date</label>

              <input 
                type='date'
                name='date'
                value={formState.date}
                onFocus={(e) => e.target.type = 'date'}
                onChange={(e) => updateFormState('date', e.target.value)}
                onBlur={(e) => {
                  validateField('date', e.target.value);
                }}
              />
              <span data-name='date' className={styles.error_msg}></span>
            </div>
            
            <div className={styles.form_control}>
              <label htmlFor='time'>Time</label>

              <input 
                type='text'
                name='time'
                value={formState.time}
                onFocus={(e) => e.target.type = 'time'}
                onChange={(e) => updateFormState('time', e.target.value)}
                onBlur={(e) => {
                  validateField('time', e.target.value);
                }}
                placeholder='Time'
              />
              <span data-name='time' className={styles.error_msg}></span>
            </div>

            <div className={styles.form_control}>
              <label htmlFor='status'>Status</label>

              <select 
                value={formState.status}
                onChange={(e) => updateFormState('status', e.target.value)}
              >
                <option value="ongoing">On going</option>
                <option value="highlights">Highlights</option>
              </select>
            </div>
          </div>
          
          {(formState.status === 'highlights') &&
            <div className={styles.form_part}>
              <h2 className={styles.section_heading}>EVENT MEDIA</h2>

              {/* display added media files */}
              <div className={styles.added_pictures}>
                {(displayImgs.length > 0) &&
                  displayImgs.map((img, idx) => {
                    return (
                      <img src={img} key={idx} />
                    )
                  })
                }
              </div>

              <div className={styles.form_control}>
                <input 
                  type='file' 
                  name='poster'
                  accept='image/*'
                  multiple
                  onChange={(e) => handleImageUpload(e, 'media')}
                />

                <span>
                  - Picture of dimension 1920x1280 would be ideal
                </span>
              </div>              
            </div>
          }

          <div className={styles.form_part}>
            <h2 className={styles.section_heading}>EVENT DESCRIPTION</h2>

            <div className={styles.form_control}>
              <label htmlFor='details'>Details</label>
              <textarea 
                name='details' 
                value={formState.details}
                onChange={(e) => updateFormState('details', e.target.value)}
                onBlur={(e) => validateField('details', e.target.value)}
              />
              <span data-name='details' className={styles.error_msg}></span>
            </div>
          </div>
        </div>

        <div className={styles.right_grid}>
          <div className={styles.form_part}>
            <h2 className={styles.section_heading}>EVENT POSTER</h2>

            {poster &&
              <img 
                className={styles.display_poster}
                src={URL.createObjectURL(poster)} 
                alt='uploaded poster of the event' 
              />
            }

            <div className={styles.form_control}>
              <input 
                type='file' 
                name='poster'
                accept='image/*'
                onChange={(e) => handleImageUpload(e, 'poster')}
              />

              <span>
                - Picture of dimension 1920x1280 would be ideal
              </span>
            </div>
          </div>

          <div className={styles.form_part}>
            <h2 className={styles.section_heading}>SOCIAL LINKS</h2>

            <div>
              <div className={`${styles.form_control} ${styles.form_control_social}`}>
                <FaInstagram className={styles.social_icon} />
                <input 
                  type='text' 
                  value={formState.socialLinks.instagram}
                  onChange={(e) => updateSocialLink('instagram', e.target.value)}
                />
              </div>
              <div className={`${styles.form_control} ${styles.form_control_social}`}>
                <FaFacebook className={styles.social_icon} />
                <input 
                  type='text' 
                  value={formState.socialLinks.facebook}
                  onChange={(e) => updateSocialLink('facebook', e.target.value)}
                />
              </div>
              <div className={`${styles.form_control} ${styles.form_control_social}`}>
                <FaYoutube className={styles.social_icon} />
                <input 
                  type='text' 
                  value={formState.socialLinks.youtube}
                  onChange={(e) => updateSocialLink('youtube', e.target.value)}
                />
              </div>
              <div className={`${styles.form_control} ${styles.form_control_social}`}>
                <BsTwitterX className={styles.social_icon} />
                <input 
                  type='text' 
                  value={formState.socialLinks.x}
                  onChange={(e) => updateSocialLink('x', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.form_part}>
            <div className={styles.section_heading_container}>
              <h2 className={styles.section_heading}>SPECIAL GUESTS</h2>
              <div
                className={styles.icon_container}
                onClick={() => setShowArtistInput(true)}
              >
                <FiEdit2 />
              </div>
            </div>

            {/* display all the added artists */}
            {(formState.featuredArtists.length > 0) &&
              (<div className={styles.featured_artists_container}>
                {formState.featuredArtists.map((artist, idx) => {
                  return (
                    <div className={styles.featured_artist} key={idx}>
                      {((artist.link) && (artist.link.length > 0)) ?
                        // TODO: the links might open in the current tab if the protocol is not specified
                        <a href={artist.link} target='_blank' rel='noreferrer'>{artist.name}</a> :
                        <p>{artist.name}</p>
                      }

                      <span>({artist.title})</span>

                      <div
                        className={styles.icon_container}
                        onClick={() => {
                          setFormState((prevState) => {
                            const newArtists = prevState.featuredArtists.filter((artist, id) => id !== idx);
                            
                            return {
                              ...prevState,
                              featuredArtists: newArtists,
                            }
                          })
                        }}
                      >
                        <MdDeleteForever size={10} />
                      </div>
                    </div>
                  )
                })}
              </div>)
            }

            {/* artist input fields */}
            {(showArtistInput &&
              <div className={styles.artist_input_container}>
                <div className={`${styles.form_control} ${styles.form_control_artist}`}>
                  <label>Artist Name</label>
                  <input 
                    type='text' 
                    value={artistInput.name}
                    onChange={(e) => setArtistInput((prevState) => {
                      return {
                        ...prevState,
                        name: e.target.value,
                      }
                    })}
                  />
                </div>
                <div className={`${styles.form_control} ${styles.form_control_artist}`}>
                  <label>Artist Title</label>
                  <input 
                    type='text' 
                    value={artistInput.title}
                    onChange={(e) => setArtistInput((prevState) => {
                      return {
                        ...prevState,
                        title: e.target.value,
                      }
                    })}
                  />
                </div>
                <div className={`${styles.form_control} ${styles.form_control_artist}`}>
                  <label>Artist Profile</label>
                  <input 
                    type='text' 
                    value={artistInput.link}
                    onChange={(e) => setArtistInput((prevState) => {
                      return {
                        ...prevState,
                        link: e.target.value,
                      }
                    })}
                  />
                </div>

                <div className={styles.artist_input_actions}>
                  <button 
                    onClick={() => {
                      // clear the input
                      setArtistInput({
                        name: '',
                        title: '',
                        link: '',
                      });

                      // close the input container
                      setShowArtistInput(false);
                    }}
                    type='button'
                  >
                    Cancel
                  </button>
                  <button type='button' onClick={() => addFeaturedArtist()}>Save</button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.form_part}>
            <div className={styles.section_heading_container}>
              <h2 className={styles.section_heading}>FEATURED PRODUCTS</h2>
              <div
                className={styles.icon_container}
                onClick={() => setShowProductInputPopup(true)}
              >
                <FiEdit2 />
              </div>
            </div>

            {/* show the featured product input popup on click */}
            {(showProductInputPopup) &&
              <div className={styles.featured_product_input_container}>
                <div className={styles.featured_product_inner_container}>
                  <div className={styles.popup_heading}>
                    <h1>Tag featured products</h1>
                    <p>Select products to feature them at the event</p>
                    <div 
                      className={styles.cancel_icon}
                      onClick={() => setShowProductInputPopup(false)}
                    >
                      <ImCancelCircle size={20} />
                    </div>
                  </div>

                  <div className={styles.popup_search_container}>
                    <p>Search Product</p>

                    <div className={styles.search_input}>
                      <input
                        type='text'
                        value={searchProductQuery}
                        onChange={(e) => setSearchProductQuery(e.target.value)}
                        placeholder='Enter product name or model'
                      />
                      <div 
                        onClick={() => searchProducts()}
                        className={styles.search_icon}
                      >
                        {(isLoading) ?
                          <BeatLoader /> :
                          <FaSearch size={20} />
                        }
                      </div>
                    </div>

                    {/* display searched products */}
                    {(searchedProducts.length > 0) &&
                      <div className={styles.searched_products_container}>
                        {searchedProducts.map((searchedProduct, idx) => {
                          return (
                            <div className={styles.searched_product} key={idx}>
                              <div>
                                <p>{searchedProduct.name}</p>
                                <p>{searchedProduct.model}</p>
                              </div>
                              <button onClick={() => addProductToFeaturedProducts(searchedProduct)} type='button'>
                                <IoMdAdd size={20} />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    }

                    {/* display currently added products in the popup */}
                    <div className={styles.product_list_outer_container}>
                      <h3 className={styles.section_heading}>Current List</h3>

                      <div className={styles.current_product_list}>
                        {featuredProductDetails.map((product, idx) => {
                          return (
                            <div className={styles.current_product} key={idx}>
                              <img src={product.images[0]} />                            
                              <p>{product.name}</p>
                              <p>{product.model}</p>

                              <div 
                                onClick={() => removeProductFromFeaturedProducts(product)} 
                                className={styles.delete_icon}
                              >
                                <RiDeleteBin6Line size={20} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            <div className={styles.featured_products_container}>
              {/* display featured products here */}
              {featuredProductDetails.map((featuredProduct, idx) => {
                return (
                  <div key={idx}>
                    <p>{featuredProduct.model}</p>
                    <p>{featuredProduct.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

export default AddEvent