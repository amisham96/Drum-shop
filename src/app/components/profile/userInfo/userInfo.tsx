'use client';

import Link from 'next/link'
import { MdEdit } from 'react-icons/md'
import styles from './userInfo.module.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useEffect, useState } from 'react';
import { BeatLoader } from 'react-spinners';

type UserType = {
  fullName: string,
  email: string,
  phone: string,
}

function UserInfo(props: { user: UserType | null }) {
  const [user, setUser] = useState<UserType | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [newName, setNewName] = useState('');

  // function to update name of the user
  async function updateName() {
    setIsLoading(true);

    try {
      await axios.post('/api/profile/name/update', { name: newName });

      toast.success('Name updated successfully');
      setName(newName);
      setNewName('');
      setShowNameInput(false);      
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);     
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (props.user) {
      setUser(props.user);
      setName(props.user.fullName);
      setNewName(props.user.fullName);
    }
  }, [props]);

  return (
    <section className={styles.user_info}>
      <div className={styles.info_part}>
        <span>Name</span>
        {(!showNameInput) && <p>{name}</p>}

        {(!showNameInput) &&
          (<div onClick={() => setShowNameInput(true)} className={styles.edit_icon}>
            <MdEdit size={20} />
          </div>)
        }

        {(showNameInput) &&
          <div className={styles.new_name_container}>
            <input 
              type='text'
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />

            <div className={styles.new_name_actions}>
              <button 
                onClick={() => updateName()}
              >
                {isLoading ?
                  <BeatLoader size={10} /> :
                  'Save'
                }
              </button>
              <button onClick={() => setShowNameInput(false)}>Cancel</button>
            </div>
          </div>
        }
      </div>

      <div className={styles.info_part}>
        <span>Email</span>
        <p>{user?.email}</p>

        <Link href={'/profile/email/update'} className={styles.edit_icon}>
          <MdEdit size={20} />
        </Link>
      </div>
      
      <div className={styles.info_part}>
        <span>Phone</span>
        <p>{user?.phone || '-'}</p>

        <Link href={'/profile/phone/update'} className={styles.edit_icon}>
          <MdEdit size={20} />
        </Link>
      </div>
    </section>
  );
}

export default UserInfo;
