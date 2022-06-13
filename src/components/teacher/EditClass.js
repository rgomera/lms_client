import Modal from './Modal';
import { toast } from 'react-toastify';
import { useState } from 'react';

const EditClass = ({ target, onSetClassRefresh, classInstance, subjects }) => {
   const [inputs, setInputs] = useState({
      name: classInstance.class_name,
      subjectId: classInstance.subject_id,
      section: classInstance.class_section,
   });
   const { name, subjectId, section } = inputs;

   const handleInputChange = e => {
      setInputs({ ...inputs, [e.target.name]: e.target.value });
   };

   const handleSubmit = async e => {
      e.preventDefault();
      e.target.className += ' was-validated';
      try {
         const body = { name, subjectId, section, classId: classInstance.class_id };
         const response = await fetch('/dashboard/teachers/classes', {
            method: 'PUT',
            headers: { token: localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
         });
         const data = await response.json();

         if (response.status === 200) {
            e.target.classList.remove('was-validated');
            onSetClassRefresh(prev => !prev);
            toast.success(data.message);
         } else {
            console.log(data);
            toast.error(data.message);
         }
      } catch (err) {
         console.error(err.message);
      }
   };

   const resetState = () => {
      setInputs({
         name: classInstance.class_name,
         subjectId: classInstance.subject_id,
         section: classInstance.class_section,
      });
   };

   return (
      <Modal title='Edit Class' key={classInstance.class_id} target={target} onResetState={resetState}>
         <form className='need-validation' noValidate onSubmit={handleSubmit}>
            <div className='row overflow-auto pt-2 pb-3 px-2'>
               <div className='col-12 mb-4'>
                  <label htmlFor='name' className='form-label'>
                     Class Name
                  </label>
                  <input className='form-control py-2' value={name} type='text' id='name' name='name' required onChange={handleInputChange} />
                  <div className='invalid-feedback my-2'>Class name can't be empty.</div>
               </div>
               <div className='col-12 mb-4'>
                  <label htmlFor='subjectId' className='form-label'>
                     Subject
                  </label>
                  <select className='form-select py-2' value={subjectId} name='subjectId' id='subjectId' required onChange={handleInputChange}>
                     <option value=''>Choose Subject</option>
                     {subjects &&
                        subjects.map(subject => (
                           <option value={subject.subject_id} key={subject.subject_id}>
                              {subject.subject_name}
                           </option>
                        ))}
                  </select>
                  <div className='invalid-feedback my-2'>Choose a subject.</div>
               </div>
               <div className='col-12 mb-4'>
                  <label htmlFor='section' className='form-label'>
                     Section
                  </label>
                  <input
                     className='form-control py-2'
                     value={section}
                     type='text'
                     id='section'
                     name='section'
                     placeholder='( Optional )'
                     onChange={handleInputChange}
                  />
               </div>

               <div className='col-12'>
                  <div className='row justify-content-end'>
                     <div className='col-3'>
                        <span className='w-100 btn btn-secondary py-2' type='button' data-bs-dismiss='modal' onClick={resetState}>
                           Cancel
                        </span>
                     </div>

                     <div className='col-3'>
                        <button
                           className='w-100 btn btn-primary py-2'
                           type='submit'
                           disabled={
                              classInstance.class_name === name && classInstance.subject_id === subjectId && classInstance.class_section === section
                                 ? true
                                 : false
                           }
                        >
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

export default EditClass;
