import './Sidebar.css';
import SidebarMenu from './SidebarMenu';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AssignmentIcon from '@material-ui/icons/Assignment';
import { useRouteMatch } from 'react-router-dom';
import logo from '../../images/logo2.png';

const Sidebar = () => {
   const { path } = useRouteMatch();
   return (
      <div className='sidebar offcanvas offcanvas-start' data-bs-backdrop='false' data-bs-keyboard='true' id='sidebar'>
         <div className='sidebar__brand d-flex justify-content-center align-items-center p-3 mb-3'>
            <img src={logo} alt='logo.png' width='45' />
         </div>
         <div className='sidebar__menus d-flex flex-column justify-content-center'>
            {/* TODO: need to change the the conditional styling to make sure the button is active in the right path*/}
            <SidebarMenu path={path} text='Dashboard' Icon={DashboardIcon} />
            {/* <SidebarMenu path={`${path}/attendance`} text='Attendance' Icon={AssignmentIcon} /> */}
         </div>
      </div>
   );
};

export default Sidebar;
