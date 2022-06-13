import { db } from '../../firebase';
import InfoIcon from '@material-ui/icons/Info';
import { toast } from 'react-toastify';

const SearchQuestionBank = ({ questionsFromBank, setQuestions, categories, searchTerm, setSearchTerm, searchResults, setSearchResults }) => {
   const getCategoryName = (questionId, categoryId) => {
      if (categories.length > 0) {
         const category = categories.find(c => c.id === categoryId);
         if (category) return category.name;
         else {
            console.log('wala nakita ang category Name!');
            db.collection('questionBank')
               .doc(questionId)
               .update({ 'question.category': '' })
               .catch(err => console.error(err));

            return 'N/A';
         }
      }
   };

   const handleSearchChange = e => {
      const value = e.target.value;
      setSearchTerm(value);
      if (e.target.value) {
         setSearchResults(
            questionsFromBank.filter(
               q =>
                  q.question.text.toLowerCase().includes(value.toLowerCase()) ||
                  (q.question.category && getCategoryName(q.id, q.question.category).toLowerCase().includes(value.toLowerCase()))
            )
         );
      } else setSearchResults([]);
   };

   const getQuestionPoints = question => {
      if (question.type === 'MCQ' || question.type === 'TFQ') {
         return question.grading;
      } else if (question.type === 'MAQ') {
         return question.grading * question.choices.length;
      } else if (question.type === 'FIBQ') {
         return question.grading * question.correctAnswer.length;
      }
   };

   const addToQuiz = question => {
      // ... (spread operator) doesn't deep copy nested objects
      //  using JSON.parse(JSON.stringify(obj)) to deep copy, than using ...questions[currentQuestion] which does not do deep copy in nested object
      //  By using JSON.parse(JSON.stringify(obj)) we can avoid mutating/affecting the original copy when the copied object is being edited.
      setQuestions(prev => [...prev, JSON.parse(JSON.stringify(question))]);
      toast.success('Question added successfully.');
   };

   return (
      <div>
         <div className='mb-3'>
            <InfoIcon className='text-secondary-light' /> Search for questions you have created.
         </div>
         <div>
            <input
               className='form-control mb-3'
               type='search'
               value={searchTerm}
               name='search'
               id='search'
               placeholder='Search by Question Text or Category Name'
               onChange={handleSearchChange}
            />
         </div>
         <div className='accordion accordion-flush overflow-auto' style={{ maxHeight: '400px' }}>
            {/* TODO: dont allow the question to be added again in quesiton bank if it came from the question bank, allow if the question is edited */}
            {searchResults.length > 0
               ? searchResults.map(q => (
                    <div key={q.id} className='accordion-item'>
                       <h2 className='accordion-header'>
                          <button
                             className='accordion-button collapsed customAccordionButton border-bottom-1'
                             type='button'
                             data-bs-toggle='collapse'
                             data-bs-target={`#questions-${q.id}`}
                          >
                             <span className='badge bg-primary-outline me-2'>{q.question.type}</span>
                             <span className='badge bg-secondary-dark-outline me-3'>{`${getQuestionPoints(q.question)} ${
                                getQuestionPoints(q.question) > 1 ? 'pts' : 'pt'
                             }`}</span>
                             <span className='text-ellipsis' style={{ width: '89%' }}>
                                {q.question.text}
                             </span>
                          </button>
                       </h2>
                       <div id={`questions-${q.id}`} className='accordion-collapse collapse'>
                          <div className='accordion-body pt-1 pb-2'>
                             <div className='d-inline-block mb-2 text-wrap'>
                                <span className='me-2'>Category:</span>
                                <span className='badge bg-success-outline'>
                                   {q.question.category ? getCategoryName(q.id, q.question.category) : 'N/A'}
                                </span>
                             </div>

                             {/* question text */}
                             <div>{q.question.text}</div>

                             {/* question choices */}
                             <div className='d-flex flex-column mt-1'>
                                {(q.question.type === 'MCQ' || q.question.type === 'TFQ') &&
                                   q.question.choices.map((c, index) => (
                                      <div key={index} className='form-check'>
                                         <input
                                            className='form-check-input'
                                            disabled
                                            type='radio'
                                            name={`question-${q.id}`}
                                            checked={q.question.correctAnswer === c ? true : false}
                                         />
                                         <label className='form-check-label'>{c}</label>
                                      </div>
                                   ))}

                                {q.question.type === 'MAQ' &&
                                   q.question.choices.map((c, index) => (
                                      <div key={index} className='form-check'>
                                         <input
                                            className='form-check-input'
                                            disabled
                                            type='checkbox'
                                            name={`question-${q.id}`}
                                            checked={q.question.correctAnswer.includes(c)}
                                         />
                                         <label className='form-check-label'>{c}</label>
                                      </div>
                                   ))}

                                <div className='d-flex align-items-center flex-wrap my-2'>
                                   {q.question.type === 'FIBQ' &&
                                      q.question.text
                                         .replace(/\_+/g, '_')
                                         .split(/(_)/g)
                                         .map((str, index) =>
                                            str !== '_' ? (
                                               <div key={index}>{str}</div>
                                            ) : (
                                               <span key={index} className='mx-1'>
                                                  <u>{q.question.correctAnswer.find(el => el.id === index).answer}</u>
                                               </span>
                                            )
                                         )}
                                </div>
                             </div>
                          </div>
                          <button className='btn btn-primary w-100 p-1' type='button' onClick={() => addToQuiz(q.question)}>
                             Add to Quiz
                          </button>
                       </div>
                    </div>
                 ))
               : searchTerm && <div className='py-3 text-center'>No result found.</div>}
         </div>
      </div>
   );
};

export default SearchQuestionBank;
