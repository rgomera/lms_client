import Modal from './Modal';
import { useState } from 'react';
import './ViewResults.css';

const ViewResults = ({ submission, target, getQuestionPoints }) => {
   const [currentQuestion, setCurrentQuestion] = useState(0);
   const { questions } = submission;

   const next = () => {
      if (currentQuestion < submission.questions.length) setCurrentQuestion(prev => prev + 1);
   };

   const previous = () => {
      if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
   };

   const correctAnswerIdentifier = () => {
      return <div className='bg-success me-2' style={{ width: '12px', height: '12px' }}></div>;
   };
   const wrongAnswerIdentifier = () => {
      return <div className='bg-primary me-2' style={{ width: '12px', height: '12px' }}></div>;
   };
   const yourAnswerIdentifier = () => {
      return <div className='bg-secondary-dark me-2' style={{ width: '12px', height: '12px', borderRadius: '50%' }}></div>;
   };

   const isYourAnswer = (question, choice) => {
      if (question.type === 'MCQ' || question.type === 'TFQ') return choice === question.studentAnswer;
      if (question.type === 'MAQ') return question.studentAnswer.includes(choice);
   };
   const isCorrectAnswer = (question, choice, index) => {
      if (question.type === 'MCQ' || question.type === 'TFQ') return choice === question.correctAnswer;
      if (question.type === 'MAQ') {
         if (
            (question.correctAnswer.includes(choice) && question.studentAnswer.includes(choice)) ||
            (!question.correctAnswer.includes(choice) && !question.studentAnswer.includes(choice))
         )
            return true;
         else return false;
      }
      if (question.type === 'FIBQ') {
         const correctAnswer = question.correctAnswer.find(el => el.id === index).answer;
         const studentAnswer = question.studentAnswer.find(el => el.id === index).answer;
         return correctAnswer === studentAnswer;
      }
   };

   return (
      <Modal title='Quiz Results' target={target}>
         <div className='d-flex justify-content-center mb-3'>
            <div className='d-flex align-items-center'>
               {correctAnswerIdentifier()}
               <div>Correct Answer</div>
            </div>
            <div className='d-flex align-items-center mx-4'>
               {wrongAnswerIdentifier()}
               <div>Wrong Answer</div>
            </div>
            <div className='d-flex align-items-center'>
               {yourAnswerIdentifier()}
               <div>Your Answer</div>
            </div>
         </div>
         {submission && submission.questions && (
            <div>
               <div className='text-end'>
                  <div>
                     Question: {currentQuestion + 1} / {questions.length}
                  </div>
                  <div className='text-secondary'>{`${questions[currentQuestion].studentScore} / ${getQuestionPoints(questions[currentQuestion])} ${
                     getQuestionPoints(questions[currentQuestion]) > 1 ? 'points' : 'point'
                  }`}</div>
               </div>

               {questions[currentQuestion].type !== 'FIBQ' && <div className='mt-2 py-3'>{questions[currentQuestion].text}</div>}

               {/* question choices/anwer fields */}
               <div className='mt-2'>
                  {/* MCQ, TFQ, MAQ */}
                  {(questions[currentQuestion].type === 'MCQ' ||
                     questions[currentQuestion].type === 'TFQ' ||
                     questions[currentQuestion].type === 'MAQ') &&
                     questions[currentQuestion].choices.map((c, index) => (
                        <div className='d-flex justify-content-between my-2 align-items-center' key={index}>
                           <div
                              className={`p-3 rounded border border-2 ${
                                 isCorrectAnswer(questions[currentQuestion], c, null) ? 'correctAnswer' : 'wrongAnswer'
                              }`}
                              style={{ width: '92%' }}
                           >
                              {c}
                           </div>
                           {isYourAnswer(questions[currentQuestion], c) ? yourAnswerIdentifier() : ''}
                        </div>
                     ))}

                  <div className='my-3 d-flex align-items-center flex-wrap '>
                     {questions[currentQuestion].type === 'FIBQ' &&
                        questions[currentQuestion].text
                           .replace(/\_+/g, '_')
                           .split(/(_)/g)
                           .map((str, index) =>
                              str !== '_' ? (
                                 <div key={`FIBQ-${index}`} className='fibqText'>
                                    {str}
                                 </div>
                              ) : (
                                 <div key={`FIBQ-${index}`} className='d-flex flex-column fibqAnswer'>
                                    <span
                                       className={`p-2 border rounded mx-1 fibqYourAnswer ${
                                          isCorrectAnswer(questions[currentQuestion], null, index) ? 'correctAnswer' : 'wrongAnswer'
                                       }`}
                                    >
                                       {questions[currentQuestion].studentAnswer.find(el => el.id === index).answer}
                                    </span>
                                    {!isCorrectAnswer(questions[currentQuestion], null, index) && (
                                       <span className='px-2 fibqCorrectAnswer'>
                                          {questions[currentQuestion].correctAnswer.find(el => el.id === index).answer}
                                       </span>
                                    )}
                                 </div>
                              )
                           )}
                  </div>

                  <div className='d-flex justify-content-end'>
                     {currentQuestion > 0 && (
                        <button className='btn btn-link-primary align-self-end' onClick={previous}>
                           Previous
                        </button>
                     )}

                     {currentQuestion < submission.questions.length - 1 ? (
                        <button className='btn btn-primary ms-3 align-self-end' onClick={next}>
                           Next
                        </button>
                     ) : (
                        <button className='btn btn-primary ms-3 align-self-end' data-bs-dismiss='modal' onClick={() => setCurrentQuestion(0)}>
                           Close
                        </button>
                     )}
                  </div>
               </div>
            </div>
         )}
      </Modal>
   );
};

export default ViewResults;
