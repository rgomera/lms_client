import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useFetch from '../hooks/useFetch';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import ClassPage from './ClassPage';
import { toast } from 'react-toastify';
import '../teacher/Dashboard.css';
import AssignmentSubmissions from './AssignmentSubmissions';
import DashboardTab from './DashboardTab';
import TakeQuiz from './TakeQuiz';

const Dashboard = ({ onSetIsAuthenticated }) => {
   const { path } = useRouteMatch();

   const [student, setStudent] = useState();
   const { data: classes, setRefresh: setClassesRefresh } = useFetch('/dashboard/students/classes');

   const handleLogoutClick = e => {
      e.preventDefault();
      localStorage.removeItem('token');
      onSetIsAuthenticated(false);
      toast.success('Logout successfully!');
   };

   const fetchStudent = async () => {
      try {
         const response = await fetch('/dashboard/student', { headers: { token: localStorage.getItem('token') } });
         const data = await response.json();
         setStudent(data);
      } catch (err) {
         console.error(err.message);
      }
   };

   useEffect(() => {
      fetchStudent();
   }, []);

   return (
      <div className='dashboard d-flex'>
         <Sidebar />
         <Switch>
            <Route exact path={path}>
               <div className='d-flex flex-column w-100'>
                  <DashboardTab student={student} handleLogoutClick={handleLogoutClick} classes={classes} setClassesRefresh={setClassesRefresh} />
               </div>
            </Route>

            <Route path={`${path}/classes/class-post/:classId/:teacherId/:postId`}>
               <div className='d-flex flex-column w-100'>
                  <DashboardNavbar student={student} onlogout={handleLogoutClick} />
                  <div className='h-100 m-3 rounded-3'>
                     <AssignmentSubmissions student={student} />
                  </div>
               </div>
            </Route>
            <Route path={`${path}/classes/class-takequiz/:classId/:teacherId/:postId`}>
               <div className='d-flex flex-column w-100'>
                  <DashboardNavbar student={student} onlogout={handleLogoutClick} />
                  <div className='h-100 m-3 rounded-3'>
                     <TakeQuiz student={student} />
                  </div>
               </div>
            </Route>
            <Route path={`${path}/classes/:classId/:teacherId`}>
               <div className='d-flex flex-column w-100'>
                  <DashboardNavbar student={student} onlogout={handleLogoutClick} />
                  <div className='h-100 m-3 rounded-3'>
                     <ClassPage student={student} />
                  </div>
               </div>
            </Route>
            {/* <Route path={`${path}/attendance`}>
               <div className='d-flex flex-column w-100'>
                  <DashboardNavbar student={student} onlogout={handleLogoutClick} />
                  <div className='h-100 m-3 rounded-3'>Attendance</div>
               </div>
            </Route> */}
         </Switch>
      </div>
   );
};

export default Dashboard;
