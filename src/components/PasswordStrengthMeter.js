import { useState, useEffect, useRef } from 'react';

const PasswordStrengthMeter = ({ password }) => {
   const [result, setResult] = useState('');
   const isMounted = useRef(false);
   // const percent = (testResult.score * 100) / ;

   const getPercent = score => {
      return (score * 100) / 5;
   };

   const getScore = password => {
      return new Promise((resolve, reject) => {
         let score = 0;

         // At least one upper case English letter
         if (/(?=.*?[A-Z])/.test(password)) score++;
         // At least one lower case English letter
         if (/(?=.*?[a-z])/.test(password)) score++;
         // At least one digit
         if (/(?=.*?[0-9])/.test(password)) score++;
         // At least one special character
         if (/(?=.*?[#?!@$%^&*-])/.test(password)) score++;
         // Minimum 8 in length
         if (password.length >= 8) score++;

         resolve(score);
      });
   };

   useEffect(async () => {
      isMounted.current = true;

      if (password && isMounted.current) {
         setResult(0);
         const score = await getScore(password);
         setResult(score);
      } else if (!password) setResult(0);

      // cleanup function
      return () => {
         isMounted.current = false;
      };
   }, [password]);

   const getColor = () => {
      switch (result) {
         case 1:
            return '#828282';
         case 2:
            return '#ef5350';
         case 3:
            return '#FFAD00';
         case 4:
            return '#9bc158';
         case 5:
            return '#00b500';
         default:
            return 'none';
      }
   };

   const getLabel = () => {
      switch (result) {
         case 1:
            return 'Very weak';
         case 2:
            return 'Weak';
         case 3:
            return 'Fair';
         case 4:
            return 'Good';
         case 5:
            return 'Strong';
         default:
            return '';
      }
   };

   const progress = () => ({
      width: `${getPercent(result)}%`,
      backgroundColor: getColor(),
   });

   return (
      <div className='text-end'>
         <div className='rounded-0 progress' style={{ height: '7px' }}>
            <div className='progress-bar' style={progress()}></div>
         </div>
         <small style={{ color: getColor() }}>{getLabel()}</small>
      </div>
   );
};

export default PasswordStrengthMeter;
