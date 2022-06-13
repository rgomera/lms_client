import Modal from './Modal';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { useState, useRef } from 'react';
import { toast } from 'react-toastify';

const AddClassStudent = ({
   onSetStudentsRefresh,
   onSetStudentCountRefresh,
   onSetStudentNotInClassRefresh,
   studentNotInClass,
   classInstance,
   target,
}) => {
   const [inputs, setInputs] = useState({ email: '' });
   const [searchResult, setSearchResult] = useState([]);
   const { email } = inputs;
   const searchInputRef = useRef();

   const searchStudentToAdd = e => {
      setInputs({ ...inputs, [e.target.name]: e.target.value.toLowerCase() });
      if (e.target.value) setSearchResult(studentNotInClass.filter(student => student.student_email.includes(e.target.value.toLowerCase())));
   };

   const addStudentToClass = async (student, classInstance) => {
      try {
         const response = await fetch(`/dashboard/teachers/students/${student.student_id}/${classInstance.class_id}`, {
            method: 'POST',
            headers: { token: localStorage.getItem('token'), 'Content-Type': 'application/json' },
         });
         const data = await response.json();

         if (response.status === 200) {
            onSetStudentsRefresh(prev => !prev);
            onSetStudentCountRefresh(prev => !prev);
            onSetStudentNotInClassRefresh(prev => !prev);

            toast.success(data.message);
         } else toast.error(data.message);
      } catch (err) {
         console.error();
      }
   };

   const resetState = e => {
      e.stopPropagation();
      if (e.target.nodeName !== 'INPUT' && e.target.nodeName !== 'BUTTON') {
         setInputs({ email: '' });
         searchInputRef.current.value = '';
      }
   };

   return (
      <div onClick={resetState}>
         <Modal title='Students' key={classInstance.class_id} target={target}>
            <input
               ref={searchInputRef}
               className='form-control'
               type='search'
               name='email'
               id='email'
               onKeyUp={searchStudentToAdd}
               placeholder='Search for student email. ( e.g johndoe@gmail.com )'
            />

            <ul className='list-group mt-3'>
               {email.length > 0 &&
                  searchResult.map(student => (
                     <li
                        key={student.student_id}
                        className='d-flex justify-content-between align-items-center list-group-item border-0 shadow-sm my-2'
                     >
                        <div className='fw-bold'>
                           {`${student.student_fname} ${student.student_lname} ${student.student_mname && student.student_mname.charAt(0) + '.'}`}
                        </div>

                        <div>
                           <button className='btn p-0' onClick={() => addStudentToClass(student, classInstance)}>
                              <PersonAddIcon className='text-primary fs-5' />
                           </button>
                        </div>
                     </li>
                  ))}
            </ul>
         </Modal>
      </div>
   );
};

export default AddClassStudent;
