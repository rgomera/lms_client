import { useEffect, useState } from 'react';
import AttachmentIcon from '@material-ui/icons/Attachment';
import RateReviewIcon from '@material-ui/icons/RateReview';
import { db, storage } from '../../firebase';
import moment from 'moment';
import './ClassPost.css';
import './Submissions.css';
import ViewResults from './ViewResults';
import { toast } from 'react-toastify';
import Modal from './Modal';

const Submissions = ({ studentId, classId, postId, studentName, studentSubmissions, scoreStudentModal }) => {
   const [submission, setSubmission] = useState([]);
   const [post, setPost] = useState('');

   useEffect(() => {
      setSubmission(...studentSubmissions.filter(submission => submission.studentId === studentId));
   }, [studentSubmissions]);

   useEffect(() => {
      db.collection('classes')
         .doc(classId)
         .collection('posts')
         .doc(postId)
         .onSnapshot(
            doc => {
               if (doc.exists) setPost({ id: doc.id, ...doc.data() });
            },
            err => console.error(err.message)
         );
   }, [postId]);

   const getQuestionPoints = question => {
      if (question.type === 'MCQ' || question.type === 'TFQ') {
         return question.grading;
      } else if (question.type === 'MAQ') {
         return question.grading * question.choices.length;
      } else if (question.type === 'FIBQ') {
         return question.grading * question.correctAnswer.length;
      }
   };

   const returnAssignment = docId => {
      db.collection('classes')
         .doc(classId)
         .collection('posts')
         .doc(postId)
         .collection('submissions')
         .doc(docId)
         .update({ isResubmit: true, score: '' })
         .then(() => {
            toast.success('Return assignment successfully!');
         })
         .catch(err => console.error(err));
   };

   const retakeQuiz = (docId, name) => {
      db.collection('classes')
         .doc(classId)
         .collection('posts')
         .doc(postId)
         .collection('submissions')
         .doc(docId)
         .delete()
         .then(() => {
            toast.success(`${name} can now retake the quiz.`);
         })
         .catch(err => console.error(err));
   };

   return (
      <tr>
         <td className='submissionsColumn'>{studentName}</td>
         <td className='submissionsColumn d-flex flex-wrap'>
            {submission &&
               submission.urls &&
               !submission.isResubmit &&
               submission.urls.map((url, index) => (
                  <div key={index} className='m-2'>
                     <a title={storage.refFromURL(url).name} className='fileUploads__link' target='_blank' href={url} rel='noopener noreferrer'>
                        <AttachmentIcon className='fileUploads__icon  me-1' />
                        {storage.refFromURL(url).name}
                     </a>
                  </div>
               ))}

            {submission && post.type === 'Quiz' && (
               <>
                  <button className='btn btn-secondary' data-bs-toggle='modal' data-bs-target={`#modal-view-results-${studentId}`}>
                     View Results
                  </button>

                  <ViewResults submission={submission} getQuestionPoints={getQuestionPoints} target={`modal-view-results-${studentId}`} />
               </>
            )}
         </td>
         <td className='submissionsColumn'>
            {!submission || submission.isResubmit ? (
               <span className='badge bg-danger ms-2'>No</span>
            ) : (
               <>
                  <span className='badge bg-success ms-2'>Yes</span>
                  {moment(submission.submittedAt && submission.submittedAt.toDate()).isAfter(post.dueDate && post.dueDate.toDate()) ? (
                     <span className='badge bg-danger ms-2 '>Late</span>
                  ) : (
                     ''
                  )}
               </>
            )}
         </td>
         <td className='submissionsColumn'>
            {submission?.score && `${submission.score > 1 ? `${submission.score} points` : `${submission.score} point`}`}
         </td>
         <td className='d-flex flex-column'>
            {submission && !submission.score && !submission.isResubmit && (
               <button className='btn btn-secondary my-1' data-bs-toggle='modal' data-bs-target={`#${scoreStudentModal}`}>
                  Score Now
               </button>
            )}
            {submission && !submission.isResubmit && post.type !== 'Quiz' && (
               <button
                  className='btn btn-primary my-1'
                  data-bs-toggle='modal'
                  data-bs-target={`#modal-confirm-return-${submission && submission.id}`}
               >
                  Return
               </button>
            )}
            {submission && post.type === 'Quiz' && (
               <button
                  className='btn btn-primary my-1'
                  data-bs-toggle='modal'
                  data-bs-target={`#modal-confirm-retakeQuiz-${submission && submission.id}`}
               >
                  Retake Quiz
               </button>
            )}

            {/* return confirmation modal */}
            <Modal title='Confirmation Message' target={`modal-confirm-return-${submission && submission.id}`}>
               <div>
                  <p>
                     Are you sure you want to return this assignment? Returning this assignment will clear the grade related with this assignment if
                     there is one.
                  </p>
                  <div className='d-flex justify-content-end'>
                     <button className='btn btn-secondary me-2' data-bs-dismiss='modal'>
                        Cancel
                     </button>
                     <button className='btn btn-primary' data-bs-dismiss='modal' onClick={() => returnAssignment(submission && submission.id)}>
                        Confirm
                     </button>
                  </div>
               </div>
            </Modal>

            {/* retake quiz confirmation modal */}
            <Modal title='Confirmation Message' target={`modal-confirm-retakeQuiz-${submission && submission.id}`}>
               <div>
                  <p>You are going to delete the quiz attemp for this student. Are you sure you want to allow this student to retake the quiz?</p>
                  <div className='d-flex justify-content-end'>
                     <button className='btn btn-secondary me-2' data-bs-dismiss='modal'>
                        Cancel
                     </button>
                     <button className='btn btn-primary' data-bs-dismiss='modal' onClick={() => retakeQuiz(submission && submission.id, studentName)}>
                        Confirm
                     </button>
                  </div>
               </div>
            </Modal>
         </td>
      </tr>
   );
};

export default Submissions;
