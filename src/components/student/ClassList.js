import '../teacher/Dashboard.css';
import { Link } from 'react-router-dom';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import FaceIcon from '@material-ui/icons/Face';
import Modal from '../teacher/Modal';
import { toast } from 'react-toastify';

const ClassList = ({ classes, onSetClassesRefresh }) => {
   const hanleLeaveClass = async (teacherId, classId) => {
      try {
         const body = { teacherId, classId };
         const response = await fetch('/dashboard/students/leave-class', {
            method: 'DELETE',
            headers: { token: localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
         });
         const data = await response.json();

         if (response.status === 200) {
            onSetClassesRefresh(prev => !prev);
            toast.success(data.message);
         } else toast.error(data.message);
      } catch (err) {
         console.error(err.message);
      }
   };

   return (
      <div className='classList overflow-auto position-relative mt-4'>
         <ul className='list-group position-abosolute px-2'>
            {classes &&
               classes.map(classInstance => (
                  <li key={classInstance.class_id} className='d-flex list-group-item border-0 shadow-sm my-2'>
                     <Link
                        key={classInstance.class_id}
                        className='text-reset text-decoration-none'
                        to={`/student/classes/${classInstance.class_id}/${classInstance.teacher_id}`}
                     >
                        <p className='m-1'>
                           <span className='text-primary me-2'>
                              <FaceIcon />
                           </span>
                           <span className='fw-bold'>
                              {`${classInstance.teacher_fname} ${classInstance.teacher_lname} ${
                                 classInstance.teacher_mname && classInstance.teacher_mname.charAt(0) + '.'
                              }`}
                           </span>
                        </p>
                        <p className='m-1'>{classInstance.class_name}</p>
                        <p className='m-1'>{classInstance.subject_name}</p>
                        <p className='m-1'>{classInstance.class_section && `${classInstance.class_section}`}</p>
                        <p className='m-1'>{classInstance.class_school_year}</p>
                     </Link>
                     <div className='ms-auto'>
                        <div className='dropdown'>
                           <button className='btn mt-1 px-0' data-bs-toggle='dropdown'>
                              <MoreVertIcon />
                           </button>

                           <ul className='dropdown-menu'>
                              <li>
                                 <span
                                    className='dropdown-item'
                                    data-bs-toggle='modal'
                                    data-bs-target={`#modal-confirm-leaveClass-${classInstance.class_id}`}
                                 >
                                    Leave Class
                                 </span>
                              </li>
                           </ul>
                        </div>
                     </div>

                     <Modal title='Confirmation Message' target={`modal-confirm-leaveClass-${classInstance.class_id}`}>
                        <div>
                           <p>Are you sure you want to leave {classInstance.class_name}? All your files will remain on this class.</p>
                           <div className='d-flex justify-content-end'>
                              <button className='btn btn-secondary me-2' data-bs-dismiss='modal'>
                                 Cancel
                              </button>
                              <button
                                 className='btn btn-primary'
                                 data-bs-dismiss='modal'
                                 onClick={() => hanleLeaveClass(classInstance.teacher_id, classInstance.class_id)}
                              >
                                 Confirm
                              </button>
                           </div>
                        </div>
                     </Modal>
                  </li>
               ))}

            {classes.length === 0 && <p>No classes to display...</p>}
         </ul>
      </div>
   );
};

export default ClassList;
