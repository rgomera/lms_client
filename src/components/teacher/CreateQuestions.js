import { useState } from 'react';
import { FileCopy, Remove, Add, Delete, Close, ArrowForwardIos } from '@material-ui/icons';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SearchQuestionBank from './SearchQuestionBank';
import './CreateQuestions.css';
import { toast } from 'react-toastify';
import { db } from '../../firebase';
import Modal from './Modal';

const CreateQuestions = ({ teacher, questionsFromBank, questions, setQuestions, getTotalScore, categories }) => {
   const [category, setCategory] = useState('');
   const [editCategory, setEditCategory] = useState('');
   const [categoryResults, setCategoryResults] = useState([]);
   const [currentQuestion, setCurrentQuestion] = useState(0);

   const [searchTerm, setSearchTerm] = useState('');
   const [searchResults, setSearchResults] = useState([]);

   function titleCase(str) {
      var splitStr = str.toLowerCase().split(' ');
      for (var i = 0; i < splitStr.length; i++) {
         splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
      }
      return splitStr.join(' ');
   }

   const handleCategoryChange = e => {
      setCategory(titleCase(e.target.value));
      if (e.target.value) {
         if (categories.filter(category => category.name.toLowerCase().includes(e.target.value.toLowerCase())).length > 0) {
            setCategoryResults(categories.filter(category => category.name.toLowerCase().includes(e.target.value.toLowerCase())));
         } else setCategoryResults([{ id: 0, name: 'Add Category' }]);
      } else {
         setCategoryResults([]);
         setEditCategory('');
      }
   };

   const handleSelectedCategory = categoryId => {
      const allQuestions = [...questions];
      const questionToUpdate = { ...allQuestions[currentQuestion] };
      questionToUpdate.category = categoryId;

      allQuestions[currentQuestion] = questionToUpdate;
      setQuestions(allQuestions);
      setCategoryResults([]);
      setCategory('');
   };

   const handleCategoryOptions = async (categoryId, name, type) => {
      try {
         if (type === 'add') {
            const newCategory = await db.collection('questionCategory').add({ name: category.trim(), teacherId: teacher.teacher_id });
            toast.success('Question category added successfully.');
            handleSelectedCategory(newCategory.id);
         } else if (type === 'edit') {
            const categoryDoc = await db.collection('questionCategory').where('name', '==', editCategory).get();

            if (categoryDoc.empty) {
               db.collection('questionCategory').doc(categoryId).update({ name: editCategory });

               setCategory('');
               setCategoryResults([]);
               toast.success('Question ctegory updated successfully!');
            } else toast.error('Question category already exist!');
         } else if (type === 'delete') {
            await db.collection('questionCategory').doc(categoryId).delete();

            setCategory('');
            setCategoryResults([]);
            toast.success('Question category deleted successfully!');
         }
      } catch (err) {
         console.error(err);
      }
   };

   const handleClearCategory = () => {
      const allQuestions = [...questions];
      const questionToUpdate = { ...allQuestions[currentQuestion] };
      questionToUpdate.category = '';

      allQuestions[currentQuestion] = questionToUpdate;
      setQuestions(allQuestions);
      setCategoryResults([]);
      setCategory('');
   };

   const addQuestion = () => {
      setQuestions(prev => [
         ...prev,
         {
            type: 'MCQ',
            text: '',
            category: '',
            choices: ['', ''],
            correctAnswer: '',
            grading: 1,
         },
      ]);
      toast.success('Created new question successfully.');
   };

   const removeQuestion = () => {
      const allQuestions = [...questions];
      allQuestions.splice(currentQuestion, 1);
      setQuestions(allQuestions);

      if (currentQuestion >= 1) setCurrentQuestion(prev => prev - 1);
      toast.success('Removed question successfully.');
   };

   const duplicateQuestion = () => {
      // ... (spread operator) doesn't deep copy nested objects
      //  using JSON.parse(JSON.stringify(obj)) to deep copy, than using ...questions[currentQuestion] which does not do deep copy in nested object
      //  By using JSON.parse(JSON.stringify(obj)) we can avoid mutating/affecting the original copy when the copied object is being edited.
      setQuestions(prev => [...prev, JSON.parse(JSON.stringify(questions[currentQuestion]))]);
      toast.success('Duplicated question successfully.');
   };

   const addChoice = () => {
      // // copy all the questions
      const allQuestions = [...questions];
      // // copy the question to update
      const questionToUpdate = { ...allQuestions[currentQuestion] };
      // // add new empty choice/response
      questionToUpdate.choices = [...questionToUpdate.choices, ''];
      // // put it back to its designated question
      allQuestions[currentQuestion] = questionToUpdate;
      // // set the state with question with new choice
      setQuestions(allQuestions);
   };

   const handleFillBlankInputChange = (e, index) => {
      e.target.style.width = e.target.value.length + 'ch';

      const allQuestions = [...questions];
      const questionToUpdate = { ...allQuestions[currentQuestion] };

      // get the index of specific correct answer element
      const correctAnswerIndex = questionToUpdate.correctAnswer.indexOf(questionToUpdate.correctAnswer.find(el => el.id === index));
      questionToUpdate.correctAnswer[correctAnswerIndex].answer = e.target.value;

      allQuestions[currentQuestion] = questionToUpdate;
      setQuestions(allQuestions);
   };

   const removeChoice = index => {
      const allQuestions = [...questions];
      const questionToUpdate = { ...allQuestions[currentQuestion] };

      if (
         questionToUpdate.choices[index] === questionToUpdate.correctAnswer &&
         (questionToUpdate.type === 'MCQ' || questionToUpdate.type === 'TFQ')
      ) {
         questionToUpdate.correctAnswer = '';
      }
      if (questionToUpdate.correctAnswer.includes(questionToUpdate.choices[index]) && questionToUpdate.type === 'MAQ') {
         const indexToRemove = questionToUpdate.correctAnswer.indexOf(questionToUpdate.choices[index]);
         questionToUpdate.correctAnswer.splice(indexToRemove, 1);
      }

      // remove element using splice(), empty the correctAnswer
      questionToUpdate.choices.splice(index, 1);
      allQuestions[currentQuestion] = questionToUpdate;
      setQuestions(allQuestions);
   };

   const handleQuestionTypeChange = e => {
      const allQuestions = [...questions];
      const questionToUpdate = { ...allQuestions[currentQuestion] };

      if (e.target.value === 'TFQ') {
         questionToUpdate.choices = ['True', 'False'];
         questionToUpdate.correctAnswer = '';
      }
      if (e.target.value === 'MCQ') {
         questionToUpdate.choices = ['', ''];
         questionToUpdate.correctAnswer = '';
      }
      if (e.target.value === 'MAQ') {
         questionToUpdate.choices = ['', ''];
         questionToUpdate.correctAnswer = [];
      }
      if (e.target.value === 'FIBQ') {
         questionToUpdate.choices = null;
         questionToUpdate.correctAnswer = [];
      }

      questionToUpdate.type = e.target.value;
      allQuestions[currentQuestion] = questionToUpdate;
      setQuestions(allQuestions);
   };

   const handleQuestionTextChange = e => {
      const allQuestions = [...questions];
      const questionToUpdate = { ...allQuestions[currentQuestion] };

      questionToUpdate.text = e.target.value;

      if (questionToUpdate.type === 'FIBQ') {
         // replace all occurence of '_' underscore with single underscore
         // split the string with delimeter of '_'  and include the delimeter, stored it in a variable
         const textSplit = e.target.value.replace(/\_+/g, '_').split(/(_)/g);

         // create the initial value of the correct answer together with its id
         // the id will be use for tracking and referencing the value of correct answer
         const blanks = [];
         for (let i = 0; i < textSplit.length; i++) {
            if (textSplit[i] === '_') blanks.push({ id: i, answer: '' });
            else continue;
         }

         questionToUpdate.correctAnswer = [...blanks];
      }

      allQuestions[currentQuestion] = questionToUpdate;
      setQuestions(allQuestions);
   };

   const handleChoicesChange = (e, index) => {
      const allQuestions = [...questions];
      const questionToUpdate = { ...allQuestions[currentQuestion] };

      if (
         questionToUpdate.correctAnswer &&
         questionToUpdate.correctAnswer === questionToUpdate.choices[index] &&
         (questionToUpdate.type === 'MCQ' || questionToUpdate.type === 'TFQ')
      ) {
         questionToUpdate.correctAnswer = e.target.value;
      }

      if (
         questionToUpdate.correctAnswer.length > 0 &&
         questionToUpdate.correctAnswer.includes(questionToUpdate.choices[index]) &&
         questionToUpdate.type === 'MAQ'
      ) {
         const indexToEdit = questionToUpdate.correctAnswer.indexOf(questionToUpdate.choices[index]);
         questionToUpdate.correctAnswer.splice(indexToEdit, 1, e.target.value); // replace the value with updated one onchange
      }

      questionToUpdate.choices[index] = e.target.value;
      allQuestions[currentQuestion] = questionToUpdate;
      setQuestions(allQuestions);
   };

   const handleQuestionGradingChange = e => {
      const allQuestions = [...questions];
      const questionToUpdate = { ...allQuestions[currentQuestion] };

      if (e.target.value) questionToUpdate.grading = Math.abs(parseFloat(e.target.value));
      allQuestions[currentQuestion] = questionToUpdate;
      setQuestions(allQuestions);
   };

   const handleCorrectAnswer = (e, index) => {
      const allQuestions = [...questions];
      const questionToUpdate = { ...allQuestions[currentQuestion] };

      if (questionToUpdate.type === 'MCQ' || questionToUpdate.type === 'TFQ') {
         questionToUpdate.correctAnswer = e.target.value;
      }
      if (questionToUpdate.type === 'MAQ') {
         if (e.target.checked) {
            if (e.target.value) questionToUpdate.correctAnswer.push(e.target.value);
         } else {
            const indexToRemove = questionToUpdate.correctAnswer.indexOf(e.target.value);
            questionToUpdate.correctAnswer.splice(indexToRemove, 1);
         }
      }
      allQuestions[currentQuestion] = questionToUpdate;
      setQuestions(allQuestions);
   };

   const checkQuestionValidity = () => {
      const questionErrors = {};

      // for MCQ TFQ, MAQ
      if (
         (questions[currentQuestion].type === 'MCQ' || questions[currentQuestion].type === 'TFQ' || questions[currentQuestion].type === 'MAQ') &&
         (!questions[currentQuestion].text || questions[currentQuestion].choices.includes(''))
      ) {
         questionErrors.emptyFields = true;
      }

      // for FIBQ
      if (
         (questions[currentQuestion].type === 'FIBQ' && !questions[currentQuestion].text) ||
         (questions[currentQuestion].type === 'FIBQ' &&
            questions[currentQuestion].text &&
            questions[currentQuestion].correctAnswer.find(el => el.answer === ''))
      ) {
         questionErrors.emptyFields = true;
      }
      if (questions[currentQuestion].type === 'FIBQ' && questions[currentQuestion].correctAnswer.length === 0) questionErrors.noCorrectAnswer = true;

      // for MCQ TFQ, MAQ
      if (
         (!questions[currentQuestion].correctAnswer && (questions[currentQuestion].type === 'MCQ' || questions[currentQuestion].type === 'TFQ')) ||
         (questions[currentQuestion].correctAnswer.length === 0 && questions[currentQuestion].type === 'MAQ')
      ) {
         questionErrors.noCorrectAnswer = true;
      }
      if (!questions[currentQuestion].grading && questions[currentQuestion].grading <= 0) {
         questionErrors.invalidGrading = true;
      }
      return questionErrors;
   };

   const next = () => {
      if (checkQuestionValidity().emptyFields) {
         toast.error('Please fill required fields.');
         return;
      }
      if (checkQuestionValidity().noCorrectAnswer) {
         toast.error('Please choose a correct answer.');
         return;
      }
      if (checkQuestionValidity().invalidGrading) {
         toast.error('Please enter a number greater than or equal to 1.', { autoClose: 3000 });
         return;
      }

      if (currentQuestion < questions.length) setCurrentQuestion(prev => prev + 1);
   };

   const previous = () => {
      if (checkQuestionValidity().emptyFields) {
         toast.error('Please fill required fields.');
         return;
      }
      if (checkQuestionValidity().noCorrectAnswer) {
         toast.error('Please choose a correct answer.');
         return;
      }
      if (checkQuestionValidity().invalidGrading) {
         toast.error('Please enter a number greater than or equal to 1.', { autoClose: 3000 });
         return;
      }

      if (currentQuestion > 0) setCurrentQuestion(prev => prev - 1);
   };

   const resetSearch = () => {
      setSearchTerm('');
      setSearchResults([]);
   };

   return (
      <div className='w-100'>
         <div className='mb-3 d-flex justify-content-between align-items-center'>
            <div className='d-flex align-items-center me-3'>
               <div className='classPage__icon me-3'>
                  Questions:<span className='ms-2 fw-bold'>{currentQuestion + 1}</span>
               </div>
               <div>
                  {currentQuestion >= 1 && (
                     <button title='Previous Question' className='btn btn-primary p-1 me-2' type='button' onClick={previous}>
                        <ArrowForwardIos style={{ transform: 'rotate(-180deg)' }} />
                     </button>
                  )}
                  {questions.length > 1 && currentQuestion < questions.length - 1 && (
                     <button title='Next Question' className='btn btn-primary p-1' type='button' onClick={next}>
                        <ArrowForwardIos />
                     </button>
                  )}
               </div>
            </div>
            <div>
               <span>
                  Total Questions: <span className='fw-bold ms-1'>{questions.length}</span>
               </span>
               <span className='mx-2'>|</span>
               <span>
                  Total Points: <span className='fw-bold mx-1'>{isNaN(getTotalScore()) ? 0 : getTotalScore()}</span>
               </span>
            </div>
         </div>
         <div className='d-flex mb-3'>
            <select className='w-50 form-select' value={questions[currentQuestion].type} name='type' id='type' onChange={handleQuestionTypeChange}>
               <option value='MCQ'>Multiple Choice</option>
               <option value='TFQ'>True/False</option>
               <option value='MAQ'>Multiple Answer</option>
               <option value='FIBQ'>Fill in the blanks</option>
            </select>
            <div className='ps-3 w-50 input-group position-relative'>
               {/* TODO: Tobe change because I stored categoryID as category might cause conflict, if adding new category */}
               {!questions[currentQuestion].category ? (
                  <input value={category} className='form-control' type='text' placeholder='Question Category' onChange={handleCategoryChange} />
               ) : (
                  <>
                     <input
                        className='form-control'
                        value={categories.filter(c => c.id === questions[currentQuestion].category)[0].name}
                        type='text'
                        readOnly
                        disabled
                     />
                     <button title='Clear Category' className='btn btn-primary p-1' onClick={handleClearCategory}>
                        <Close />
                     </button>
                  </>
               )}

               <ul className='category-list position-absolute overflow-auto list-group top-100 mt-1'>
                  {categoryResults.length > 0 &&
                     categoryResults.map(c =>
                        c.name !== 'Add Category' ? (
                           <li className='d-flex align-items-center list-group-item border-1' key={c.id}>
                              <span>{c.name}</span>

                              <div className='ms-auto dropstart'>
                                 <button className='btn px-0' data-bs-toggle='dropdown'>
                                    <MoreVertIcon />
                                 </button>

                                 <ul className='dropdown-menu'>
                                    <li>
                                       <span className='dropdown-item' onClick={() => handleSelectedCategory(c.id)}>
                                          Select
                                       </span>
                                       <span
                                          className='dropdown-item'
                                          data-bs-toggle='modal'
                                          data-bs-target={`#modal-category-edit-${c.id}`}
                                          onClick={() => setEditCategory(c.name)}
                                       >
                                          Edit
                                       </span>
                                       <span className='dropdown-item' data-bs-toggle='modal' data-bs-target={`#modal-category-delete-${c.id}`}>
                                          Delete
                                       </span>
                                    </li>
                                 </ul>
                              </div>

                              {/* modal category edit */}
                              <Modal title='Edit Question Category ' target={`modal-category-edit-${c.id}`} onResetState={() => setEditCategory('')}>
                                 <div className='mb-4'>
                                    <label htmlFor='edit-name' className='form-label'>
                                       Category Name
                                    </label>
                                    <input
                                       className='form-control'
                                       value={editCategory}
                                       type='text'
                                       id='edit-name'
                                       name='edit-name'
                                       onChange={e => setEditCategory(titleCase(e.target.value))}
                                    />
                                 </div>
                                 <div className='d-flex mb-2 justify-content-end align-items-center'>
                                    <button className='btn btn-secondary me-3 py-2' type='button' data-bs-dismiss='modal'>
                                       Cancel
                                    </button>
                                    <button
                                       className='btn btn-primary py-2'
                                       type='button'
                                       data-bs-dismiss='modal'
                                       disabled={editCategory === c.name ? true : false}
                                       onClick={() => handleCategoryOptions(c.id, c.name, 'edit')}
                                    >
                                       Confirm
                                    </button>
                                 </div>
                              </Modal>

                              <Modal title='Confirmation Message' target={`modal-category-delete-${c.id}`} onResetState={() => setEditCategory('')}>
                                 <div className='mb-4'>
                                    <p>Are you sure your're going to delete {c.name}?</p>
                                 </div>
                                 <div className='d-flex mb-2 justify-content-end align-items-center'>
                                    <button className='btn btn-secondary me-3 py-2' type='button' data-bs-dismiss='modal'>
                                       Cancel
                                    </button>
                                    <button
                                       className='btn btn-primary py-2'
                                       type='button'
                                       data-bs-dismiss='modal'
                                       onClick={() => handleCategoryOptions(c.id, null, 'delete')}
                                    >
                                       Confirm
                                    </button>
                                 </div>
                              </Modal>
                           </li>
                        ) : (
                           <li className='category-item list-group-item border-1' key={c.id} onClick={() => handleCategoryOptions(null, null, 'add')}>
                              {c.name}
                           </li>
                        )
                     )}
               </ul>
            </div>
         </div>
         <textarea
            value={questions[currentQuestion].text}
            className='form-control mb-3'
            name='questionText'
            id='questionText'
            placeholder='Question Text'
            rows='2'
            onChange={handleQuestionTextChange}
         ></textarea>
         {questions[currentQuestion].type === 'FIBQ' && (
            <small className='text-secondary-light'>To define where a blank should appear in the text below, use '_' underscores.</small>
         )}

         {/* choices only for MCQ, TFQ, MAQ */}
         {questions[currentQuestion].type !== 'FIBQ' && (
            <div>
               <div className='d-flex align-items-center mb-3'>
                  <div className='me-3'>Choices</div>
                  {questions[currentQuestion].type !== 'TFQ' && (
                     <button title='Add Choices' className='btn btn-primary p-1' type='button' onClick={addChoice}>
                        <Add />
                     </button>
                  )}
               </div>
               {/* choices */}
               {questions &&
                  questions.length > 0 &&
                  [...Array(questions[currentQuestion].choices.length)].map((el, index) => (
                     <div key={index} className='mb-2 d-flex justify-content-between align-items-center'>
                        <div className='w-100'>
                           <input
                              id={`${currentQuestion}-${index}`}
                              className='form-control'
                              value={questions[currentQuestion].choices[index]}
                              type='text'
                              placeholder='Answer'
                              onChange={e => handleChoicesChange(e, index)}
                              disabled={questions[currentQuestion].type === 'TFQ' ? true : false}
                           />
                        </div>
                        <div className='mx-3 p-0 form-check'>
                           {(questions[currentQuestion].type === 'MCQ' || questions[currentQuestion].type === 'TFQ') && (
                              <input
                                 title='Correct Answer'
                                 className='form-check-input m-0'
                                 type='radio'
                                 name={`question-${currentQuestion}`}
                                 id={`question-${currentQuestion}`}
                                 checked={
                                    questions[currentQuestion].correctAnswer &&
                                    questions[currentQuestion].choices[index] === questions[currentQuestion].correctAnswer
                                       ? true
                                       : false
                                 }
                                 onChange={e => handleCorrectAnswer(e, index)}
                                 value={questions[currentQuestion].choices[index]}
                              />
                           )}

                           {questions[currentQuestion].type === 'MAQ' && (
                              <input
                                 title='Correct Answer'
                                 className='form-check-input m-0'
                                 type='checkbox'
                                 name={`question-${currentQuestion}`}
                                 id={`question-${currentQuestion}`}
                                 checked={
                                    questions[currentQuestion].correctAnswer &&
                                    questions[currentQuestion].correctAnswer.includes(questions[currentQuestion].choices[index])
                                       ? true
                                       : false
                                 }
                                 onChange={e => handleCorrectAnswer(e, index)}
                                 value={questions[currentQuestion].choices[index]}
                              />
                           )}
                        </div>

                        {questions[currentQuestion].choices.length > 2 && (
                           <div>
                              <button title='Remove Choices' className='btn btn-primary p-1' type='button' onClick={() => removeChoice(index)}>
                                 <Remove />
                              </button>
                           </div>
                        )}
                     </div>
                  ))}
            </div>
         )}

         {/* choices for FIBQ */}
         {questions[currentQuestion].type === 'FIBQ' && (
            <>
               {/* replace all occurence of '_' underscore with single underscore */}
               {/* split the string with delimeter of '_'  and include the delimeter */}
               {/* iterate ovr then, if element is equal to underscore append input text */}
               <div className='my-3 d-flex align-items-center flex-wrap'>
                  {questions[currentQuestion].text
                     .replace(/\_+/g, '_')
                     .split(/(_)/g)
                     .map((str, index) =>
                        str !== '_' ? (
                           <span key={index}>{str}</span>
                        ) : (
                           <input
                              value={
                                 questions[currentQuestion].correctAnswer &&
                                 questions[currentQuestion].correctAnswer.find(el => el.id === index).answer
                              }
                              key={index}
                              className='form-control fill-blank-input mx-1'
                              type='text'
                              placeholder='Answer'
                              onChange={e => handleFillBlankInputChange(e, index)}
                           />
                        )
                     )}
               </div>
               <small className='text-secondary-light'>For the question to be marked as correct, students must answer in the correct order.</small>
            </>
         )}

         <div className='mt-3 d-flex justify-content-between'>
            <div className='d-flex justify-content-start align-items-center'>
               <input
                  value={questions[currentQuestion].grading}
                  className='text-center form-control me-2'
                  type='number'
                  min='1'
                  name={`gradingInput${currentQuestion}`}
                  id={`gradingInput${currentQuestion}`}
                  style={{ width: '100px' }}
                  onChange={e => handleQuestionGradingChange(e, currentQuestion)}
               />
               {questions[currentQuestion].type == 'MAQ' && (
                  <label htmlFor={`gradingInput${currentQuestion}`}>point/s per choice regardless of being correct or incorrect</label>
               )}

               {(questions[currentQuestion].type === 'MCQ' || questions[currentQuestion].type === 'TFQ') && (
                  <label htmlFor={`gradingInput${currentQuestion}`}>point/s</label>
               )}

               {questions[currentQuestion].type === 'FIBQ' && <label htmlFor={`gradingInput${currentQuestion}`}>point/s per correct answer</label>}
            </div>
            <div className='d-flex'>
               <button title='Duplicate Question' className='btn btn-primary me-2' type='button' onClick={duplicateQuestion}>
                  <FileCopy />
               </button>
               {questions.length > 1 && (
                  <button title='Delete Question' className='btn btn-primary' type='button' onClick={removeQuestion}>
                     <Delete />
                  </button>
               )}
            </div>
         </div>

         <div className='mt-3'>
            <button className='w-50 btn btn-primary' style={{ borderRadius: 0 }} type='button' onClick={addQuestion}>
               Add New Question
            </button>
            <button
               className='w-50 btn btn-secondary'
               style={{ borderRadius: 0 }}
               type='button'
               data-bs-toggle='modal'
               data-bs-target='#modal-search-questionBank'
            >
               Add From Question Bank
            </button>

            {/* modal search question bank */}
            <Modal title={'Question Bank'} target='modal-search-questionBank' isLarge={true} onResetState={() => resetSearch()}>
               <SearchQuestionBank
                  questionsFromBank={questionsFromBank}
                  setQuestions={setQuestions}
                  categories={categories}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  searchResults={searchResults}
                  setSearchResults={setSearchResults}
               />
            </Modal>
         </div>
      </div>
   );
};

export default CreateQuestions;
