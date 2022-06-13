import logo from '../images/logo.png';
import { Link } from 'react-router-dom';

const Header = () => {
   return (
      <nav className='navbar navbar-expand-lg mb-5'>
         <div className='container'>
            <Link className='navbar-brand' to='/'>
               <img className='logo' src={logo} alt='logo.png' width='45' />
            </Link>
            <button className='navbar-toggler' type='button' data-bs-toggle='collapse' data-bs-target='#navbarSupportedContent'>
               <span className='navbar-toggler-icon'></span>
            </button>
            <div className='collapse navbar-collapse' id='navbarSupportedContent'>
               <ul className='navbar-nav ms-auto mb-2 mb-lg-0'>
                  <li className='nav-item mx-lg-3'>
                     <Link className='nav-link-style' to='/'>
                        Home
                     </Link>
                  </li>
                  <li className='nav-item mx-lg-3'>
                     <Link className='nav-link-style' to='/aboutus'>
                        About Us
                     </Link>
                  </li>
                  <li className='nav-item ms-lg-3'>
                     <Link className='nav-link-style' to='/contactus'>
                        Contact Us
                     </Link>
                  </li>
               </ul>
            </div>
         </div>
      </nav>
   );
};

export default Header;
