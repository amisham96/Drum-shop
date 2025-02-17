'use client';

import { OrderType } from '../../../validation/order';
import axios from 'axios';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './payment.module.css';
import { z } from 'zod';
import { BeatLoader } from 'react-spinners';
import { useRouter } from 'next/navigation';

type UserType = {
  fullName: string,
  email: string,
  phone: string,
}

type ParamsType = {
  order: OrderType,
  user: UserType
};

function PaymentPage(params: ParamsType) {
  const router = useRouter();

  const [order, setOrder] = useState<OrderType | null>(null);
  const [user, setUser] = useState<UserType | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  async function createOrderId() {
    try {
      const res = await axios.post('/api/payment/create', {orderId: order?._id});
      return res.data;
    } catch (error: any) {
      throw Error('Error while initialising payment');
    }
  }

  async function processPayment() {
    setIsLoading(true);

    try {
     const { orderId, amount, currency }: {
      orderId: string,
      amount: number,
      currency: string,
     } = await createOrderId();

     const options = {
      key_id: process.env.NEXT_RAZORPAY_KEY_ID!,
      amount: amount,
      currency: currency,
      name: 'The Bangalore Drum Shop',
      description: `Order #${orderId} - Payment for music instruments`,
      order_id: orderId,
      handler: async function (response: any) {
        // this is payment 'success' handler function

        console.log(response);

       const data = {
        orderId: order?._id, // db order id
        orderCreationId: orderId, // razorpay order creation id
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
       };
  
       try {
        await axios.post('/api/payment/verify', {...data})
        toast.success('Successfully processed payment');
        // TODO: Redirect to orders page after successful payment
        // remove cart from the context by refreshing the page
        router
       } catch (error) {
        toast.error('Error while processing payment');
       }      
      },
      prefill: {
       name: user?.fullName || '',
       email: user?.email || '',
       contact: user?.phone || '',
      },
      theme: {
       color: '#3399cc',
      },
     };

     const tempWindow = window as any;

     if (!tempWindow.Razorpay) {
      toast.error('Refresh page to initiate payment');
      return;
     }

      const paymentObject = new tempWindow.Razorpay(options);
      paymentObject.on('payment.failed', function (response: any) {
        toast.error(response.error.description);
        toast.error(response.error.reason);
      });

      paymentObject.open();
    } catch (error: any) {      
      toast.error(error.message || 'Error while completing payment process...');
    } finally {
      setIsLoading(false);
    }
  };

  // function to validate fields
  function validateField(name: string, value: (string | number)) {
    // get the appopriate schema for the field

    const ValidationSchema = z.object({
      name: z.string({
        required_error: 'Name is required.'
      })
      .trim()
      .min(1, {message: 'Username can\'t be empty.'})
      .max(60, {message: 'Username can\'t exceed 60 characters.'}),
      email: z.string({
          required_error: 'Email is required.'
        })
        .trim()
        .email({message: 'Invalid email.'}),
      phone: z.string({
          required_error: 'Phone number is required',
        })
        .trim()
        .min(1, {message: 'Phone number can\'t be empty.'})
        .max(60, {message: 'Phone number can\'t exceed 10 characters.'}),
    });

    const schemaShape = ValidationSchema.shape;
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
    let inputElement = document.querySelector(`input[name="${name}"]`);

    // if input element is empty, check for textarea
    if (inputElement === null) {
      inputElement = document.querySelector(`textarea[name="${name}"]`)
    }

    // add the correct class and display message if needed
    if (status === 'invalid') {
      // inputElement.classList
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
    let inputElement = document.querySelector(`input[name="${name}"]`);

    if (inputElement === null) {
      inputElement = document.querySelector(`textarea[name="${name}"]`)
    }

    inputElement?.classList.remove(styles.input_invalid);
    inputElement?.classList.remove(styles.input_valid);
    
    const messageContainer = document.querySelector(`[data-name="${name}"]`);
    if (messageContainer) {
      messageContainer.classList.remove(styles.display_error_message);
      messageContainer.innerHTML = '';
    }
  }  

  useEffect(() => {
    setOrder(params.order);
    setUser(params.user);
  }, [setOrder, setUser, params]);

  useEffect(() => {
    if (!user) return;
    setName(user.fullName);
    setEmail(user.email);
    setPhone(user.phone);
  }, [user]);

  return (
    <main>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />

      <form className={styles.billing_form}>
        <div className={styles.form_control}>
          <label htmlFor='name'>Name</label>

          <input 
            type='text'
            name='name'
            value={name}
            onChange={(e) => {
              resetInputElement('name');
              setName(e.target.value);
            }}
            onBlur={(e) => validateField('name', e.target.value)}
            placeholder='Enter your name'
          />
          <span data-name='name' className={styles.error_msg}></span>
        </div>

        <div className={styles.form_control}>
          <label htmlFor='email'>Email</label>

          <input 
            type='text'
            name='email'
            value={email}
            onChange={(e) => {
              resetInputElement('email')
              setEmail(e.target.value);
            }}
            onBlur={(e) => validateField('email', e.target.value)}
            placeholder='Enter your email'
          />
          <span data-name='email' className={styles.error_msg}></span>
        </div>

        <div className={styles.form_control}>
          <label htmlFor='phone'>Phone</label>

          <input 
            type='text'
            name='phone'
            value={phone}
            onChange={(e) => {
              resetInputElement('phone');
              setPhone(e.target.value);
            }}
            onBlur={(e) => validateField('phone', e.target.value)}
            placeholder='Enter your phone'
          />
          <span data-name='phone' className={styles.error_msg}></span>
        </div>

        <div className={styles.form_control}>
          <label htmlFor='amount'>Amount</label>

          <input 
            type='text'
            name='amount'
            value={'₹ ' + (order?.total.toLocaleString('en-In') || 0)}
            readOnly
          />
          <span data-name='phone' className={styles.error_msg}></span>
        </div>

        <button 
          type='button' 
          onClick={(e) => {
            e.preventDefault();
            processPayment();
          }}
        >
          {(isLoading) ?
            <BeatLoader />:
            'Make payment'
          }
        </button>
      </form>
    </main>
  );
}

export default PaymentPage;
