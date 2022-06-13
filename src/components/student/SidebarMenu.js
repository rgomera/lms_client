import './SidebarMenu.css';
import { Link, useLocation } from 'react-router-dom';

const SidebarMenu = ({ path, text, Icon }) => {
   const location = useLocation();

   return (
      <div className={`sidebarMenu__item d-flex align-items-center ${location.pathname === path ? 'sidebarMenu__item--active' : ''}`}>
         <Link to={path} className='sidebarMenu__item__link'>
            <Icon className='sidebarMenu__item__icon' />
            {text}
         </Link>
      </div>
   );
};

export default SidebarMenu;
