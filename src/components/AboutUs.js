import Header from './Header';

const AboutUs = () => {
   return (
      <div className='h-100 bg-white'>
         <Header />
         <div className='container'>
            <h1 className='text-primary font-2'>About Us</h1>
            <p className='mt-4 fs-5'>
               This "LMS" or known as "Learning Management System" was created by college of computer studies students specialized in learning
               technology namely <span className='d-inline fs-5 fw-bold text-primary'>Rey Mond Gomera</span> as programmer,
               <span className='d-inline fs-5 fw-bold text-primary'> Jann Patricia Orine</span> and
               <span className='d-inline fs-5 fw-bold text-primary'> Danele Shanella Neneria</span> as Designers and
               <span className='d-inline fs-5 fw-bold text-primary'> Ryan Christian</span> as tester.
            </p>
         </div>
      </div>
   );
};

export default AboutUs;
