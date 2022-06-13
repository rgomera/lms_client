import { useState } from 'react';
import { toast } from 'react-toastify';

const AddSubjectInput = ({ onSetSubjectsRefresh, onSetSubjectCountRefresh }) => {
   const [inputs, setInputs] = useState({ name: '' });
   const { name } = inputs;

   const handleInputChange = e => {
      setInputs({ ...inputs, [e.target.name]: e.target.value });
   };

   const handleSubmit = async e => {
      e.preventDefault();
      e.target.className += ' was-validated';
      try {
         const body = { name };
         const response = await fetch('/dashboard/teachers/subjects', {
            method: 'POST',
            headers: { token: localStorage.getItem('token'), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
         });
         const data = await response.json();

         if (response.status === 200) {
            e.target.classList.remove('was-validated');
            setInputs({ name: '' });

            onSetSubjectsRefresh(prev => !prev);
            onSetSubjectCountRefresh(prev => !prev);
            toast.success(data.message);
         } else toast.error(data.message);
      } catch (err) {
         console.error(err.message);
      }
   };

   return (
      <div>
         <form className='need-validation' noValidate onSubmit={handleSubmit}>
            <div className='row overflow-auto pt-4 pb-3 px-2'>
               <div className='col-md-6'>
                  <label htmlFor='name' className='form-label'>
                     Subject Name
                  </label>
                  <input className='form-control py-2' value={name} type='text' id='name' name='name' required onChange={handleInputChange} />
                  <div className='invalid-feedback my-2'>Subject name can't be empty.</div>
               </div>

               <div className='col-md-6'>
                  <label htmlFor='name' className='form-label'>
                     &nbsp;
                  </label>
                  <button className='w-100 btn btn-primary py-2' type='submit'>
                     Add
                  </button>
               </div>
            </div>
         </form>
      </div>
   );
};

export default AddSubjectInput;
