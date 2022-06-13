import maleAvatar from '../../images/male-avatar.svg';
import femaleAvatar from '../../images/female-avatar.svg';
import MenuIcon from '@material-ui/icons/Menu';
import './DashboardNavbar.css';

const DashboardNavbar = ({ student, onlogout }) => {
   return (
      <nav className='dashboardNavbar container-fluid p-2 shadow-sm'>
         <div className='d-flex justify-content-between align-items-center'>
            <div>
               <button className='btn btn-primary p-1' type='button' data-bs-toggle='offcanvas' data-bs-target='#sidebar'>
                  <MenuIcon />
               </button>
            </div>
            <div>
               <img src={student && student.student_gender === 'Male' ? maleAvatar : femaleAvatar} alt='avatar' width='40' />
               <button className='btn btn-primary mx-2' onClick={onlogout}>
                  Logout
               </button>
            </div>
         </div>
      </nav>
   );
};

export default DashboardNavbar;
