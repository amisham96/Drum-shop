'use client';

import { useState } from 'react';
import styles from './updateEmail.module.css';
import { BeatLoader } from 'react-spinners';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useRouter } from 'next/navigation';

function UpdateEmail() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // new email input
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  const [step, setStep] = useState(1);

  // otp input states
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  
  // represents the number of seconds left till the otp is valid
  const OTP_VALIDITY_TIME = 180; // in seconds
  const [otpTimeLeft, setOtpTimeLeft] = useState(OTP_VALIDITY_TIME);

  // function to move to next step after verifying inputs
  async function verifyInput() {
    if (newEmail.length == 0 ||
        confirmEmail.length == 0 ||
        newEmail !== confirmEmail) {
      return;
    }

    // generate otp
    await generateOtp();
  }

  // basic validation for input fields
  function validateField(name: string, value: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (newEmail.length > 0 && 
        confirmEmail.length > 0 
    ) {
      if (newEmail !== confirmEmail) {
        const message = 'Email inputs do not match';
        addClassToInformUser(name, 'invalid', message);
      } else {
        addClassToInformUser('new_email', 'valid', ' ');
        addClassToInformUser('confirm_new_email', 'valid', ' ');
      }
      return;
    }

    // if the field has an invalid value, show error
    if (emailRegex.test(value) === false) {
      const message = 'Invalid email ID';
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
    } else if (status === 'valid') {
      inputElement?.classList.add(styles.input_valid);
    }

    // if there is a message provided, display it
    const messageContainer = document.querySelector(`[data-name="${name}"]`);
    
    if (message && messageContainer) {
      messageContainer.innerHTML = message;
      messageContainer.classList.add(styles.display_error_message);
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
          const res = await axios.post('/api/profile/otp/generate/email', {
            email: newEmail,
          });
  
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
        const res = await axios.post('/api/profile/otp/verify/email', {
          email: newEmail,
          otp: otpInput.join('')
        });
  
        const successMessage = res.data.message;
        toast.success(successMessage);
  
        // redirect user
        router.replace('/profile');

      } catch (error: any) {
        const errorData = error.response.data;
        const errorMessage = errorData.message;
        
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  

  return (
    <main className={styles.main}>
      {/* change email form */}
      {(step == 1) &&
        <div className={`${styles.update_email_container} ${styles.step_container}`}>
          <h1>Change Email</h1>

          <div className={styles.form_control}>
            <input
              type="email"
              placeholder='Enter new email ID'
              name='new_email'
              value={newEmail}
              onChange={(e) => {
                resetInputElement('new_email');
                setNewEmail(e.target.value);
              }}
              onBlur={(e) => validateField('new_email', e.target.value)}
            />
            <span data-name='new_email' className={styles.input_error_message}></span>
          </div>
          
          <div className={styles.form_control}>
            <input
              type="email"
              placeholder='Confirm new email ID'
              name='confirm_new_email'
              value={confirmEmail}
              onChange={(e) => {
                resetInputElement('confirm_new_email');
                setConfirmEmail(e.target.value);
              }}
              onBlur={(e) => validateField('confirm_new_email', e.target.value)}
            />
            <span data-name='confirm_new_email' className={styles.input_error_message}></span>
          </div>

          <button onClick={() => verifyInput()}>Continue</button>

          <p className={styles.update_email_info}>
            By continuing, you agree to The Bangalore Drum Shop's
            <span>Condition of use</span>
            {/* TODO: link condition of use to appropriate page */}
          </p>
        </div>
      }

      {/* step 2: otp input */}
      {(step === 2) && 
        <div className={`${styles.step_container} ${styles.otp_intput_container}`}>
          <h1>OTP verification</h1>
          <p>Please enter the OTP (One-Time-Password) sent to your registered 
            email to complete your verification.
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
    </main>
  )
}

export default UpdateEmail;

