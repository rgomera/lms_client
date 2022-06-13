import './SubjectList.css';
import EditSubject from './EditSubject';
import MoreVertIcon from '@material-ui/icons/MoreVert';

const SubjectList = ({ subjects, onSetSubjectsRefresh }) => {
   return (
      <div className='subjectList overflow-auto position-relative mt-4'>
         <ul className='list-group position-abosolute px-2'>
            {subjects &&
               subjects.map(subject => (
                  <li key={subject.subject_id} className='d-flex align-items-center list-group-item border-0 shadow-sm my-2'>
                     <div>
                        <p className='m-1'>{subject.subject_name}</p>
                     </div>
                     <div className='ms-auto'>
                        <div className='dropdown'>
                           <button className='btn px-0' data-bs-toggle='dropdown'>
                              <MoreVertIcon />
                           </button>

                           <ul className='dropdown-menu'>
                              <li>
                                 <span className='dropdown-item' data-bs-toggle='modal' data-bs-target={`#modal-${subject.subject_id}`}>
                                    Edit
                                 </span>
                              </li>
                           </ul>
                        </div>
                     </div>
                     <EditSubject target={`modal-${subject.subject_id}`} subject={subject} onSetSubjectsRefresh={onSetSubjectsRefresh} />
                  </li>
               ))}

            {subjects.length === 0 && <p>No subject to display...</p>}
         </ul>
      </div>
   );
};

export default SubjectList;
