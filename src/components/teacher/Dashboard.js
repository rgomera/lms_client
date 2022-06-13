import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import ReportCard from './ReportCard';
import useFetch from '../hooks/useFetch';
import ClassTab from './ClassTab';
import ClassPage from './ClassPage';
import SubjectTab from './SubjectTab';
import PeopleIcon from '@material-ui/icons/People';
import ClassIcon from '@material-ui/icons/Class';
import SubjectIcon from '@material-ui/icons/Subject';
import { toast } from 'react-toastify';
import './Dashboard.css';
import AssignmentSubmissions from './AssignmentSubmissions';

const Dashboard = ({ Notifications, onSetIsAuthenticated }) => {
   const { path } = useRouteMatch();

   const [teacher, setTeacher] = useState();
   const { data: subjects, setRefresh: setSubjectsRefresh } = useFetch('/dashboard/teachers/subjects');
   const { data: classes, setRefresh: setClassRefresh } = useFetch('/dashboard/teachers/classes');

   const {
      data: studentCount,
      setData: setStudentCount,
      error: studentCountError,
      setRefresh: setStudentCountRefresh,
   } = useFetch('/dashboard/teachers/students/count');
   const { data: classCount, error: classCountError, setRefresh: setClassCountRefresh } = useFetch('/dashboard/teachers/classes/count');
   const { data: subjectCount, error: subjectCountError, setRefresh: setSubjectCountRefresh } = useFetch('/dashboard/teachers/subjects/count');

   const handleLogoutClick = e => {
      e.preventDefault();
      localStorage.removeItem('token');
      onSetIsAuthenticated(false);
      toast.success('Logout successfully!');
   };

   const fetchTeacher = async () => {
      try {
         const response = await fetch('/dashboard/teacher', { headers: { token: localStorage.getItem('token') } });
         const data = await response.json();
         setTeacher(data);
      } catch (err) {
         console.error(err.message);
      }
   };

   useEffect(() => {
      fetchTeacher();
   }, []);

   return (
      <div className='dashboard d-flex'>
         <Sidebar />

         <Switch>
            <Route exact path={path}>
               <div className='d-flex flex-column w-100'>
                  <DashboardNavbar Notifications={Notifications} teacher={teacher} onlogout={handleLogoutClick} />
                  <div className='h-100 m-3 rounded-3'>
                     <div className='row g-3'>
                        <div className='col-6 col-sm-6 col-md-4 col-lg-3 position-relative'>
                           {!studentCountError ? (
                              <ReportCard title='TOTAL STUDENTS' data={studentCount} Icon={PeopleIcon} />
                           ) : (
                              <span className='position-absolute top-50 start-50 translate-middle' style={{ color: '#ef5350' }}>
                                 {studentCountError}
                              </span>
                           )}
                        </div>
                        <div className='col-6 col-sm-6 col-md-4 col-lg-3 position-relative'>
                           {!classCountError ? (
                              <ReportCard title='TOTAL CLASSES' data={classCount} Icon={ClassIcon} />
                           ) : (
                              <span className='position-absolute top-50 start-50 translate-middle' style={{ color: '#ef5350' }}>
                                 {classCountError}
                              </span>
                           )}
                        </div>
                        <div className='col-6 col-sm-6 col-md-4 col-lg-3 position-relative'>
                           {!subjectCountError ? (
                              <ReportCard title='TOTAL SUBJECTS' data={subjectCount} Icon={SubjectIcon} />
                           ) : (
                              <span className='position-absolute top-50 start-50 translate-middle' style={{ color: '#ef5350' }}>
                                 {subjectCountError}
                              </span>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </Route>
            <Route path={`${path}/manage/classes/class-post/:classId/:postId`}>
               <div className='d-flex flex-column w-100'>
                  <DashboardNavbar teacher={teacher} onlogout={handleLogoutClick} />
                  <div className='h-100 m-3 rounded-3'>
                     <AssignmentSubmissions teacher={teacher} />
                  </div>
               </div>
            </Route>
            <Route path={`${path}/manage/classes/:id`}>
               <div className='d-flex flex-column w-100'>
                  <DashboardNavbar teacher={teacher} onlogout={handleLogoutClick} />
                  <div className='h-100 m-3 rounded-3'>
                     <ClassPage teacher={teacher} onSetStudentCountRefresh={setStudentCountRefresh} />
                  </div>
               </div>
            </Route>
            <Route path={`${path}/manage/classes`}>
               <div className='d-flex flex-column w-100'>
                  <ClassTab
                     classes={classes}
                     subjects={subjects}
                     teacher={teacher}
                     handleLogoutClick={handleLogoutClick}
                     setClassRefresh={setClassRefresh}
                     setClassCountRefresh={setClassCountRefresh}
                  />
               </div>
            </Route>

            <Route path={`${path}/manage/subjects`}>
               <div className='d-flex flex-column w-100'>
                  <SubjectTab
                     subjects={subjects}
                     teacher={teacher}
                     handleLogoutClick={handleLogoutClick}
                     setSubjectsRefresh={setSubjectsRefresh}
                     setSubjectCountRefresh={setSubjectCountRefresh}
                  />
               </div>
            </Route>
         </Switch>
      </div>
   );
};

export default Dashboard;
