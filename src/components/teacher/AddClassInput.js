import React, { useState } from 'react';
import useFetch from '../hooks/useFetch';
import { toast } from 'react-toastify';

const AddClassInput = ({ teacher, onSetClassRefresh, onSetClassCountRefresh }) => {
   const [inputs, setInputs] = useState({ name: '', subjectId: '', section: '' });
   const { data: subjects } = useFetch('/dashboard/teachers/subjects');
   const { name, subjectId, section } = inputs;

   const handleInputChange = e => {
      setInputs({ ...inputs, [e.target.name]: e.target.value });
   };

   const handleSubmit = async e => {
      e.preventDefault();
      e.target.className += ' was-validated';
      try {
         const body = { name, subjectId, section };
         const response = await fetch(`/dashboard/teachers/classes`, {
            method: 'POST',
            headers: { token: localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
         });
         const data = await response.json();

         if (response.status === 200) {
            e.target.classList.remove('was-validated');
            setInputs({ name: '', subjectId: '', section: '' });

            onSetClassRefresh(prev => !prev);
            onSetClassCountRefresh(prev => !prev);
            toast.success(data.message);

            // add class code
            await fetch('/dashboard/teachers/classcodes', {
               method: 'POST',
               headers: { token: localStorage.getItem('token'), 'Content-Type': 'application/json' },
               body: JSON.stringify({ classId: data.class.class_id }),
            });
         } else toast.error(data.message);
      } catch (err) {
         console.error(err);
      }
   };

   return (
      <div>
         <form className='need-validation' noValidate onSubmit={handleSubmit}>
            <div className='row overflow-auto pt-4 pb-3 px-2'>
               <div className='col-md-6 col-lg-4 mb-4'>
                  <label htmlFor='name' className='form-label'>
                     Class Name
                  </label>
                  <input className='form-control py-2' value={name} type='text' id='name' name='name' required onChange={handleInputChange} />
                  <div className='invalid-feedback my-2'>Class name can't be empty.</div>
               </div>
               <div className='col-md-6 col-lg-4 mb-4'>
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
               <div className='col-md-6 col-lg-4 mb-4'>
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

               <div className='col-md-12'>
                  <button className='w-100 btn btn-primary py-2' type='submit'>
                     Add
                  </button>
               </div>
            </div>
         </form>
      </div>
   );
};

export default AddClassInput;
