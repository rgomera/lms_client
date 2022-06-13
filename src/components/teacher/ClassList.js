import './ClassList.css';
import { Link } from 'react-router-dom';
import EditClass from './EditClass';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const ClassList = ({ classes, onSetClassRefresh, subjects }) => {
   return (
      <div className='classList overflow-auto position-relative mt-4'>
         <ul className='list-group position-abosolute px-2'>
            {classes &&
               classes.map(classInstance => (
                  <li key={classInstance.class_id} className='d-flex list-group-item border-0 shadow-sm my-2'>
                     <Link
                        key={classInstance.class_id}
                        className='text-reset text-decoration-none'
                        to={`/teacher/manage/classes/${classInstance.class_id}`}
                     >
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
                                 <span className='dropdown-item' data-bs-toggle='modal' data-bs-target={`#modal-${classInstance.class_id}`}>
                                    Edit
                                 </span>
                              </li>
                              <li>
                                 <span className='dropdown-item' href='/'>
                                    Delete
                                 </span>
                              </li>
                           </ul>
                        </div>
                     </div>
                     <EditClass
                        target={`modal-${classInstance.class_id}`}
                        onSetClassRefresh={onSetClassRefresh}
                        classInstance={classInstance}
                        subjects={subjects}
                     />
                  </li>
               ))}

            {classes.length === 0 && <p>No subject to display...</p>}
         </ul>
      </div>
   );
};

export default ClassList;
