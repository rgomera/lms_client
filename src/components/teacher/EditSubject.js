import Modal from './Modal';
import { toast } from 'react-toastify';
import { useState } from 'react';

const EditSubject = ({ target, onSetSubjectsRefresh, subject }) => {
   const [inputs, setInputs] = useState({
      name: subject.subject_name,
   });
   const { name } = inputs;

   const handleInputChange = e => {
      setInputs({ ...inputs, [e.target.name]: e.target.value });
   };

   const handleSubmit = async e => {
      e.preventDefault();
      e.target.className += ' was-validated';
      try {
         const body = { name, subjectId: subject.subject_id };
         const response = await fetch('/dashboard/teachers/subjects', {
            method: 'PUT',
            headers: { token: localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
         });
         const data = await response.json();
         if (response.status === 200) {
            e.target.classList.remove('was-validated');
            onSetSubjectsRefresh(prev => !prev);
            toast.success(data.message);
         } else toast.error(data.message);
      } catch (err) {
         console.error(err.message);
      }
   };

   const resetState = () => {
      setInputs({
         name: subject.subject_name,
      });
   };

   return (
      <Modal title='Edit Subject' key={subject.subject_id} target={target} onResetState={resetState}>
         <form className='need-validation' noValidate onSubmit={handleSubmit}>
            <div className='row overflow-auto pt-2 pb-3 px-2'>
               <div className='col-12 mb-4'>
                  <label htmlFor='name' className='form-label'>
                     Subject Name
                  </label>
                  <input className='form-control py-2' value={name} type='text' id='name' name='name' required onChange={handleInputChange} />
                  <div className='invalid-feedback my-2'>Subject name can't be empty.</div>
               </div>

               <div className='col-12'>
                  <div className='row justify-content-end'>
                     <div className='col-3'>
                        <span className='w-100 btn btn-secondary py-2' type='button' data-bs-dismiss='modal' onClick={resetState}>
                           Cancel
                        </span>
                     </div>

                     <div className='col-3'>
                        <button className='w-100 btn btn-primary py-2' type='submit' disabled={subject.subject_name === name ? true : false}>
                           Confirm
                        </button>
                     </div>
                  </div>
               </div>
            </div>
         </form>
      </Modal>
   );
};

export default EditSubject;
