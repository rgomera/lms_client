import ClassList from './ClassList';
import DashboardNavbar from './DashboardNavbar';
import JoinClassInput from './JoinClassInput';

const DashboardTab = ({ student, handleLogoutClick, classes, setClassesRefresh }) => {
   return (
      <>
         <DashboardNavbar student={student} onlogout={handleLogoutClick} />
         <div className='h-100 m-3 rounded-3'>
            <nav>
               <div className='nav' id='nav-tab' role='tablist'>
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

                  <button className='nav-tabs-button' id='joinClassButton' data-bs-toggle='tab' data-bs-target='#join-class' type='button' role='tab'>
                     Join Class
                  </button>
               </div>
            </nav>
            <div className='tab-content' id='nav-tabContent'>
               <div className='tab-pane fade show active' id='classes' role='tabpanel'>
                  <ClassList classes={classes} onSetClassesRefresh={setClassesRefresh} />
               </div>
               <div className='tab-pane fade show' id='join-class' role='tabpanel'>
                  <JoinClassInput onSetClassesRefresh={setClassesRefresh} />
               </div>
            </div>
         </div>
      </>
   );
};

export default DashboardTab;
