import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { db } from '../../firebase';
import ReactExport from 'react-data-export';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;

const ViewStudentGrades = ({ target, classId, className, posts, students }) => {
   const [totalMaxScore, setTotalMaxScore] = useState(0);
   const [postsSubmissions, setPostsSubmissions] = useState([]);
   const [dataSet, setDataSet] = useState([]);
   const isMounted = useRef(false);

   const getData = (id, name) => {
      const scores = [];
      if (postsSubmissions.length > 0) {
         postsSubmissions.forEach(post => {
            const studentSubmission = post
               .map(post => ({ id: post.id, studentId: post.studentId, score: post.score ? post.score : 0 }))
               .filter(post => post.studentId === id);

            scores.push({
               value: studentSubmission.length > 0 ? studentSubmission[0].score : 0,
               style: { sz: '11', alignment: { horizontal: 'center', wrapText: true } },
            });
         });
      }
      scores.unshift({ value: name, style: { sz: '11', alignment: { horizontal: 'center' }, wrapText: true } });
      scores.push({ value: `${getGrade(id)}%`, style: { sz: '11', alignment: { horizontal: 'center', wrapText: true } } });
      return scores;
   };

   const populateDataSet = () => {
      const dataSet = [
         {
            columns: posts
               .filter(({ post }) => post.type === 'Assignment' || post.type === 'Quiz')
               .map(({ post }) => ({
                  title: post.title,
                  style: { font: { sv: '13', bold: true }, alignment: { horizontal: 'center', wrapText: true } },
                  width: { wpx: 125 },
               })),
            data: students.map(student =>
               getData(
                  student.student_id,
                  `${student.student_fname} ${student.student_lname} ${student.student_mname && student.student_mname.charAt(0) + '.'}`
               )
            ),
         },
      ];

      dataSet[0].columns.unshift({
         title: 'Name',
         style: { font: { sv: '13', bold: true }, alignment: { horizontal: 'center', wrapText: true } },
         width: { wpx: 150 },
      });
      dataSet[0].columns.push({
         title: 'Over all Grade',
         style: { font: { sv: '13', bold: true }, alignment: { horizontal: 'center', wrapText: true } },
         width: { wpx: 125 },
      });
      setDataSet(dataSet);
   };

   useEffect(() => {
      setTotalMaxScore(0);
      posts.forEach(({ post }) => {
         setTotalMaxScore(prev => prev + parseInt(post.maxScore ? post.maxScore : 0));
      });
   }, [posts]);

   useEffect(() => {
      populateDataSet();
   }, [postsSubmissions]);

   useEffect(() => {
      isMounted.current = true;

      if (isMounted.current && classId) {
         setPostsSubmissions([]);
         posts.forEach(async post => {
            const submissions = await db.collection('classes').doc(classId).collection('posts').doc(post.id).collection('submissions').get();
            if (!submissions.empty) {
               setPostsSubmissions(prev => [...prev, submissions.docs.map(doc => ({ postId: post.id, id: doc.id, ...doc.data() }))]);
            }
         });
      }

      return () => {
         isMounted.current = false;
      };
   }, [classId, posts]);

   const getGrade = id => {
      let totalScore = 0;
      if (postsSubmissions.length > 0) {
         postsSubmissions.forEach(post => {
            const studentSubmission = post
               .map(post => ({ id: post.id, studentId: post.studentId, score: post.score ? post.score : 0 }))
               .filter(post => post.studentId === id);

            totalScore += studentSubmission.length > 0 ? studentSubmission[0].score : 0;
         });
      } else return '0.00';

      return ((totalScore / totalMaxScore) * 100).toFixed(2);
   };

   return (
      <>
         <Modal title='Student Grades' target={target}>
            {students.length > 0 ? (
               <table className='table table border table-bordered'>
                  <thead>
                     <tr className='bg-secondary-dark'>
                        <th>Name</th>
                        <th>Grade</th>
                     </tr>
                  </thead>

                  <tbody>
                     {students.length > 0 &&
                        students.map((student, index) => (
                           <tr key={index}>
                              <td className='fs-6'>{`${student.student_fname} ${student.student_lname} ${
                                 student.student_mname && student.student_mname.charAt(0) + '.'
                              }`}</td>
                              <td className='fs-6'>{getGrade(student.student_id)}%</td>
                           </tr>
                        ))}
                  </tbody>
               </table>
            ) : (
               <div className='text-center'>No student's grades at the moment..</div>
            )}

            <div className='d-flex justify-content-end'>
               {postsSubmissions.length > 0 && (
                  <ExcelFile filename={`${className && className} - Grades`} element={<button className='btn btn-success'>Export Data</button>}>
                     <ExcelSheet dataSet={dataSet.length > 0 && dataSet} name='Sheet 1' />
                  </ExcelFile>
               )}
            </div>
         </Modal>
      </>
   );
};

export default ViewStudentGrades;
