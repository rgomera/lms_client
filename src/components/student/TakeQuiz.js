import RefreshIcon from '@material-ui/icons/Refresh';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import WarningIcon from '@material-ui/icons/Warning';
import { useParams } from 'react-router';
import { useEffect, useRef, useState } from 'react';
import { db } from '../../firebase';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';
import Modal from '../teacher/Modal';
import './TakeQuiz.css';
import ViewResults from '../teacher/ViewResults';

const TakeQuiz = ({ student }) => {
   const isMounted = useRef(false);
   const { classId, teacherId, postId } = useParams();

   const [post, setPost] = useState({});
   const [submission, setSubmission] = useState({});
   const [isRefresh, setIsRefresh] = useState(false);
   const [currentQuestion, setCurrentQuestion] = useState(0);
   const [isLoading, setIsloading] = useState(false);
   const [unAnsweredCount, setUnAnsweredCount] = useState(0);

   const formats = {
      lastDay: '[Yesterday at] LT',
      sameDay: '[Today at] LT',
      nextDay: '[Tomorrow at] LT',
      lastWeek: '[last] dddd [at] LT',
      nextWeek: 'dddd [at] LT',
      sameElse: 'LL',
   };

   const refresh = () => {
      setIsRefresh(!isRefresh);
   };

   const next = () => {
      if (currentQuestion < post.questions.length) setCurrentQuestion(prev => prev + 1);
   };

   const previous = () => {
      if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
   };

   const handleSelectAnswer = value => {
      // get a reference of all of the questions in the post
      // using that reference update the question by adding studentAnswer propery
      // update the post questions property of the post state
      const allQuestions = [...post.questions];
      const questionToUpdate = { ...allQuestions[currentQuestion] };

      if (questionToUpdate.type === 'MCQ' || questionToUpdate.type === 'TFQ') questionToUpdate.studentAnswer = value;
      if (questionToUpdate.type === 'MAQ') {
         if (!questionToUpdate.studentAnswer || questionToUpdate.studentAnswer.length === 0) questionToUpdate.studentAnswer = [value];
         else {
            if (questionToUpdate.studentAnswer.length > 0 && !questionToUpdate.studentAnswer.includes(value))
               questionToUpdate.studentAnswer.push(value);
            else {
               const indexToRemove = questionToUpdate.studentAnswer.indexOf(value);
               questionToUpdate.studentAnswer.splice(indexToRemove, 1);
            }
         }
      }

      allQuestions[currentQuestion] = questionToUpdate;
      setPost({ ...post, questions: allQuestions });
   };

   const handleFillBlankInputChange = (e, index) => {
      e.target.style.width = e.target.value.length + 'ch';

      // get a reference of all of the questions in the post
      // using that reference update the question by adding studentAnswer propery
      // update the post questions property of the post state
      const allQuestions = [...post.questions];
      const questionToUpdate = { ...allQuestions[currentQuestion] };

      // get the index of specific student answer element
      const studentAnswerIndex = questionToUpdate.studentAnswer.indexOf(questionToUpdate.studentAnswer.find(el => el.id === index));
      questionToUpdate.studentAnswer[studentAnswerIndex].answer = e.target.value;

      allQuestions[currentQuestion] = questionToUpdate;
      setPost({ ...post, questions: allQuestions });
   };

   const answerIsActive = (questionType, value) => {
      if (questionType === 'MCQ' || questionType === 'TFQ') return post.questions[currentQuestion].studentAnswer === value;
      if (questionType === 'MAQ' && post.questions[currentQuestion].studentAnswer) {
         return post.questions[currentQuestion].studentAnswer.includes(value);
      }
   };

   function shuffle(array) {
      let currentIndex = array.length,
         randomIndex;

      // While there remain elements to shuffle.
      while (currentIndex != 0) {
         // Pick a remaining element.
         randomIndex = Math.floor(Math.random() * currentIndex);
         currentIndex--;

         // And swap it with the current element.
         [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
      }

      return array;
   }

   const getQuestionPoints = question => {
      if (question.type === 'MCQ' || question.type === 'TFQ') {
         return question.grading;
      } else if (question.type === 'MAQ') {
         return question.grading * question.choices.length;
      } else if (question.type === 'FIBQ') {
         return question.grading * question.correctAnswer.length;
      }
   };

   const handleQuizSubmit = () => {
      let totalScore = 0;
      const questions = post.questions;
      setIsloading(true);
      const submissionCollectionRef = db.collection('classes').doc(classId).collection('posts').doc(postId).collection('submissions');

      questions.forEach(question => {
         let score = 0;

         if (question.type === 'MCQ' || question.type === 'TFQ') {
            // check if studentAnswer equal correctAnswer
            // add studentScore property for the question
            if (question.correctAnswer === question.studentAnswer) {
               score = question.grading;
               totalScore += score;
            }
            question.studentScore = score;
            console.log('questionType = ', question.type);
            console.log('score = ', score);
            console.log('totalScore = ', totalScore);
         } else if (question.type === 'MAQ') {
            // initial value of score as theh maximum score for this question
            // check if choice is exist in correctAnswer and studentAnswer, then if not decrement score

            let mistake = false;
            question.choices.forEach(choice => {
               // add score if choice is an correct answer and its the anseer of the student
               if (question.correctAnswer.includes(choice) && question.studentAnswer.includes(choice)) score += question.grading;
               // add score if choice is not correct answer and its not the answer of the student
               if (!question.correctAnswer.includes(choice) && !question.studentAnswer.includes(choice)) score += question.grading;
               if (!question.correctAnswer.includes(choice) && question.studentAnswer.includes(choice)) mistake = true;
            });

            // if no mistake set score as the maximum score for the question
            if (!mistake) score = question.choices.length * question.grading;

            totalScore += score;
            question.studentScore = score;
            console.log('mistake = ', mistake);
            console.log('questionType = ', question.type);
            console.log('score = ', score);
            console.log('totalScore = ', totalScore);
         } else if (question.type === 'FIBQ') {
            // check if studentAnswer equal correctAnswer, iterate over correctAnswer
            // add studentScore property for the question
            question.correctAnswer.forEach(correctAns => {
               const studentAnswer = question.studentAnswer.find(studentAns => studentAns.id === correctAns.id).answer;
               if (correctAns.answer === studentAnswer) {
                  score += question.grading;
               }
            });
            totalScore += score;
            question.studentScore = score;
            console.log('questionType = ', question.type);
            console.log('score = ', score);
            console.log('totalScore = ', totalScore);
         }
      });

      submissionCollectionRef
         .add({
            studentId: student.student_id,
            displayName: `${student.student_fname} ${student.student_lname} ${student.student_mname && student.student_mname.charAt(0) + '.'}`,
            submittedAt: new Date(),
            questions,
            score: totalScore,
         })
         .then(() => {
            toast.success('Finished quiz.');
            setIsloading(false);
         });
   };

   const handleSetUnansweredCount = () => {
      let count = 0;
      post.questions.forEach(question => {
         if ((question.type === 'MCQ' || question.type === 'TFQ') && !question.studentAnswer) ++count;
         if (question.type === 'MAQ' && (!question.studentAnswer || question.studentAnswer.length === 0)) ++count;
         if (question.type === 'FIBQ' && question.studentAnswer.find(el => el.answer === '')) ++count;
      });
      setUnAnsweredCount(count);
   };
   useEffect(() => {
      isMounted.current = true;
      db.collection('classes')
         .doc(classId)
         .collection('posts')
         .doc(postId)
         .onSnapshot(
            snapshot => {
               if (isMounted.current) {
                  let quiz = { ...snapshot.data() };

                  if (quiz.isRandomizeQuestion) quiz = { ...quiz, questions: shuffle(quiz.questions) };
                  if (quiz.isRandomizeChoices)
                     quiz = {
                        ...quiz,
                        questions: quiz.questions.map(q => {
                           if (q.type === 'MCQ' || q.type === 'TFQ' || q.type === 'MAQ') return { ...q, choices: shuffle(q.choices) };
                           else return q;
                        }),
                     };

                  setPost({
                     id: snapshot.id,
                     ...quiz,
                     questions: quiz.questions.map(q => {
                        if (q.type === 'FIBQ') return { ...q, studentAnswer: q.correctAnswer.map(el => ({ id: el.id, answer: '' })) };
                        else return q;
                     }),
                  });
               }
            },
            err => console.error(err)
         );

      // cleanup function
      return () => {
         isMounted.current = false;
      };
   }, [isRefresh]);

   useEffect(() => {
      isMounted.current = true;
      db.collection('classes')
         .doc(classId)
         .collection('posts')
         .doc(postId)
         .collection('submissions')
         .where('studentId', '==', student.student_id)
         .onSnapshot(
            snapshot => {
               if (isMounted.current) {
                  setSubmission(...snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
               }
            },
            err => console.error(err)
         );

      // cleanup function
      return () => {
         isMounted.current = false;
      };
   }, [isRefresh]);

   return (
      <div className='overflow-auto' style={{ height: '600px' }}>
         <div className='d-flex'>
            <Link to={`/student/classes/${classId}/${teacherId}`} className='d-flex justify-content-center btn btn-primary p-0'>
               <ArrowForwardIosIcon className='classPage__icon' style={{ transform: 'rotate(-180deg)' }} />
            </Link>
            <button title='Refresh' type='button' className='d-flex justify-content-center btn btn-primary ms-2 p-0' onClick={refresh}>
               <RefreshIcon className='classPage__icon' />
            </button>
         </div>

         <div className='row py-3 my-5 mx-3 px-2 shadow' style={{ backgroundColor: '#fff' }}>
            {!isLoading ? (
               <>
                  <div className={`${!submission ? 'col' : 'col-lg-6'}`}>
                     <small className='text-secondary-light me-3'>
                        {post.timestamp && moment(post.timestamp.toDate()).calendar(formats)}
                        {post.dueDate && <span className='mx-2'>|</span>}
                        {post.dueDate && 'Due ' + moment(post.dueDate.toDate()).calendar(formats)}
                     </small>
                     <span className='badge bg-primary me-2 post__title'>{post.title}</span>
                     <span className={`badge bg-secondary-dark me-2 post__type`}>{post.type}</span>
                     <span className='me-2 badge bg-warning post__maxScore'>
                        {post.maxScore} {post.maxScore > 1 ? 'pts' : 'pt'}
                     </span>
                     <div className='mt-3'>{post.body}</div>
                  </div>

                  {!submission ? (
                     <div className='mt-4 mb-3'>
                        {post && post.questions && post.questions.length > 0 ? (
                           <div>
                              {/* question header */}
                              <div className='fs-5 text-end'>
                                 <div>
                                    Question: {currentQuestion + 1} / {post.questions.length}
                                 </div>
                                 <div className='text-secondary'>{`${getQuestionPoints(post.questions[currentQuestion])} ${
                                    getQuestionPoints(post.questions[currentQuestion]) > 1 ? 'points' : 'point'
                                 }`}</div>
                              </div>

                              <div className='fs-5 mt-2 py-3'>
                                 {post.questions[currentQuestion].type !== 'FIBQ' && post.questions[currentQuestion].text}
                              </div>

                              {/* question choices/anwer fields */}
                              <div className='mt-2'>
                                 {/* MCQ, TFQ, MAQ */}
                                 {(post.questions[currentQuestion].type === 'MCQ' ||
                                    post.questions[currentQuestion].type === 'TFQ' ||
                                    post.questions[currentQuestion].type === 'MAQ') &&
                                    post.questions[currentQuestion].choices.map((c, index) => (
                                       <div className='my-2' key={index}>
                                          <div
                                             className={`fs-6 p-3 cursor-pointer rounded border border-2 question-choices ${
                                                answerIsActive(post.questions[currentQuestion].type, c) ? 'active' : ''
                                             }`}
                                             onClick={() => handleSelectAnswer(c)}
                                          >
                                             {c}
                                          </div>
                                       </div>
                                    ))}

                                 <div className='my-3 d-flex align-items-center flex-wrap'>
                                    {post.questions[currentQuestion].type === 'FIBQ' &&
                                       post.questions[currentQuestion].text
                                          .replace(/\_+/g, '_')
                                          .split(/(_)/g)
                                          .map((str, index) =>
                                             str !== '_' ? (
                                                <span className='fs-6' key={index}>
                                                   {str}
                                                </span>
                                             ) : (
                                                <input
                                                   value={
                                                      post.questions[currentQuestion].studentAnswer &&
                                                      post.questions[currentQuestion].studentAnswer.find(el => el.id === index).answer
                                                   }
                                                   className='fs-6 form-control fill-blank-input mx-1'
                                                   key={index}
                                                   type='text'
                                                   placeholder='Answer'
                                                   onChange={e => handleFillBlankInputChange(e, index)}
                                                />
                                             )
                                          )}
                                 </div>
                              </div>

                              <div className='d-flex justify-content-end'>
                                 {currentQuestion > 0 && (
                                    <button className='btn btn-link-primary align-self-end' onClick={previous}>
                                       Previous
                                    </button>
                                 )}

                                 {currentQuestion < post.questions.length - 1 ? (
                                    <button className='btn btn-primary ms-3 align-self-end' onClick={next}>
                                       Next
                                    </button>
                                 ) : (
                                    <button
                                       className='btn btn-primary ms-3 align-self-end'
                                       data-bs-toggle='modal'
                                       data-bs-target='#modal-confirm-submit'
                                       onClick={handleSetUnansweredCount}
                                    >
                                       Submit
                                    </button>
                                 )}
                              </div>
                           </div>
                        ) : (
                           <span className='text-center'>No questions at the moment..</span>
                        )}
                     </div>
                  ) : (
                     <div className='col-lg-6'>
                        {submission && (
                           <div className='mt-4 mt-lg-0'>
                              <span className='badge bg-success submission me-2'>Turn In</span>
                              {moment(submission.submittedAt && submission.submittedAt.toDate()).isAfter(post.dueDate && post.dueDate.toDate()) ? (
                                 <span className='badge bg-danger submission'>Late</span>
                              ) : (
                                 ''
                              )}
                              <div className='border p-3 my-3 text-center fs-3 fw-bold'>
                                 {submission.score > 1 ? `${submission.score} points` : `${submission.score} point`}
                              </div>

                              {post.isQuizResultsViewable && (
                                 <div className='d-flex justify-content-end'>
                                    <button className='btn btn-primary ms-auto' data-bs-toggle='modal' data-bs-target='#modal-view-results'>
                                       View Results
                                    </button>
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  )}
               </>
            ) : (
               <div className='text-center my-5'>
                  <div className='spinner__medium spinner-border text-primary'></div>
               </div>
            )}
         </div>

         <Modal title='Confirmation Message' target='modal-confirm-submit'>
            <div>
               <p>Are you sure you're going to submit your quiz. Once you submit, you will no longer be able to change your answers.</p>
               {unAnsweredCount > 0 && (
                  <div className='p-3 d-flex justify-content-center align-items-end my-4 border rouded'>
                     <WarningIcon className='text-warning fs-4 me-2' />
                     <p className='m-0'>
                        You have {unAnsweredCount} unanswered question{unAnsweredCount > 1 ? 's.' : '.'}
                     </p>
                  </div>
               )}

               <div className='d-flex justify-content-end'>
                  <button className='btn btn-secondary me-2' data-bs-dismiss='modal'>
                     Cancel
                  </button>
                  <button className='btn btn-primary' data-bs-dismiss='modal' onClick={() => handleQuizSubmit()}>
                     Confirm
                  </button>
               </div>
            </div>
         </Modal>

         {submission && <ViewResults submission={submission} target='modal-view-results' getQuestionPoints={getQuestionPoints} />}
      </div>
   );
};

export default TakeQuiz;
