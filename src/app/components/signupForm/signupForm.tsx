/*
  File: signupForm.tsx
  Description: This file contains sign-up form
*/

'use client';

import { FormEvent, useState} from 'react';
import styles from './signupForm.module.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BeatLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';
import { getSignUpValidationSchema } from '../../../validation/user';
import { AiFillEyeInvisible, AiFillEye } from 'react-icons/ai';

// type declared for the form state
type SignUpFormData = {
  fullName: string,
  email: string,
  phone: string,
};

function SignupForm() {
  const router = useRouter();

  /* since the signup process is divided into multiple steps, this 
    is primarily used for step one */
  const SignUpValidationSchema = getSignUpValidationSchema(false);

  // state to represent form data
  const [formData, setFormData] = useState<SignUpFormData>({
    fullName: '',
    email: '',
    phone: '',
  });

  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');  

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // represents the number of seconds left till the otp is valid
  const OTP_VALIDITY_TIME = 180; // in seconds
  const [otpTimeLeft, setOtpTimeLeft] = useState(OTP_VALIDITY_TIME);

  /* state to indicate which step the user is in signup process
    1). user enters info (name, email, phone number)
    2). user verifies their email via otp
    3). user adds password
  */
  const [step, setStep] = useState(1);

  // represent the state of the network request
  const [isLoading, setIsLoading] = useState(false);

  // function to handle the submit event from the form in step one
  function handleUserInfoFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // check for the validity of the form data
    const validationRes = SignUpValidationSchema.safeParse(formData);
    
    if (!validationRes.success) {
      validationRes.error.errors.forEach(error => {
        const { path, message } = error;
        addClassToInformUser(path[0].toString(), 'invalid', message);
      });
    } else {
      generateOtp();
    }    
  }

  // function to update form data (form one) on input change
  function handleFormInputChange(name: string, value: string) {
    // while the user is typing in a input element, do not add any error/success class
    resetInputElement(name);

    // update the state
    setFormData((prevFormData) => {
      return {
        ...prevFormData,
        [name]: value,
      }
    })
  }

  // function to add correct class based on input validity and display message to user
  function validateField(name: string, value: string){
    // get the appopriate schema for the field
    const schemaShape = SignUpValidationSchema.shape;
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

    /*
    function to add error/success class and error message to appropriate input elements
    params: 
      (1). name -> name attribute of the input element where error occured
      (2). status -> error/success status of the input value
      (3). message -> if the input is invalid, message to be displayed to user
  */
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

  // function to update otp input
  function updateOTPInput(idx: number, value: string) {
    // update the otp input
    setOtpInput((prevInput) => {
      const newInput = [...prevInput];
      newInput[idx] = value.slice(-1);
      return newInput;
    });

    /* move the focus to next input element
      if the value was cleared from the current input, don't jump to next input
    */
    if ((idx < 5) && (value !== '')) {
      const nextInputElement = document.querySelector<HTMLInputElement>(`[data-otp-idx="${idx+1}"]`);
      nextInputElement?.focus();
    }
  }

  // function to generate otp on the server side
  async function generateOtp(resend = false) {
    setIsLoading(true);

      // if the validation was successful, send data to server
      try {
        const res = await axios.post('/api/auth/otp/generate', {
          email: formData.email,
          phone: formData.phone
        })

        const successMessage = res.data.message;
        toast.success(successMessage);

        // start the timer fresh
        setOtpTimeLeft(OTP_VALIDITY_TIME);

        // start the otp validity timer
        const interval = setInterval(() => {            
          setOtpTimeLeft((prevTime) => {
            const timeLeft = prevTime - 1;
            if (timeLeft === 0) clearInterval(interval);

            return (prevTime - 1);
          });            
        }, 1000);
        
        // if the otp was generated in the first form, move to next step
        if (resend === false) {
          setStep(2);
        }
      } catch (error: any) {
        const errorData = error.response.data;
        const errorMessage = errorData.message;
        
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
  }

  // submit the otp and verify
  async function verifyOtp() {
    // if the otp timer has ended, do not allow user to submit otp until they generate new one
    if (otpTimeLeft === 0) {
      toast.error('OTP expired, please generate new one');
      return;
    }

    // check if all the otp inputs are filled
    for(let idx = 0; idx < otpInput.length; idx += 1) {
      const input = otpInput[idx];
      if (input.length === 0) {
        toast.error('Please input OTP correctly');
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await axios.post('/api/auth/otp/verify', {
        email: formData.email,
        otp: otpInput.join('')
      });

      const successMessage = res.data.message;
      toast.success(successMessage);

      // move the user to next step
      setStep(prevStep => prevStep + 1);
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  /* since the password and confirm password validation is not done using the zod
    schema, it is done here */
  function validatePassword() {
    if (password.length < 8) {
      addClassToInformUser('password', 'invalid', 'Password must be at least 8 characters')
      return false;
    } else {
      addClassToInformUser('password', 'valid')
    }
    
    if (password !== confirmPassword) {
      addClassToInformUser('confirm_password', 'invalid', 'Passwords do not match')
      return false;
    }  else {
      addClassToInformUser('confirm_password', 'valid')
    }

    return true;
  }

  // function to submit all user info and finish signing up
  async function signup() {
    // check if the password is valid
    if (!validatePassword()) return;

    setIsLoading(true);

    try {
      const res = await axios.post('/api/auth/signup', {
        ...formData,
        password: password,
      });

      const successMessage = res.data.message;
      toast.success('Redirecting to login page..');
      toast.success(successMessage);

      setTimeout(() => {
        router.replace('/login');
      }, 2000);
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);

      // reset the states
      setFormData({
        fullName: '',
        email: '',
        phone: ''
      });
      resetInputElement('fullName');
      resetInputElement('email');
      resetInputElement('phone');
    }
  }

  return (
    <>
      {/* if the user is in step one render this form */}
      {(step === 1) &&
        <div className={styles.step_container}>
          <h1>Register</h1>

          <form onSubmit={handleUserInfoFormSubmit} className={styles.signup_form_one}>
            <div className={styles.signup_form_control}>
              <input
                type="text"
                name='fullName'
                placeholder='Full Name'
                value={formData.fullName}
                onChange={(e) => handleFormInputChange('fullName', e.target.value)}
                onBlur={(e) => validateField('fullName', e.target.value)}
              />
              <span data-name='fullName' className={styles.input_error_message}></span>
            </div>

            <div className={styles.signup_form_control}>
              <input
                type="email"
                name='email'
                placeholder='Email'
                value={formData.email}
                onChange={(e) => handleFormInputChange('email', e.target.value)}
                onBlur={(e) => validateField('email', e.target.value)}
              />
              <span data-name='email' className={styles.input_error_message}></span>
            </div>

            <div className={styles.signup_form_control}>
              <input
                type="number"
                name='phone'
                placeholder='Phone number'
                value={formData.phone}
                onChange={(e) => handleFormInputChange('phone', e.target.value)}
                onBlur={(e) => validateField('phone', e.target.value)}
              />
              <span data-name='phone' className={styles.input_error_message}></span>
            </div>

            <button disabled={isLoading}>
              {(isLoading === false) ?
                'Continue' :
                <BeatLoader />
              }
            </button>
          </form>

          <p className={styles.signup_info_message}>By continuing, you agree to The Bangalore Drum Shop’s <br />
            <span>Condition of Use</span>
          </p>
        </div>
      }

      {/* step 2: otp input */}
      {(step === 2) && 
        <div className={`${styles.step_container} ${styles.otp_intput_container}`}>
          <h1>OTP verification</h1>
          <p>Please enter the OTP (One-Time-Password) sent to your registered 
            email/phone number to complete your verification.
          </p>

          <div className={styles.otp_inputs}>
            {Array.from({ length: 6 }, (_, index) => index)
                  .map((_, idx) => {
                    return (
                      <input
                        key={idx}
                        type='number' 
                        value={otpInput[idx]}
                        onChange={(event) => updateOTPInput(idx, event.target.value)}
                        min={0}
                        max={9}
                        data-otp-idx={idx.toString()}
                        onKeyDown={(event) => {
                          /* if the user enters backspace and if the
                             input is clear, move focus to previous input
                          */               

                          if ((event.key === 'Backspace') &&
                              (idx > 0) &&
                              (otpInput[idx].length === 0)
                          ) {
                              const prevInputElement = document.querySelector<HTMLInputElement>(`[data-otp-idx="${idx-1}"]`);
                              prevInputElement?.focus();
                            }
                          }
                        }
                      />
                    )
                  })
            }
          </div>

          <div className={styles.otp_other_info}>
            <p>Remaining time: 
              <span>{Math.floor(otpTimeLeft/60) + 'm ' + (otpTimeLeft % 60) + 's'}</span>
            </p>
            <p>Didn't get a code? 
              <span
                onClick={() => {
                  // if the otp timer is not 0, do not resend otp again
                  if (otpTimeLeft > 0) {
                    return;
                  }

                  // clear otp before generating new otp
                  setOtpInput(['', '', '', '', '', '']);
                  generateOtp(true);
                }}
                className={(otpTimeLeft > 0) ? styles.disable_resend_otp : ''}
              >
                Resend                
              </span>
            </p>
          </div>

          <div className={styles.otp_actions}>
            <button onClick={verifyOtp}>
              {(isLoading === true) ?
                <BeatLoader /> :
                'Verify'
              }
            </button>
            <button onClick={() => setStep(1)}>
              Cancel
            </button>
          </div>
        </div>
      }

      {/* step 03: input password */}
      {(step === 3) &&
        <div className={`${styles.step_container} ${styles.password_container}`}>
          <h1>Almost done</h1>
          <p>Please set a password for your account to continue</p>

          <div className={`${styles.signup_form_control} ${styles.password_input_control}`}>
            <input
              type={showPassword ? 'text' : 'password'}
              name='password'
              placeholder='Set Password'
              value={password}
              onChange={(e) => {
                resetInputElement('password');
                setPassword(e.target.value);
              }}
              onBlur={(e) => {
                // basic validation of password length
                if (e.target.value.length < 8) {
                  addClassToInformUser('password', 'invalid', 'Password must be at least 8 characters')
                } else {
                  addClassToInformUser('password', 'valid')
                }
              }}
            />
            <div className={styles.eye_icon} onClick={(e) => setShowPassword((prevVal) => !prevVal)}>
              {(showPassword === true) ?
                <AiFillEye />:
                <AiFillEyeInvisible />
              }
            </div>
            <span data-name='password' className={styles.input_error_message}></span>
          </div>

          <div className={`${styles.signup_form_control} ${styles.password_input_control}`}>
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name='confirm_password'
              placeholder='Confirm Password'
              value={confirmPassword}
              onChange={(e) => {
                resetInputElement('confirm_password');
                setConfirmPassword(e.target.value);
              }}
              onBlur={(e) => {
                // basic validation of password length
                if ((password === confirmPassword) &&
                  (password.length >= 8)) {
                  addClassToInformUser('confirm_password', 'valid')
                } else {
                  let message = ''
                  if (password.length > 0 && password !== confirmPassword) {
                    message = 'Passwords do not match';
                  } else if (confirmPassword.length === 0) {
                    message = 'This field is requried';
                  }

                  addClassToInformUser('confirm_password', 'invalid', message);
                }
              }}
            />
            <div className={styles.eye_icon} onClick={(e) => setShowConfirmPassword((prevVal) => !prevVal)}>
              {(showConfirmPassword === true) ?
                <AiFillEye />:
                <AiFillEyeInvisible />
              }
            </div>
            <span data-name='confirm_password' className={styles.input_error_message}></span>
          </div>
          
          <button
            className={styles.password_submit_btn}
            onClick={signup}
            disabled={isLoading}
          >
            {(isLoading === false) ?
              'Continue' :
              <BeatLoader />
            }
          </button>
        </div>
      }
    </>
  )
}

export default SignupForm;
