import Link from 'next/link'
import styles from './needHelp.module.css';

function NeedHelp() {
  return (
    <div className={styles.need_help_container}>
      <h1>NEED HELP?</h1>
      <p>
        Need assistance choosing the perfect drum or have questions? Contact us today for expert advice and personalized support. Our team is here to help you find your rhythm and make your drumming journey unforgettable.
      </p>
      
      <Link href={'/contactus'}>
        <button>Contact Us</button>
      </Link>
    </div>
  );
}

export default NeedHelp