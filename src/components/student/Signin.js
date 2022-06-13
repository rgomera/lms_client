import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import loginImage from '../../images/login-image.svg';
import logo from '../../images/logo.png';
import './Signin.css';

const Signin = ({ onSetIsAuthenticated }) => {
   const [inputs, setInputs] = useState({ email: '', password: '' });
   const { email, password } = inputs;

   const handleSubmit = async e => {
      e.preventDefault();
      e.target.className += ' was-validated';

      try {
         const body = { email: email.toLowerCase(), password };
         const response = await fetch('/auth/student/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
         });
         const data = await response.json();

         if (data.token) {
            localStorage.setItem('token', data.token);
            onSetIsAuthenticated(true);
            toast.success(data.message);
         } else toast.error(data.message);
      } catch (err) {
         console.error(err.message);
      }
   };

   const handleInputChange = e => {
      setInputs({ ...inputs, [e.target.name]: e.target.value });
   };

   return (
      <div className='container py-4'>
         <div>
            <Link to='/' className='d-flex justify-content-center align-items-end text-decoration-none'>
               <img className='logo m-0 me-3' src={logo} alt='logo.png' width='45' />
               <h1 className='text-center fw-bold text--highlighted m-0 font-2'> &nbsp;LEARNING MANAGEMENT SYSTEM</h1>
            </Link>
         </div>
         <div className='login row border p-5 p-lg-4 mt-4 shadow container__round--corners justify-content-evenly align-items-center'>
            <div className='col-lg-5 me-lg-5'>
               <form className='needs-validation' noValidate onSubmit={handleSubmit}>
                  <div className='mt-5 mb-3'>
                     <label htmlFor='email' className='form-label'>
                        Email
                     </label>
                     <input className='form-control py-2' value={email} type='email' id='email' name='email' required onChange={handleInputChange} />
                     <div className='invalid-feedback'>Email is invalid and can't be empty.</div>
                  </div>
                  <div className='mb-3'>
                     <label htmlFor='password' className='form-label'>
                        Password
                     </label>
                     <input
                        className='form-control py-2'
                        value={password}
                        type='password'
                        id='password'
                        name='password'
                        required
                        onChange={handleInputChange}
                     />
                     <div className='invalid-feedback'>Password can't be empty.</div>
                  </div>
                  <button className='btn btn-primary w-100 mt-2 py-2' type='submit'>
                     Sign In
                  </button>
                  <div className='my-4'>
                     Don't have an account yet? &nbsp;
                     <Link className='fw-bold link--color' to='/student/signup'>
                        Sign Up
                     </Link>
                  </div>
               </form>
            </div>

            <div className='col-lg-5 my-lg-5'>
               <img className='img-fluid d-none d-lg-block my-5' src={loginImage} alt='loading-illustration' />
            </div>
         </div>
      </div>
   );
};

export default Signin;
