import styles from './contactUs.module.css';
import { FaInstagram, FaSquareFacebook, FaYoutube, FaXTwitter, FaLinkedin } from 'react-icons/fa6';

export const dynamic = 'force-static';

function ContactUs() {
  return (
    <main className={styles.main}>
      <div className={styles.outer_container}>      
        <div className={styles.left_container}>
          <h1>THE BANGALORE <span>DRUM SHOP</span></h1>
          <p className={styles.location}>KALYAN NAGAR, <span>BENGALURU</span></p>

          <p className={styles.description}>
            We are located at Kalyan Nagar in North Bangalore.
            Call us for information on any Percussion Instrument you might be interested in or drop in for a great in-store experience. Plenty of free parking available on CMR Road.
          </p>

          <div className={styles.cta_buttons}>
            <button className={styles.visit_store}>Visit Store</button>
            <button className={styles.make_enquiry}>Make an Enquiry</button>
          </div>

          <div className={styles.socials}>
            <a href="/"><FaXTwitter /></a>
            <a href="/"><FaSquareFacebook /></a>
            <a href="/"><FaInstagram /></a>
            <a href="/"><FaYoutube /></a>
            <a href="/"><FaLinkedin /></a>
          </div>
        </div>

        <div className={styles.right_container}>
        <iframe 
          src='https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d725.6472158204298!2d77.63332186618987!3d13.024216929900968!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae17462beb0893%3A0x8bf0bfb10b47d19f!2sYamaha%20Music%20Square%20-%20Kalyan%20Nagar!5e0!3m2!1sen!2sin!4v1718208734558!5m2!1sen!2sin'
          width='600'
          height='450'
          loading='lazy'
          referrerPolicy='no-referrer-when-downgrade'>
        </iframe>
        </div>
      </div>
    </main>
  )
}

export default ContactUs;
