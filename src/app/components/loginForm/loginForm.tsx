/*
  File: loginForm.tsx
  Description: This component contains the login form
*/
'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import styles from './loginForm.module.css';
import ReCAPTCHA from 'react-google-recaptcha';
import toast from 'react-hot-toast';
import { LoginValidationSchema } from '../../../validation/user';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { BeatLoader } from 'react-spinners';

// type declared for the form data
type LoginFormDataType = {
  email: string,
  password: string,
}

// type of recaptcha ref
type RecaptchRefType = ReCAPTCHA | null;

function LoginForm() {
  // check for message in search params
  const searchParams = useSearchParams();

  const recaptchaRef = useRef(null);

  const router = useRouter();

  // state to represent form data
  const [formData, setFormData] = useState<LoginFormDataType>({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  // function to handle form submit event
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // check if the captcha value is valid
    const captchaVal = (recaptchaRef.current as RecaptchRefType)?.getValue();
    if (!captchaVal) {
      toast.error('Please verify the reCAPTCHA!');
      return;
    }

    // check if the form data is valid
    const validationRes = LoginValidationSchema.safeParse(formData);
    if (!validationRes.success) {
      validationRes.error.errors.forEach(error => {
        const { path, message } = error;
        addClassToInformUser(path[0].toString(), 'invalid', message);
      });
    } else {
      // if the validation was successful, send data to server
      setIsLoading(true);

      try {
        const res = await axios.post('/api/auth/login', {
          ...formData,
          captcha: captchaVal,
        });

        const successMessage = res.data.message;
        toast.success('Redirecting..');
        toast.success(successMessage);

        setTimeout(() => {
          router.replace('/');
        }, 2000);
      } catch (error: any) {
        const errorData = error.response.data;
        const errorMessage = errorData.message;
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
        
        // clear the states
        setFormData({
          email: '',
          password: ''
        });
        (recaptchaRef.current as RecaptchRefType)?.reset();
        resetInputElement('email');
        resetInputElement('password');
      }
    } 
  }

  // basic validation for input fields
  function validateField(name: string, value: string) {
    // get the appopriate schema for the field
    const schemaShape = LoginValidationSchema.shape;
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
    const inputElement = document.querySelector(`input[name="${name}"]`);
    
    // add the correct class and display message if needed
    if (status === 'invalid') {
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
    const inputElement = document.querySelector(`input[name="${name}"]`);
    inputElement?.classList.remove(styles.input_invalid);
    inputElement?.classList.remove(styles.input_valid);
    
    const messageContainer = document.querySelector(`[data-name="${name}"]`);
    if (messageContainer) {
      messageContainer.classList.remove(styles.display_error_message);
      messageContainer.innerHTML = '';
    }
  }

  useEffect(() => {
    const message = searchParams.get('message');

    if (message) {
      setTimeout(() => {
        toast.error(message);
        router.replace('/login');
      }, 10);
    }
  }, [searchParams]);

  return (
    <div className={styles.login_form_container}>
      <h1>Login</h1>

      {/* login form */}
      <form onSubmit={handleSubmit}>
        <div className={styles.login_form_control}>
          <input
            type="text"
            placeholder='Email or phone number'
            name='email'
            value={formData.email}
            onChange={(e) => {
              resetInputElement('email');
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }}
            onBlur={(e) => validateField('email', e.target.value)}
          />
          <span data-name='email' className={styles.input_error_message}></span>
        </div>
            
        <div className={styles.login_form_control}>
          <input
            type="password"
            placeholder='Password'
            name='password'
            value={formData.password}
            onChange={(e) => {
              resetInputElement('password');
              setFormData({
                ...formData,
                password: e.target.value,
              })
            }}
            onBlur={(e) => validateField('password', e.target.value)}
          />
          <span data-name='password' className={styles.input_error_message}></span>
        </div>

        <div className={styles.recaptcha_container}>
          <ReCAPTCHA 
            ref={recaptchaRef}
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_PUBLIC_KEY!}
          />
        </div>

        <button>
          {(isLoading === true) ?
            <BeatLoader /> :  
          'Login'
          }
        </button>
      </form>

      <p className={styles.login_info_message}>By continuing, you agree to The Bangalore Drum Shop’s <br />
        <span>Condition of Use</span>
      </p>

      <p className={styles.forgot_password_message}>Forgot Password?</p>
    </div>
  )
}

export default LoginForm;