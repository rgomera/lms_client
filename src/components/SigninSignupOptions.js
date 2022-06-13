import './SigninSignupOptions.css';
import logo from '../images/logo.png';
import { Link } from 'react-router-dom';

const SigninSignupOptions = ({ option }) => {
   return (
      <div className='signin-signup-options-container'>
         <div className='container py-5'>
            <Link to='/'>
               <img className='logo' src={logo} alt='logo.png' width='45' />
            </Link>
         </div>
         <div className='container h-75 overflow-auto d-flex flex-column flex-lg-row align-items-center  justify-content-lg-between px-5'>
            <div className='options-container mx-4 mb-5'>
               <div>
                  {/* fix the text based on the design */}
                  {option === 'signin' ? (
                     <>
                        <h1 className='text-white mb-0'>Welcome back</h1>
                        <div className='d-flex'>
                           <h1 className=' text-tertiary'>Student</h1>
                           <h1 className='text-white'>!</h1>
                        </div>
                        <h2 className='h5 font-2 text-white my-3'>Log back into your account</h2>
                     </>
                  ) : (
                     <>
                        <h1 className='text-white mb-0'>Sign up as a</h1>
                        <div className='d-flex'>
                           <h1 className=' text-tertiary'>Student</h1>
                        </div>
                        <h2 className='h5 font-2 text-white my-3'>Create your student account</h2>
                     </>
                  )}
                  <div>
                     <Link className='font-2 btn btn-lg btn-white my-3 fw-bold' to={`/student/${option === 'signin' ? 'signin' : 'signup'}`}>
                        {option === 'signin' ? 'Sign In' : 'Sign Up'}
                     </Link>
                  </div>
               </div>
            </div>
            <div className='options-container mx-4 mb-5'>
               <div>
                  {option === 'signin' ? (
                     <>
                        <h1 className='text-white mb-0'>Welcome back</h1>
                        <div className='d-flex'>
                           <h1 className=' text-tertiary'>Teacher</h1>
                           <h1 className='text-white'>!</h1>
                        </div>
                        <h2 className='h5 font-2 text-white my-3'>Log back into your account</h2>
                     </>
                  ) : (
                     <>
                        <h1 className='text-white mb-0'>Sign up as a</h1>
                        <div className='d-flex'>
                           <h1 className=' text-tertiary'>Teacher</h1>
                        </div>
                        <h2 className='h5 font-2 text-white my-3'>Create your teacher account</h2>
                     </>
                  )}
                  <div>
                     <Link className='font-2 btn btn-lg btn-white my-3 fw-bold' to={`/teacher/${option === 'signin' ? 'signin' : 'signup'}`}>
                        {option === 'signin' ? 'Sign In' : 'Sign Up'}
                     </Link>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default SigninSignupOptions;
