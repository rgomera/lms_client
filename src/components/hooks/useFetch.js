import { useState, useEffect } from 'react';

const useFetch = url => {
   const [data, setData] = useState([]);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState(null);
   const [refresh, setRefresh] = useState(false);

   const abortCont = new AbortController();

   /**
    * TODO:
    *  Put a isRefresh boolean state to be the array dependency of the useEffect
    *  UseEffect will rendered again when isRefresh changes from true to false or viceversa
    *
    */

   const fetchData = async () => {
      try {
         const response = await fetch(url, {
            headers: { token: localStorage.getItem('token') },
            signal: abortCont.signal,
         });

         if (response.status === 200) {
            const data = await response.json();
            setIsLoading(false);
            setData(data);
         } else throw Error('Cannot fetch the given resources.');
      } catch (err) {
         if (err.name === 'AbortError') console.log('fetch is aborted..');
         else {
            setError(err.message);
            setIsLoading(false);
         }
      }
   };

   useEffect(() => {
      fetchData();

      // clean up
      return () => abortCont.abort();
   }, [url, refresh]);

   return { data, setData, isLoading, error, setRefresh };
};

export default useFetch;
