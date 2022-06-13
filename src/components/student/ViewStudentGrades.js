import { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';

const ViewStudentGrades = ({ classInstance, posts, student }) => {
   const [totalMaxScore, setTotalMaxScore] = useState(0);
   const [postsSubmissions, setPostsSubmissions] = useState([]);
   const isMounted = useRef(false);

   useEffect(() => {
      setTotalMaxScore(0);
      posts.forEach(({ post }) => {
         setTotalMaxScore(prev => prev + parseInt(post.maxScore ? post.maxScore : 0));
      });
   }, [posts]);

   useEffect(() => {
      isMounted.current = true;
      if (isMounted.current && classInstance.class_id && student.student_id) {
         setPostsSubmissions([]);
         posts
            .filter(({ post }) => post.type === 'Assignment' || post.type === 'Quiz')
            .forEach(async post => {
               const submissions = await db
                  .collection('classes')
                  .doc(classInstance.class_id)
                  .collection('posts')
                  .doc(post.id)
                  .collection('submissions')
                  .where('studentId', '==', student.student_id)
                  .get();

               if (!submissions.empty) {
                  setPostsSubmissions(prev => [
                     ...prev,
                     ...submissions.docs.map(doc => ({
                        postId: post.id,
                        postMaxScore: post.post.maxScore,
                        postTitle: post.post.title,
                        postType: post.post.type,
                        id: doc.id,
                        ...doc.data(),
                     })),
                  ]);
               } else
                  setPostsSubmissions(prev => [
                     ...prev,
                     { postId: post.id, postMaxScore: post.post.maxScore, postTitle: post.post.title, postType: post.post.type, score: 0 },
                  ]);
            });
      }

      return () => {
         isMounted.current = false;
      };
   }, [classInstance.class_id, posts]);

   const getGrade = () => {
      let totalScore = 0;
      if (postsSubmissions.length > 0) {
         postsSubmissions.forEach(post => {
            totalScore += post.score ? post.score : 0;
         });
      }
      return ((totalScore / totalMaxScore) * 100).toFixed(2);
   };

   return (
      <>
         {student ? (
            <table className='table table border table-bordered'>
               <thead>
                  <tr className='bg-secondary-dark'>
                     <th>Activity</th>
                     <th>Type</th>
                     <th>Grades</th>
                  </tr>
               </thead>

               <tbody>
                  {student &&
                     postsSubmissions.length > 0 &&
                     postsSubmissions.map((post, index) => (
                        <tr key={index}>
                           <td>{post.postTitle}</td>
                           <td>{post.postType}</td>
                           <td>
                              {post.score ? post.score : 0} / {post.postMaxScore}
                           </td>
                        </tr>
                     ))}
                  <tr>
                     {postsSubmissions.length > 0 ? (
                        <>
                           <td colSpan='2' className='text-center'>
                              Over All Grade
                           </td>
                           <td className='fw-bold'>{getGrade()}%</td>
                        </>
                     ) : (
                        <td className='text-center' colSpan='3 '>
                           No Activity at the moment..
                        </td>
                     )}
                  </tr>
               </tbody>
            </table>
         ) : (
            <div>No student's grades at the moment..</div>
         )}
      </>
   );
};

export default ViewStudentGrades;
