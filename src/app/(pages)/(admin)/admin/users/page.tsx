'use client';

import { useEffect, useState } from 'react';
import styles from './users.module.css';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AdminUser } from '../../../../../types/admin';
import { RiEditFill } from 'react-icons/ri';
import { MdDeleteForever } from 'react-icons/md';
import { AddAdminUserValidationSchema } from '../../../../../validation/admin';
import { BeatLoader } from 'react-spinners';

function AdminUsers() {
  const [isLoading, setIsLoading] = useState(false);

  // state to store all the admin users 
  const [users, setUsers] = useState<AdminUser[]>([]);

  // state to show admin form for adding/editing admin users
  const [showAdminForm, setShowAdminForm] = useState(false);

  // formState of the user
  const initialAdminInput = {
    fullName: '',
    email: '',
    phone: '',
    password: '',
    privilege: 'admin',
  }
  const [adminInput, setAdminInput] = useState(initialAdminInput)

  // state to determine if a new admin is being added, or existing admin is being edited
  const [isEditAdmin, setIsEditAdmin] = useState(false);
  const [editAdminId, setEditAdminId] = useState('');

  // function to add different classes to input elements based on valid/invalid inputs
  function addClassToInformUser(name: string, status: 'invalid' | 'valid', message ?: string) {
    // get the correct input element using the name attribute
    let inputElement = document.querySelector(`input[name="${name}"]`);

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

    inputElement?.classList.remove(styles.input_invalid);
    inputElement?.classList.remove(styles.input_valid);
    
    const messageContainer = document.querySelector(`[data-name="${name}"]`);
    if (messageContainer) {
      messageContainer.classList.remove(styles.display_error_message);
      messageContainer.innerHTML = '';
    }
  }

  // function to fetch all the admin users
  async function fetchAdminUsers() {
    setIsLoading(true);

    try {
      const res = await axios.get('/api/admin/users');
      const { users } = res.data;
      setUsers(users);
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // function to save a admin user
  async function addAdmin() {
    const validationRes = AddAdminUserValidationSchema.safeParse(adminInput);

    const phoneRegex = /^\d{10}$/;

    if (!validationRes.success) {
      // if validation fails, show error
      toast.error('Invalid input data');

      validationRes?.error.errors.forEach(error => {
        console.log(error);
        const { path, message } = error;
        addClassToInformUser(path[0].toString(), 'invalid', message);
      });
    } else if(!phoneRegex.test(adminInput.phone)) {
      addClassToInformUser('phone', 'invalid', 'Invalid phone number');
    } else {
      // send the information to the api to save the new admin user.
      setIsLoading(true);

      try {
        const res = await axios.post('/api/admin/users', { data: adminInput });
        const { admin } = res.data;

        // save the new admin to the array
        setUsers((prevState) => [...prevState, admin]);
        
        toast.success('Successfully added admin');

        // clear input
        setShowAdminForm(false);
        setAdminInput(initialAdminInput);
      } catch (error: any) {
        const errorData = error.response.data;
        const errorMessage = errorData.message;
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  }

  // function to edit a saved admin user
  async function editAdmin() {
    setIsLoading(true);

    try {      
      const res = await axios.put('/api/admin/users', { ...adminInput, _id: editAdminId });
      const updatedAdmin = res.data.admin;

      toast.success('Successfully edited admin');
      
      // clear all the input states
      setShowAdminForm(false);
      setAdminInput(initialAdminInput);
      setIsEditAdmin(false);

      // update admin in the state
      setUsers((prevState) => {
        const updatedUsers = prevState.filter((users) => users._id !== editAdminId);
        return [...updatedUsers, updatedAdmin];
      });
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // function to delete a admin user
  async function deleteAdmin(user: AdminUser) {
    setIsLoading(true);

    try {
      await axios.delete(`/api/admin/users?_id=${user._id}`);

      toast.success(`Successfully delete admin: ${user.fullName}`);

      // update state
      setUsers((prevState) => {
        return prevState.filter((users) => users._id !== user._id);
      });
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  return (
    <main className={styles.main}>
      <div className={styles.mini_header}>
        <h1>All Admin users</h1>
        <button onClick={() => setShowAdminForm(true)}>Add new member</button>
      </div>

      {/* form to add/edit admin users */}
      {(showAdminForm) &&
        <section className={styles.add_admin_container}>
          <div className={styles.add_admin_inner_container}>
            <h2>{isEditAdmin ? 'Edit' : 'Add'} admin</h2>

            <form>
              <div className={styles.form_control}>
                <label htmlFor="fullName">Full Name</label>
                <input
                  type='text'
                  name='fullName'
                  value={adminInput.fullName}
                  onChange={(e) => {
                    resetInputElement('fullName');
                    setAdminInput((prevState) => {
                      return {
                        ...prevState,
                        fullName: e.target.value,
                      }
                    })
                  }}
                />

                <span data-name='fullName' className={styles.error_msg}></span>
              </div>

              <div className={styles.form_control}>
                <label htmlFor="email">Email</label>
                <input
                  type='email'
                  name='email'
                  value={adminInput.email}
                  onChange={(e) => {
                    resetInputElement('email');
                    setAdminInput((prevState) => {
                      return {
                        ...prevState,
                        email: e.target.value,
                      }
                    })
                  }}
                />
                <span data-name='email' className={styles.error_msg}></span>
              </div>

              <div className={styles.form_control}>
                <label htmlFor="phone">Phone</label>
                <input
                  type='text'
                  name='phone'
                  value={adminInput.phone}
                  onChange={(e) => {
                    resetInputElement('phone');
                    setAdminInput((prevState) => {
                      return {
                        ...prevState,
                        phone: e.target.value,
                      }
                    })
                  }}
                />
                <span data-name='phone' className={styles.error_msg}></span>
              </div>

              {(!isEditAdmin) &&
                <div className={styles.form_control}>
                  <label htmlFor="password">Password</label>
                  <input
                    type='text'
                    name='password'
                    value={adminInput.password}
                    onChange={(e) => {
                      resetInputElement('password');
                      setAdminInput((prevState) => {
                        return {
                          ...prevState,
                          password: e.target.value,
                        }
                      })
                    }}
                  />

                  <span data-name='password' className={styles.error_msg}></span> 
                </div>
              }

              <div className={styles.form_control}>
                <label htmlFor="privilege">Role</label>
                <select 
                  value={adminInput.privilege}
                  onChange={(e) => setAdminInput((prevState) => {
                    return {
                      ...prevState,
                      privilege: e.target.value,
                    }
                  })}
                >
                  <option value="admin">Admin</option>
                  <option value="chief">Chief</option>
                </select>
              </div>
            </form>

            <div className={styles.admin_form_actions}>
              {isEditAdmin ?
                <button onClick={() => editAdmin()}>
                  {(isLoading) ?
                    <BeatLoader />:
                    'Edit'
                  }
                </button>:
                <button onClick={() => addAdmin()}>
                  {(isLoading) ?
                    <BeatLoader />:
                    'Save'
                  }
                </button>
              }
              
              <button onClick={() => {
                setAdminInput(initialAdminInput);
                setShowAdminForm(false);
              }}>
                Cancel
              </button>
            </div>
          </div>
        </section>
      }

      {/* list all the admin users */}
      <section className={styles.admin_container}>
        <table className={styles.admin_table}>
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => {
              return (
                <tr key={idx}>
                  <td>
                    {user.fullName}
                  </td>
                  <td>{user.email}</td>
                  <td>{user.privilege}</td>
                  <td>
                    <div className={styles.admin_user_actions}>
                      <button 
                        onClick={() => {
                          setShowAdminForm(true);
                          setIsEditAdmin(true);
                          
                          setAdminInput({
                            fullName: user.fullName,
                            email: user.email,
                            phone: user.phone,
                            password: '',
                            privilege: user.privilege
                          });
                          setEditAdminId(user._id);
                        }}
                      >
                        <RiEditFill />
                      </button>
                      <button onClick={() => deleteAdmin(user)}>
                        <MdDeleteForever />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>        
      </section>
    </main>
  )
}

export default AdminUsers;
