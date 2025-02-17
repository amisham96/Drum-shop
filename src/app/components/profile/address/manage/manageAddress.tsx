'use client';

import { useEffect, useState } from 'react';
import styles from './manageAddress.module.css';
import AddAddress from '../add/addAddress';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Address } from '../../../../../types/address';
import { MdOutlineModeEdit } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { ClipLoader } from 'react-spinners';
import EditAddress from '../edit/editAddress';

type UserType = {
  fullName: string,
  email: string,
  phone: string,
}

function ManageAddress({ user } : { user: UserType | null }) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const [initialFetch, setInitialFetch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // state to store all the fetched addresses
  const [allAddress, setAllAddress] = useState<Address[]>([]);

  // state to depict address to be edited
  const [addressToBeEdited, setAddressToBeEdited] = useState<Address | null>(null);

  // state to depict address being deleted
  const [addressToBeDeleted, setAddressToBeDeleted] = useState('');

  // function to fetch all the current addresses of the user
  async function fetchAddresses() {
    setInitialFetch(true);

    try {
      const res = await axios.get('/api/profile/address');
      
      const { allAddress } = res.data;
      setAllAddress(allAddress);
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setInitialFetch(false);
    }
  }

  // function to delete a address
  async function deleteAddress(addressId: string) {
    setAddressToBeDeleted(addressId);
    setIsLoading(true);

    try {
      const res = await axios.delete(`/api/profile/address/${addressId}`);
      console.log(res.data);

      toast.success('Address deleted successfully');
      setAllAddress((prevState) => {
        return prevState.filter((a) => a._id !== addressId);
      });
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setAddressToBeDeleted('');
    }
  }
  
  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (showAddressForm) document.body.style.overflow = 'hidden'; 
    else document.body.style.overflow = '';
  }, [showAddressForm]);

  return (
    <main className={styles.main}>
      {/* show add address form */}
      {(showAddressForm) && 
        <AddAddress 
          setShowAddressForm={setShowAddressForm}
          user={user}
        />
      }

      {/* show edit address form */}
      {(showEditForm) && 
        <EditAddress 
          setShowEditForm={setShowEditForm}
          user={user}
          address={addressToBeEdited}
          allAddress={allAddress}
          setAllAddress={setAllAddress}
        />
      }

      <h1>MANAGE ADDRESSES</h1>

      {/* display a loader while the component is loading */}
      {(initialFetch) &&
        <div className={styles.loader}>
          <ClipLoader size={80} />
        </div>
      }

      {(!initialFetch) &&
        <>
          <div className={styles.address_container}>
            {allAddress.map((address, idx) => {
              return (
                <div key={idx} className={styles.address_inner_container}>
                  <div className={styles.address}>
                    <div className={styles.first_line}>
                      <span className={styles.name}>{address.name} </span>
                      <span className={styles.phone}>{address.phone}</span>
                      <span className={styles.address_type}>{address.addressType.toUpperCase()}</span>
                    </div>

                    <p>{address.address}</p>
                    <div>
                      <span>{address.city + ', '}</span>
                      <span>{address.state + ', '}</span>
                      <span>{address.pinCode}</span>
                    </div>
                  </div>

                  <div className={styles.address_actions}>
                    {(addressToBeDeleted === address._id) ?
                      <ClipLoader size={20} /> :
                      <>
                        <div onClick={() => {
                          setAddressToBeEdited(address);
                          setShowEditForm(true);
                        }}>
                          <MdOutlineModeEdit size={20} />
                        </div>
                        <div onClick={() => deleteAddress(address._id)}>
                          <RiDeleteBin6Line size={20} />
                        </div>
                      </>
                    }
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setShowAddressForm(true)}
            className={styles.add_address_btn}
          >
            Add Address
          </button>
        </>
      }
    </main>
  );
}

export default ManageAddress;
