import { useState, useEffect } from 'react';
import Modal from './Modal';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

const ScoreStudent = ({ target, classId, postId, studentId, studentName }) => {
   const [score, setScore] = useState('');
   const [post, setPost] = useState([]);

   useEffect(() => {
      db.collection('classes')
         .doc(classId)
         .collection('posts')
         .doc(postId)
         .onSnapshot(
            snapshot => {
               if (snapshot.exists) {
                  setPost({ id: snapshot.id, ...snapshot.data() });
               }
            },
            err => console.error(err)
         );
   }, []);

   const handleSubmit = e => {
      e.preventDefault();
      if (score <= parseInt(post.maxScore)) {
         db.collection('classes')
            .doc(classId)
            .collection('posts')
            .doc(postId)
            .collection('submissions')
            .where('studentId', '==', studentId)
            .get()
            .then(snapshot => {
               if (!snapshot.empty) {
                  snapshot.docs.forEach(async doc => {
                     const docRef = db.collection('classes').doc(classId).collection('posts').doc(postId).collection('submissions').doc(doc.id);
                     await docRef.update({ score });

                     setScore('');
                     toast.success(`${studentName} has been scored.`);
                  });
               }
            })
            .catch(err => console.error(err));
      } else {
         setScore('');
         toast.error('Score must be less than or equal to maximum score!', { onClose: 3000 });
      }
   };

   return (
      <tr className='p-0 border-0'>
         <td className='p-0 border-0'>
            <Modal title={`${studentName}'s score  `} target={target} onResetState={() => setScore('')}>
               <form className='row align-items-center' onSubmit={handleSubmit}>
                  <div className='col-10 mb-4'>
                     <input
                        className='form-control py-2'
                        value={score}
                        type='number'
                        min='0'
                        onChange={e => setScore(parseInt(e.target.value))}
                        placeholder='e.g. 10, 50, 100'
                     />
                  </div>
                  <div className='col-1 fs-5 fw-bold mb-4'>/</div>
                  <div className='col-1 p-0 fs-5 fw-bold mb-4'>{post.maxScore}</div>
                  <div className='col-12'>
                     <div className='row justify-content-end'>
                        <div className='col-3'>
                           {score > 0 && (
                              <span className='w-100 btn btn-secondary py-2' type='button' onClick={() => setScore('')}>
                                 Cancel
                              </span>
                           )}
                        </div>

                        <div className='col-3'>
                           <button className='w-100 btn btn-primary py-2' type='submit' disabled={!score && true} data-bs-dismiss='modal'>
                              Confirm
                           </button>
                        </div>
                     </div>
                  </div>
               </form>
            </Modal>
         </td>
      </tr>
   );
};

export default ScoreStudent;
