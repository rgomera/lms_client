import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import signupImage from '../../images/sutdent-signup-image.svg';
import PasswordStrengthMeter from '../PasswordStrengthMeter';
import InfoIcon from '@material-ui/icons/Info';
import logo from '../../images/logo.png';
import './Signup.css';

const Singup = ({ onSetIsAuthenticated }) => {
   const [isOpen, setIsOpen] = useState(false);
   const [inputs, setInputs] = useState({ fname: '', mname: '', lname: '', gender: '', email: '', password: '', cpassword: '' });
   const { fname, lname, mname, gender, email, password, cpassword } = inputs;

   const handleSubmit = async e => {
      e.preventDefault();
      e.target.className += ' was-validated';
      try {
         const body = {
            fname: titleCase(fname),
            lname: titleCase(lname),
            mname: titleCase(mname),
            gender,
            email: email.toLowerCase(),
            password,
            cpassword,
         };
         const respose = await fetch('/auth/student/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
         });
         const data = await respose.json();

         if (data.token) {
            localStorage.setItem('token', data.token);
            onSetIsAuthenticated(true);
            toast.success(data.message);
         } else toast.error(data.message);
      } catch (err) {
         console.error(err.message);
      }
   };

   const titleCase = str => {
      const strArray = str.split(' ');
      if (strArray.length > 0) {
         const titleCaseString = strArray.map(string => {
            return string.charAt(0).toUpperCase() + string.slice(1, string.length);
         });
         return titleCaseString.join(' ');
      } else return str.charAt(0).toUpperCase() + str.slice(1, str.length);
   };

   const handleInputChange = e => {
      setInputs({ ...inputs, [e.target.name]: e.target.value });
   };

   return (
      <div>
         <div className='container py-4'>
            <div>
               <Link to='/' className='d-flex justify-content-center align-items-end text-decoration-none'>
                  <img className='logo m-0 me-3' src={logo} alt='logo.png' width='45' />
                  <h1 className='text-center fw-bold text--highlighted m-0 font-2'> &nbsp;LEARNING MANAGEMENT SYSTEM</h1>
               </Link>
            </div>
            <div className='signup row border p-5 p-lg-4 mt-4 shadow container__round--corners justify-content-evenly align-items-center'>
               <div className='col-lg-5 me-lg-5'>
                  <form className='needs-validation' noValidate onSubmit={handleSubmit}>
                     <div className='row mt-5'>
                        <div className='col-lg-6 mb-3'>
                           <label htmlFor='email' className='form-label'>
                              First Name:
                           </label>
                           <input
                              className='form-control py-2'
                              value={fname}
                              type='text'
                              id='fname'
                              name='fname'
                              required
                              onChange={handleInputChange}
                           />
                           <div className='invalid-feedback'>First name can't be empty.</div>
                        </div>
                        <div className='col-lg-6 mb-3'>
                           <label htmlFor='email' className='form-label'>
                              Last Name:
                           </label>
                           <input className='form-control' value={lname} type='text' id='lname' name='lname' required onChange={handleInputChange} />
                           <div className='invalid-feedback'>Last name can't be empty.</div>
                        </div>
                        <div className='col-lg-6 mb-3'>
                           <label htmlFor='email' className='form-label'>
                              Middle Name:
                           </label>
                           <input
                              className='form-control py-2'
                              value={mname}
                              type='text'
                              id='mname'
                              name='mname'
                              onChange={handleInputChange}
                              placeholder='( Optional )'
                           />
                        </div>
                        <div className='col-lg-6 mb-3'>
                           <label htmlFor='email' className='form-label'>
                              Gender:
                           </label>
                           <select className='form-select py-2' value={gender} name='gender' id='gender' required onChange={handleInputChange}>
                              <option value=''>Choose Gender</option>
                              <option value='Male'>Male</option>
                              <option value='Female'>Female</option>
                           </select>
                           <div className='invalid-feedback'>Choose a gender.</div>
                        </div>
                     </div>

                     <div className='mb-3'>
                        <label htmlFor='email' className='form-label'>
                           Email
                        </label>
                        <input
                           className='form-control py-2'
                           value={email}
                           type='email'
                           id='email'
                           name='email'
                           required
                           onChange={handleInputChange}
                        />
                        <div className='invalid-feedback'>Email is invalid and can't be empty.</div>
                     </div>
                     <div className='row'>
                        <div className='col-lg-6 mb-3'>
                           <div className='d-flex align-item-center'>
                              <label htmlFor='password' className='form-label'>
                                 Password
                              </label>
                              <div className='custom-tooltip-container mx-2' onClick={() => setIsOpen(prev => !prev)}>
                                 <InfoIcon className='fs-5 cursor-pointer text-primary' />

                                 {isOpen && (
                                    <div className='custom-tooltip'>
                                       <p className='mb-1'>Password must have:</p>
                                       <ul className='ps-4 mb-0'>
                                          <li>At least eight in length</li>
                                          <li>At least one upper and lower case letter</li>
                                          <li>At least one digit</li>
                                          <li>At least one special character (e.g. #?!@$%^&amp;*-)</li>
                                       </ul>
                                    </div>
                                 )}
                              </div>
                           </div>
                           <input
                              className='form-control py-2 mb-1'
                              value={password}
                              type='password'
                              id='password'
                              name='password'
                              minLength='8'
                              required
                              placeholder='Password'
                              onChange={handleInputChange}
                           />
                           <PasswordStrengthMeter password={password} />
                           <div className='invalid-feedback'>Password can't be empty and must meet the requirements</div>
                        </div>
                        <div className='col-lg-6 mb-3'>
                           <label htmlFor='password' className='form-label'>
                              Confirm Password
                           </label>
                           <input
                              className='form-control py-2 mb-1'
                              value={cpassword}
                              type='password'
                              id='cpassword'
                              name='cpassword'
                              minLength='8'
                              required
                              placeholder='Confirm Password'
                              onChange={handleInputChange}
                           />
                           <div className='invalid-feedback'>Confirm Password can't be empty and must meet the requirements</div>
                        </div>
                     </div>
                     <button className='btn btn-primary w-100 mt-2 py-2' type='submit'>
                        Sign Up
                     </button>
                     <div className='my-4'>
                        Already have an account? &nbsp;
                        <Link className='fw-bold link--color' to='/student/signin'>
                           Sign In
                        </Link>
                     </div>
                  </form>
               </div>
               <div className='col-lg-5 my-lg-5'>
                  <img className='img-fluid d-none d-lg-block my-4' src={signupImage} alt='signup-illustration' />
               </div>
            </div>
         </div>
      </div>
   );
};

export default Singup;
