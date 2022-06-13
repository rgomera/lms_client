import ClassList from './ClassList';
import AddClassInput from './AddClassInput';
import DashboardNavbar from './DashboardNavbar';
import AddCircleIcon from '@material-ui/icons/AddCircle';

const ClassTab = ({ teacher, handleLogoutClick, classes, subjects, setClassRefresh, setClassCountRefresh }) => {
   return (
      <>
         <DashboardNavbar teacher={teacher} onlogout={handleLogoutClick} />
         <div className='h-100 m-3 rounded-3'>
            <nav>
               <div className='nav' id='classes-tab' role='tablist'>
                  <button
                     className='nav-tabs-button active'
                     id='classesButton'
                     data-bs-toggle='tab'
                     data-bs-target='#classes'
                     type='button'
                     role='tab'
                  >
                     Classes
                  </button>
                  <button className='nav-tabs-button' id='addClassButton' data-bs-toggle='tab' data-bs-target='#addClass' type='button' role='tab'>
                     <AddCircleIcon className='text-primary fs-2' />
                  </button>
               </div>
            </nav>
            <div className='tab-content' id='classes-tabContent'>
               <div className='tab-pane fade show active' id='classes' role='tabpanel'>
                  <ClassList classes={classes} onSetClassRefresh={setClassRefresh} subjects={subjects} />
               </div>
               <div className='tab-pane fade' id='addClass' role='tabpanel'>
                  <AddClassInput onSetClassRefresh={setClassRefresh} onSetClassCountRefresh={setClassCountRefresh} />
               </div>
            </div>
         </div>
      </>
   );
};

export default ClassTab;
