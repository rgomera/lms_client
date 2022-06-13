import { useEffect, useState, useRef } from 'react';
import { NotificationsSharp, Close } from '@material-ui/icons';
import './Notifications.css';
import ReactHtmlParse from 'html-react-parser';
import moment from 'moment';
import { db } from '../firebase';

const Notifications = () => {
   const isMounted = useRef(false);
   const [notifications, setNotifications] = useState([]);
   const [isOpen, setIsOpen] = useState(false);

   const formats = {
      lastDay: '[Yesterday at] LT',
      sameDay: '[Today at] LT',
      nextDay: '[Tomorrow at] LT',
      lastWeek: '[last] dddd [at] LT',
      nextWeek: 'dddd [at] LT',
      sameElse: 'LL',
   };

   useEffect(() => {
      isMounted.current = true;
      db.collection('notifications')
         .orderBy('createdAt', 'desc')
         .onSnapshot(snapshot => {
            if (isMounted.current) {
               setNotifications(
                  snapshot.docs.map(doc => ({
                     id: doc.id,
                     ...doc.data(),
                  }))
               );
            }
         });

      // cleanup function
      return () => {
         isMounted.current = false;
      };
   }, []);

   return (
      <div className='notification-container'>
         <NotificationsSharp className='text-primary fs-2 me-2 cursor-pointer' onClick={() => setIsOpen(prev => !prev)} />

         {isOpen && (
            <div className='notification-content'>
               <div className='notification-header'>Notifications</div>
               <div className='notifications'>
                  {/* <div className='notification-item'>
                     <div>
                        <div className='notification-timestamp'>April 24, 2022 12:59PM</div>
                        <div className='w-100'>
                           <div>
                              <span className='fw-bold'>Rey Mond Gomera posted</span> new assignment in{' '}
                              <span className='fw-bold'>Sample Class 1</span> entitled <span className='fw-bold'>Quiz 1</span>
                           </div>
                           <div className='w-100'>Due: March 21, 2022 12:59PM</div>
                        </div>
                     </div>
                     <div>
                        <Close className='cursor-pointer' />
                     </div>
                  </div> */}

                  {notifications.length > 0 ? (
                     notifications.map(notif => (
                        <div key={notif.id} className='notification-item'>
                           <div>
                              <div className='notification-timestamp'>{notif.createdAt && moment(notif.createdAt.toDate()).calendar(formats)}</div>
                              <div className='w-100'>{ReactHtmlParse(notif.text)}</div>
                           </div>
                           <div>
                              <Close className='cursor-pointer' />
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className='text-center'>No notifications at the moment..</div>
                  )}
               </div>
            </div>
         )}
      </div>
   );
};

export default Notifications;
