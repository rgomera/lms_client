import Modal from './Modal';
import DeleteIcon from '@material-ui/icons/Delete';
import DeleteStudentInClass from './DeleteStudentInClass';
import useFetch from '../hooks/useFetch';
import { toast } from 'react-toastify';

const ViewClassStudents = ({ students, onSetStudentCountRefresh, onSetStudentsRefresh, onSetStudentNotInClassRefresh, classInstance, target }) => {
   const deleteStudent = async (student, classId) => {
      try {
         const response = await fetch(`/dashboard/teachers/students/${student.student_id}/${classId}`, {
            method: 'DELETE',
            headers: { token: localStorage.getItem('token') },
         });
         const data = await response.json();

         if (response.status === 200) {
            onSetStudentCountRefresh(prev => !prev);
            onSetStudentsRefresh(prev => !prev);
            onSetStudentNotInClassRefresh(prev => !prev);

            toast.success(data.message);
         } else toast.error(data.message);
      } catch (err) {
         console.error(err);
      }
   };

   return (
      <div>
         <Modal title='Students' key={classInstance.class_id} target={target}>
            {students.length > 0 ? (
               <table className='table table-bordered table-hover m-0'>
                  <thead>
                     <tr className='bg-secondary-dark'>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     {students.map(student => (
                        <tr className='position-relative' key={student.student_id}>
                           <td>{`${student.student_fname} ${student.student_lname} ${
                              student.student_mname && student.student_mname.charAt(0) + '.'
                           }`}</td>
                           <td>{student.student_email}</td>
                           <td className='position-relative'>
                              <button className='btn p-0'>
                                 <DeleteIcon className='text-primary' data-bs-toggle='modal' data-bs-target={`#modal-delete-${student.student_id}`} />
                              </button>
                           </td>
                           <>
                              <DeleteStudentInClass
                                 onDeleteStudent={deleteStudent}
                                 student={student}
                                 classInstance={classInstance}
                                 target={`modal-delete-${student.student_id}`}
                              />
                           </>
                        </tr>
                     ))}
                  </tbody>
               </table>
            ) : (
               <span>No students to display...</span>
            )}
         </Modal>
      </div>
   );
};

export default ViewClassStudents;
