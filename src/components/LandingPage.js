import './LandingPage.css';
import { Link } from 'react-router-dom';
import Header from './Header';
import landingPageImage from '../images/landingpage_image.svg';

const LandingPage = () => {
   return (
      <div className='landing-page'>
         <Header />

         <section className='d-flex justify-content-center px-5 px-lg-0 pt-5 container banner'>
            <div className='py-1'>
               <div>
                  <h1 className='text-primary fw-bold m-0 banner-header'>ONLINE EDUCATION MADE EASIER</h1>
                  <h3 className='text-secondary my-4 h4'>A community with high academic achievement</h3>
               </div>
               <div>
                  <Link className='fw-bold btn btn-lg btn-outline-primary px-5 me-4' to='/signin-options'>
                     Sign In
                  </Link>
                  <Link className='fw-bold btn btn-lg btn-primary px-5' to='/signup-options'>
                     Sign Up
                  </Link>
               </div>
            </div>
            <div className='d-none d-lg-block'>
               <img src={landingPageImage} alt='landingpage-image.svg' width='500' />
            </div>
         </section>
      </div>
   );
};

export default LandingPage;
