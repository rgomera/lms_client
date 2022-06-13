import CloseIcon from '@material-ui/icons/Close';

const DeleteStudentInClass = ({ onDeleteStudent, student, classInstance, target }) => {
   return (
      <td className='p-0 border-0'>
         <div className='modal fade delete__modal' id={target} tabIndex='-1'>
            <div className='modal-dialog mt-3'>
               <div className='modal-content'>
                  <div className='modal-header'>
                     <h5 className='modal-title fs-5 ms-2'>Confirmation Message</h5>
                     <CloseIcon
                        className='btn-primary fs-4'
                        ata-bs-dismiss={`#modal-delete-${student.student_id}`}
                        data-bs-toggle='modal'
                        data-bs-target={`#modal-delete-${student.student_id}`}
                     />
                  </div>
                  <div className='modal-body border-0'>
                     <div className='row p-2'>
                        <div className='col-12'>
                           Are your sure you're going to remove{' '}
                           {`${student.student_fname} ${student.student_lname} ${student.student_mname && student.student_mname.charAt(0) + '.'}`}
                        </div>
                     </div>
                  </div>
                  <div className='modal-footer'>
                     <div className='row w-100 justify-content-end'>
                        <div className='col-3'>
                           <span
                              className='w-100 btn btn-secondary py-2'
                              type='button'
                              data-bs-dismiss={`#modal-delete-${student.student_id}`}
                              data-bs-toggle='modal'
                              data-bs-target={`#modal-delete-${student.student_id}`}
                           >
                              Cancel
                           </span>
                        </div>

                        <div className='col-3'>
                           <button
                              className='w-100 btn btn-primary py-2'
                              type='button'
                              data-bs-dismiss={`#modal-delete-${student.student_id}`}
                              data-bs-toggle='modal'
                              data-bs-target={`#modal-delete-${student.student_id}`}
                              onClick={() => onDeleteStudent(student, classInstance.class_id)}
                           >
                              Confirm
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </td>
   );
};

export default DeleteStudentInClass;
