'use client';

import Image from 'next/image';
import styles from './header.module.css';
import { FaCircleUser } from 'react-icons/fa6';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdOutlineShoppingBasket } from 'react-icons/md';
import Link from 'next/link';
import SearchProducts from '../searchProducts/searchProducts';
import { Suspense, useState } from 'react';
import { IoMdClose } from 'react-icons/io';

type CartPropType = {
  cartId: string,
  productCount: number,
}

function Header({ cart }: { cart: (CartPropType | null) }) {
  const cartCount = cart?.productCount || 0;  
  const [showMobileNav, setShowMobileNav] = useState(false);

  return (
    <nav className={styles.navbar}>
      {/* hamburger icons that will be displayed in tablet and mobile */}
      <GiHamburgerMenu 
        className={styles.hamburger_menu} 
        onClick={() => setShowMobileNav(true)}
      />

      {/* mobile navbar */}
      <div 
        className={`${styles.mobile_navbar} ${showMobileNav ? `${styles.show_mobile_navbar}`: ''}`}
      >
        <div 
          className={styles.mobile_nav_close_icon}
          onClick={() => setShowMobileNav(false)}
        >
          <IoMdClose />
        </div>

        <div className={styles.mobile_links}>
          <ul>
            <li><Link href={'/store'}>Store</Link></li>
            <li><Link href={'/events'}>Events</Link></li>
            <li><Link href={'/contactus'}>Contact Us</Link></li>
            <li style={{position: 'relative'}}>
              <Link href={'/cart'}>
                <MdOutlineShoppingBasket className={styles.cart_icon} />
              </Link>

              {(cartCount > 0) &&
                <span className={styles.cart_notification}>{cartCount}</span>
              }
            </li>
          </ul>
        </div>
      </div>

      {/* logo image in the header */}
      <Link href='/'>
        <div className={styles.navbar_logo}>
            <Image
              src={'/images/logo.png'}
              alt='logo'
              priority={true}
              fill={true}          
            />
        </div>
      </Link>

      {/* input container to search products */}
      <div className={styles.search_outer_container}>
        <Suspense>
          <SearchProducts />
        </Suspense>
      </div>

      {/* navbar with links */}
      <div className={styles.nav_links}>
        <ul>
          <li><Link href={'/store'}>Store</Link></li>
          <li><Link href={'/events'}>Events</Link></li>
          <li><Link href={'/contactus'}>Contact Us</Link></li>
          <li style={{position: 'relative'}}>
            <Link href={'/cart'}>
              <MdOutlineShoppingBasket className={styles.cart_icon} />
            </Link>

            {(cartCount > 0) &&
              <span className={styles.cart_notification}>{cartCount}</span>
            }
          </li>
        </ul>
      </div>

      {/* user icon */}
      <Link href={'/profile'} className={styles.user}>
        <FaCircleUser className={styles.user_icon}/>
        {/* <BiSolidDownArrow className={styles.user_icon_arrow} /> */}
      </Link>
    </nav>
  )
}

export default Header;