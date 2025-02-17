import Image from 'next/image';
import styles from './footer.module.css';
import { AiFillFacebook, AiFillLinkedin, AiFillYoutube } from 'react-icons/ai';
import { BsTwitterX, BsInstagram } from 'react-icons/bs';

function Footer() {
  return (
    <footer id={styles.footer}>

      {/* section containing logo and copyright text */}
      <div className={styles.logo_container}>
        <Image
          src={'/images/footer/footer_logo.png'}
          alt='logo'
          width={180}
          height={100}
          priority={true}
        />

        <span>Your final percussion destination.</span>

        {/* copyright text */}
        <div className={styles.copyright_text}>
          <Image
            src={'/images/footer/copyright.svg'}
            width={15}
            height={15}
            alt='copyright icon'
          />
          <span>copyrights reserved by HTT</span>
        </div>  
      </div>

      {/* section containing social links and address */}
      <div className={styles.store_info}>
        <div className={styles.socials}>
          <ul>
            <li><a><BsTwitterX className={styles.social_link} /></a></li>
            <li><a><AiFillFacebook className={styles.social_link} /></a></li>
            <li><a><BsInstagram className={styles.social_link} /></a></li>
            <li><a><AiFillYoutube className={styles.social_link} /></a></li>
            <li><a><AiFillLinkedin className={styles.social_link} /></a></li>
          </ul>
        </div>

        {/* store address */}
        <div className={styles.additional_info}>
          4C, 209, CMR Main Rd, HRBR Layout 3rd Block, 
          HRBR Layout, Kalyan Nagar, Bengaluru, Karnataka 560043

          <div>
            blr_musicsquare@horizon-tech.in   |   080 4501 6069            
          </div>

          <div className={styles.opening_hours}>
            <span>OPENING HOURS</span>
            <span>10 : 00 AM ~ 08 : 30 PM</span>
          </div>
        </div>

        {/* copyrigh text in mobile footer */}
        <div className={styles.copyright_text}>
          <Image
            src={'/images/footer/copyright.svg'}
            width={15}
            height={15}
            alt='copyright icon'
          />
          <span>copyrights reserved by HTT</span>
        </div>
      </div>
   </footer>
  )
}

export default Footer;