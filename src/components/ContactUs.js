import Header from './Header';

const ContactUs = () => {
   return (
      <div className='h-100 bg-white'>
         <Header />
         <div className='container'>
            <h1 className='text-primary font-2'>Contact Us</h1>
            <p className='mt-4 fs-5'>
               For more information about the LMS application you can email us at
               <span className='d-inline fs-5 fw-bold text-primary'> lms@gmail.com</span>
            </p>
         </div>
      </div>
   );
};

export default ContactUs;
