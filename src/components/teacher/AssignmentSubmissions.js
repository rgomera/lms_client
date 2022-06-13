import { useParams } from 'react-router';
import RefreshIcon from '@material-ui/icons/Refresh';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { db } from '../../firebase';
import { useEffect, useState, Fragment } from 'react';
import Submissions from './Submissions';
import ScoreStudent from './ScoreStudent';

const AssignmentSubmissions = () => {
   const { classId, postId } = useParams();
   const { data: students } = useFetch(`/dashboard/teachers/students/${classId}`);
   const [studentSubmissions, setStudentSubmissions] = useState([]);
   const [isRefresh, setIsRefresh] = useState(false);

   useEffect(() => {
      if (students.length > 0) {
         db.collection('classes')
            .doc(classId)
            .collection('posts')
            .doc(postId)
            .collection('submissions')
            .onSnapshot(
               snapshot => {
                  if (!snapshot.empty) {
                     setStudentSubmissions(
                        snapshot.docs.map(doc => ({
                           id: doc.id,
                           ...doc.data(),
                        }))
                     );
                  } else setStudentSubmissions([]);
               },
               err => console.error(err)
            );
      }
   }, [isRefresh, students]);

   const refresh = () => {
      setIsRefresh(!isRefresh);
      setStudentSubmissions([]);
   };

   return (
      <div>
         <div className='d-flex'>
            <Link to={`/teacher/manage/classes/${classId}`} className='d-flex justify-content-center btn btn-primary p-0'>
               <ArrowForwardIosIcon className='classPage__icon' style={{ transform: 'rotate(-180deg)' }} />
            </Link>
            <button type='button' className='d-flex justify-content-center btn btn-primary ms-2 p-0' onClick={refresh}>
               <RefreshIcon className='classPage__icon' />
            </button>
         </div>

         <div className='mt-4 px-2 table-responsive'>
            {students.length > 0 ? (
               <table className='table border table-bordered'>
                  <thead>
                     <tr className='bg-secondary-dark'>
                        <th>Name</th>
                        <th>Submissions</th>
                        <th>Submitted</th>
                        <th>Score</th>
                        <th>Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {students.map(student => (
                        <Fragment key={`${classId}-${postId}-${student.student_id}`}>
                           <Submissions
                              classId={classId}
                              postId={postId}
                              studentId={student.student_id}
                              studentName={`${student.student_fname} ${student.student_lname} ${
                                 student.student_mname && student.student_mname.charAt(0) + '.'
                              }`}
                              studentSubmissions={studentSubmissions}
                              scoreStudentModal={`modal-${classId}-${postId}-${student.student_id}`}
                           />

                           <ScoreStudent
                              target={`modal-${classId}-${postId}-${student.student_id}`}
                              classId={classId}
                              postId={postId}
                              studentId={student.student_id}
                              studentName={`${student.student_fname} ${student.student_lname} ${
                                 student.student_mname && student.student_mname.charAt(0) + '.'
                              }`}
                           />
                        </Fragment>
                     ))}
                  </tbody>
               </table>
            ) : (
               <span>No students at the moment..</span>
            )}
         </div>
      </div>
   );
};

export default AssignmentSubmissions;
