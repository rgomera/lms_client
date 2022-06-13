import SubjectList from './SubjectList';
import AddSubjectInput from './AddSubjectInput';
import DashboardNavbar from './DashboardNavbar';
import AddCircleIcon from '@material-ui/icons/AddCircle';

const SubjectTab = ({ teacher, handleLogoutClick, subjects, setSubjectsRefresh, setSubjectCountRefresh }) => {
   return (
      <>
         <DashboardNavbar teacher={teacher} onlogout={handleLogoutClick} />
         <div className='h-100 m-3 rounded-3'>
            <nav>
               <div className='nav' id='subject-tab' role='tablist'>
                  <button
                     className='nav-tabs-button active'
                     id='subjectsButton'
                     data-bs-toggle='tab'
                     data-bs-target='#subjects'
                     type='button'
                     role='tab'
                  >
                     Subjects
                  </button>
                  <button
                     className='nav-tabs-button'
                     id='addSubjectButton'
                     data-bs-toggle='tab'
                     data-bs-target='#addSubject'
                     type='button'
                     role='tab'
                  >
                     <AddCircleIcon className='text-primary fs-2' />
                  </button>
               </div>
            </nav>
            <div className='tab-content' id='subjects-tabContent'>
               <div className='tab-pane fade show active' id='subjects' role='tabpanel'>
                  <SubjectList subjects={subjects} onSetSubjectsRefresh={setSubjectsRefresh} />
               </div>
               <div className='tab-pane fade' id='addSubject' role='tabpanel'>
                  <AddSubjectInput teacher={teacher} onSetSubjectsRefresh={setSubjectsRefresh} onSetSubjectCountRefresh={setSubjectCountRefresh} />
               </div>
            </div>
         </div>
      </>
   );
};

export default SubjectTab;
