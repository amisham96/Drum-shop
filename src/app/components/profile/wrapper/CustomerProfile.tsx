'use client';

import { useEffect, useState } from 'react';
import styles from './profile.module.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import Sidebar from '../../../components/profile/sidebar/sidebar';
import { useRouter, useSearchParams } from 'next/navigation';
import UserInfo from '../../../components/profile/userInfo/userInfo';
import ManageAddress from '../../../components/profile/address/manage/manageAddress';

type UserType = {
  fullName: string,
  email: string,
  phone: string,
}

function CustomerProfile() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // type of content to be shown
  const [type, setType] = useState(searchParams.get('type'));

  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);

  // function to get info of the logged in user
  async function getUserInfo() {
    setIsLoading(true);

    try {
      const res = await axios.get('/api/profile');
      const { user } = res.data;

      setUser(user);
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);     
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {    
    if (!type) {
      router.push('/profile?type=info');
    }
  }, [router, type]);

  useEffect(() => {
    setType(searchParams.get('type'));
  }, [searchParams]);

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
    // TODO: Handle initial loading state

    <main className={styles.main}>
      {/* side bar of the user profile */}
      <Sidebar user={user} type={type || 'info'} />

      {/* section displaying user info */}
      {(type === 'info') &&
        <UserInfo user={user} />
      }

      {/* section to manage user address */}
      {(type === 'address') &&
        <ManageAddress user={user} />
      }
    </main>
  )
}

export default CustomerProfile;
