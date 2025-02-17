import { IoIosArrowForward, IoMdLogOut } from 'react-icons/io';
import styles from './sidebar.module.css';
import { BiPurchaseTagAlt } from 'react-icons/bi';
import { RiAccountPinBoxLine } from 'react-icons/ri';
import { FaCircleUser } from 'react-icons/fa6';
import { MouseEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarLoader, ClipLoader } from 'react-spinners';
import axios from 'axios';
import toast from 'react-hot-toast';

type UserType = {
  fullName: string,
  email: string,
  phone: string,
}

function Sidebar({ user, type }: { user: UserType | null, type: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // function to change active menu entry
  function updateActiveEntry(e: MouseEvent) {
    // remove the previous active entries
    const prevActiveEntry = document.querySelector(`.${styles.menu_entry_active}`);
    prevActiveEntry?.classList.remove(`${styles.menu_entry_active}`);

    // add active entry to the current event target
    const currEntry = e.target as HTMLElement;
    const currEntryContainer = currEntry.closest(`.${styles.menu_entry_container}`);
    currEntryContainer?.classList.add(`${styles.menu_entry_active}`);
  }

  // function to change active submenu entry 
  function updateActiveSubEntry(e: MouseEvent) {
    e.stopPropagation();

    // clear previous active subentries
    const prevActiveSubEntry = document.querySelector(`.${styles.submenu_entry_active}`);
    prevActiveSubEntry?.classList.remove(`${styles.submenu_entry_active}`);

    const currSubEntry = e.target as HTMLElement;
    currSubEntry.classList.add(`${styles.submenu_entry_active}`);
  }  

  // function to log user out
  async function logoutUser() {
    setIsLoading(true);

    try {
      await axios.get('/api/auth/logout');
      toast.success('Successfully logged out');
      router.push('/login'); // redirect to login page after logout
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage); 
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={styles.profile_sidebar}>
      <div className={styles.full_name}>
        <FaCircleUser size={60} className={styles.user_icon}/>
        <p>{user?.fullName}</p>
      </div>

      {/* display loader to indicate state */}
      {(isLoading) &&
        <div className={styles.loader_container}>
          <BarLoader color='#ffffff' className={styles.loader_icon} />
        </div>
      }

      <div className={styles.menu_container}>
        <div 
          className={`${styles.menu_entry_container} ${styles.menu_entry_active}`}
          onClick={(e) => updateActiveEntry(e)}
        >
          <div className={styles.menu_entry}>
            <RiAccountPinBoxLine className={styles.entry_icon} size={25} />
            Account Information
            <IoIosArrowForward className={styles.arrow_icon} />
          </div>

          <div className={styles.submenu_entry}>
            <ul>
              <li 
                onClick={(e) => {
                  updateActiveSubEntry(e);
                  router.push('/profile?type=info');
                  router.refresh();
                }} 
                className={(type === 'info') ? `${styles.submenu_entry_active}`: ''}
              >
                Profile Information
              </li>
              <li 
                onClick={(e) => {
                  updateActiveSubEntry(e);
                  router.push('/profile?type=address');
                  router.refresh();
                }} 
                className={(type === 'address') ? `${styles.submenu_entry_active}`: ''}
              >Manage Addresses</li>
              <li onClick={(e) => updateActiveSubEntry(e)} >Password & Reset</li>
            </ul>
          </div>
        </div>

        <div 
          className={styles.menu_entry_container}
          onClick={(e) => updateActiveEntry(e)}
        >
          <div className={styles.menu_entry}>
            <BiPurchaseTagAlt className={styles.entry_icon} size={25} />
            My Orders
            <IoIosArrowForward className={styles.arrow_icon} />
          </div>

          <div className={styles.submenu_entry}>
            <ul>
              <li onClick={(e) => updateActiveSubEntry(e)}>Current order</li>
              <li onClick={(e) => updateActiveSubEntry(e)}>Order History</li>
            </ul>
          </div>
        </div>
        
        <div className={styles.menu_entry_container}>
          <div 
            className={styles.menu_entry}
            onClick={() => logoutUser()}
          >
            <IoMdLogOut className={styles.entry_icon} size={25} />
            Logout
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar