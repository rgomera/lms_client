import './Sidebar.css';
import SidebarMenu from './SidebarMenu';
import DashboardIcon from '@material-ui/icons/Dashboard';
import AssignmentIcon from '@material-ui/icons/Assignment';
import SubjectIcon from '@material-ui/icons/Subject';
import ClassIcon from '@material-ui/icons/Class';
import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications';
import SidebarDropdownMenu from './SidebarDropdownMenu';
import { Link, useLocation, useRouteMatch } from 'react-router-dom';
import logo from '../../images/logo2.png';

const Sidebar = () => {
   const location = useLocation();
   const { path } = useRouteMatch();

   return (
      <div className='sidebar offcanvas offcanvas-start' data-bs-backdrop='false' data-bs-keyboard='true' id='sidebar'>
         <div className='sidebar__brand d-flex justify-content-center align-items-center p-3 mb-3'>
            <img src={logo} alt='logo.png' width='45' />
         </div>
         <div className='sidebar__menus d-flex flex-column justify-content-center'>
            <SidebarMenu path={path} text='Dashboard' Icon={DashboardIcon} />

            {/* collapse identifier is the spicifi dropdown content to show/hide */}
            <SidebarDropdownMenu text='Manage' collapseIdentifier='manage' Icon={SettingsApplicationsIcon}>
               <div className='collapse' id='manage'>
                  <div className='d-flex flex-column'>
                     <Link
                        to={`${path}/manage/classes`}
                        className={`btn btn-primary text-start p-2 ${
                           location.pathname.includes(`${path}/manage/classes`) ? 'sidebarDropdown__menu--active' : ''
                        }`}
                     >
                        <ClassIcon className='sidebar__icon' /> Classes
                     </Link>

                     <Link
                        to={`${path}/manage/subjects`}
                        className={`btn btn-primary text-start p-2 ${
                           location.pathname.includes(`${path}/manage/subjects`) ? 'sidebarDropdown__menu--active' : ''
                        }`}
                     >
                        <SubjectIcon className='sidebar__icon' /> Subjects
                     </Link>
                  </div>
               </div>
            </SidebarDropdownMenu>

            {/* <SidebarMenu path={`${path}/attendance`} text='Attendance' Icon={AssignmentIcon} /> */}
         </div>
      </div>
   );
};

export default Sidebar;
