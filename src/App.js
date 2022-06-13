import './App.css';
import TeacherSignin from './components/teacher/Signin';
import TeacherSignup from './components/teacher/Signup';
import TeacherDashboard from './components/teacher/Dashboard';
import StudentSignin from './components/student/Signin';
import StudentSignup from './components/student/Signup';
import StudentDashboard from './components/student/Dashboard';
import { ToastContainer, Flip } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter as Router, Route, Switch, Redirect, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import LandingPage from './components/LandingPage';
import SigninSignupOptions from './components/SigninSignupOptions';
import AboutUs from './components/AboutUs';
import ContactUs from './components/ContactUs';
import Notifications from './components/Notifications';

function App() {
   const [isAuthenticated, setIsAuthenticated] = useState(false);

   const isVarify = async () => {
      try {
         const response = await fetch('/auth/is-varify', { headers: { token: localStorage.getItem('token') } });
         const data = await response.json(response);
         data === true ? setIsAuthenticated(true) : setIsAuthenticated(false);
      } catch (err) {
         console.error(err.message);
      }
   };

   useEffect(() => {
      isVarify();
   }, []);

   return (
      <div className='app'>
         <Router>
            <Switch>
               <Route exact path='/'>
                  <LandingPage />
               </Route>
               <Route exact path='/signin-options'>
                  <SigninSignupOptions option='signin' />
               </Route>
               <Route exact path='/signup-options'>
                  <SigninSignupOptions option='signup' />
               </Route>

               <Route exact path='/aboutus'>
                  <AboutUs />
               </Route>
               <Route exact path='/contactus'>
                  <ContactUs />
               </Route>

               <Route exact path='/teacher/signin'>
                  {!isAuthenticated ? <TeacherSignin onSetIsAuthenticated={setIsAuthenticated} /> : <Redirect to='/teacher' />}
               </Route>
               <Route exact path='/teacher/signup'>
                  {!isAuthenticated ? <TeacherSignup onSetIsAuthenticated={setIsAuthenticated} /> : <Redirect to='/teacher/signin' />}
               </Route>
               <Route path='/teacher'>
                  {!isAuthenticated ? (
                     <Redirect to='/teacher/signin' />
                  ) : (
                     <TeacherDashboard Notifications={Notifications} onSetIsAuthenticated={setIsAuthenticated} />
                  )}
               </Route>

               <Route exact path='/student/signin'>
                  {!isAuthenticated ? <StudentSignin onSetIsAuthenticated={setIsAuthenticated} /> : <Redirect to='/student' />}
               </Route>
               <Route exact path='/student/signup'>
                  {!isAuthenticated ? <StudentSignup onSetIsAuthenticated={setIsAuthenticated} /> : <Redirect to='/student/signin' />}
               </Route>
               <Route path='/student'>
                  {!isAuthenticated ? (
                     <Redirect to='/student/signin' />
                  ) : (
                     <StudentDashboard Notifications={Notifications} onSetIsAuthenticated={setIsAuthenticated} />
                  )}
               </Route>
            </Switch>
         </Router>

         <ToastContainer theme='light' transition={Flip} autoClose={2000} />
      </div>
   );
}

export default App;
