/*
  Description: This contains the sign up component
*/

import Image from 'next/image';
import styles from './signup.module.css';
import SignupForm from '../../../components/signupForm/signupForm';
import Link from 'next/link';

function SignUpPage() {
  return (
    <main className={styles.main}>
      <div className={styles.signup_logo}>
        <Image
          src={'/images/signup/signup_logo.svg'}
          alt={'logo image'}
          fill={true}
        />
      </div>

      {/* include the signup form component*/}
      <div>
        <SignupForm />
      </div>

      {/* prompt user to login instead */}
      <div className={styles.user_login_prompt}>
        <span>Already have an account?</span>
        <Link href={'/login'}>
          <button>
              Login
          </button>
        </Link>
      </div>
    </main>
  )
}

export default SignUpPage;
