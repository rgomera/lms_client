import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import ViewClassStudents from './ViewClassStudents';
import AddClassStudent from './AddClassStudent';
import TextEditor from './TextEditor';
import ClassPost from './ClassPost';
import useFetch from '../hooks/useFetch';
import { db, storage } from '../../firebase';
import firebase from 'firebase';
import { toast } from 'react-toastify';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import RefreshIcon from '@material-ui/icons/Refresh';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import './ClassPage.css';
import ViewStudentGrades from './ViewStudentGrades';
import CreateQuestions from './CreateQuestions';
import { isEqual } from 'lodash';

const ClassPage = ({ teacher, onSetStudentCountRefresh }) => {
   const { id } = useParams();
   const isMounted = useRef(false);

   const { data: students, setRefresh: setStudentsRefresh } = useFetch(`/dashboard/teachers/students/${id}`);
   const { data: studentNotInClass, setRefresh: setStudentNotInClassRefresh } = useFetch(`/dashboard/teachers/students/not-exists-in-class/${id}`);

   const { data: classInstance } = useFetch(`/dashboard/teachers/classes/${id}`);
   const { data: classCode } = useFetch(`/dashboard/teachers/classcodes/${classInstance && classInstance.class_id}/${teacher.teacher_id}`);
   const [posts, setPosts] = useState([]);
   const [postsAsc, setPostsAsc] = useState([]);

   const [textEditorContent, setTextEditorContent] = useState('');
   const [type, setType] = useState('Announcement');
   const [files, setFiles] = useState([]);
   const [maxScore, setMaxScore] = useState('');
   const [title, setTitle] = useState('');
   const [quizInstruction, setQuizInstruction] = useState('');
   const [dueDate, setDueDate] = useState('');
   const [categories, setCategories] = useState([]);

   const [isUploading, setIsUploading] = useState(false);
   const [isRefresh, setIsRefresh] = useState(false);
   const fileInputRef = useRef();

   const [questions, setQuestions] = useState([
      {
         type: 'MCQ',
         text: '',
         category: '',
         choices: ['', ''],
         correctAnswer: '',
         grading: 1,
      },
   ]);
   const [questionsFromBank, setQuestionsFromBank] = useState([]);
   const [isRandomizeQuestion, setIsRandomizeQuestion] = useState(false);
   const [isRandomizeChoices, setIsRandomizeChoices] = useState(false);
   const [isQuizResultsViewable, setIsQuizResultsViewable] = useState(false);
   const [isQuizValid, setIsQuizValid] = useState(false);

   const checkQuizValidity = () => {
      if (!title || !quizInstruction || !dueDate) return false;

      // TODO: check validity has an error and bug when validating FIBQ
      for (let i = 0; i < questions.length; i++) {
         if (
            (questions[i].type === 'MCQ' || questions[i].type === 'TFQ' || questions[i].type === 'MAQ') &&
            (!questions[i].text || questions[i].choices.includes(''))
         ) {
            return false;
         }

         if (
            questions[i].type === 'FIBQ' &&
            (!questions[i].text || questions[i].correctAnswer.length === 0 || questions[i].correctAnswer.find(el => el.answer === ''))
         )
            return false;

         if (
            (!questions[i].correctAnswer && (questions[i].type === 'MCQ' || questions[i].type === 'TFQ')) ||
            (questions[i].correctAnswer.length === 0 && questions[i].type === 'MAQ')
         ) {
            return false;
         }
         if (!questions[i].grading || questions[i].grading <= 0) {
            return false;
         }
      }
      return true;
   };

   const reset = () => {
      setTextEditorContent('');
      setFiles([]);
      setTitle('');
      setType('Announcement');
      setMaxScore('');
      setDueDate('');
   };

   const clearPost = () => {
      setTextEditorContent('');
      setFiles([]);
      setType('Announcement');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMaxScore('');
   };

   const copyClassCode = e => {
      const text = e.target.innerText;

      navigator.clipboard
         .writeText(text)
         .then(() => {
            toast.success('Copied to clipboard.');
         })
         .catch(err => {
            console.error(err);
            toast.error("Could'nt copy the text.");
         });
   };

   const getTotalScore = () => {
      let totalScore = 0;
      questions.forEach(question => {
         if (question.type === 'MCQ' || question.type === 'TFQ') totalScore += question.grading;
         else if (question.type === 'MAQ') totalScore += question.grading * question.choices.length;
         else if (question.type === 'FIBQ') totalScore += question.grading * question.correctAnswer.length;
      });

      return totalScore;
   };

   const handleSelectedFile = e => {
      setFiles([...e.target.files]);
   };

   const isQuestionExists = question => {
      let result = false;
      const qb = questionsFromBank.map(el => el.question);

      for (let i = 0; i < qb.length; i++) {
         if (isEqual(qb[i], question)) {
            result = true;
            break;
         }
      }
      return result;
   };

   const handleAddQuiz = () => {
      setIsUploading(true);
      db.collection('classes')
         .doc(id)
         .collection('posts')
         .add({
            title,
            type,
            displayName: `${teacher.teacher_fname} ${teacher.teacher_lname} ${teacher.teacher_mname && teacher.teacher_mname.charAt(0) + '.'}`,
            body: quizInstruction,
            dueDate: dueDate && new Date(dueDate),
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            isRandomizeQuestion,
            isRandomizeChoices,
            isQuizResultsViewable,
            maxScore: getTotalScore(),
            questions: [...questions],
         })
         .then(async () => {
            // after quiz create create write batch to add all questions in question bank
            // by iterating over the questions
            const batch = db.batch();

            questions.forEach(q => {
               if (!isQuestionExists(q)) {
                  batch.set(db.collection('questionBank').doc(), {
                     question: { ...q },
                     teacherId: teacher.teacher_id,
                     timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                  });
               }
            });

            // commit batch
            try {
               await batch.commit();

               setTitle('');
               setQuizInstruction('');
               setDueDate('');
               setType('Announcement');
               setIsRandomizeChoices(false);
               setIsRandomizeQuestion(false);
               setQuestions([
                  {
                     type: 'MCQ',
                     text: '',
                     choices: ['', ''],
                     correctAnswer: '',
                     grading: 1,
                  },
               ]);
               setIsUploading(false);
               toast.success('Post created successfully!');
            } catch (err) {
               console.error(err.message);
            }
         })
         .catch(err => console.error(err.message));
   };

   const getNotificationText = (type, teacherName) => {
      if (type === 'Announcement') {
         return `
            <div><strong>${teacherName}</strong> posted new announcement in <strong>${classInstance.class_name}</strong></div>`;
      }
   };

   const handleSubmitPost = e => {
      const teacherName = `${teacher.teacher_fname} ${teacher.teacher_lname} ${teacher.teacher_mname && teacher.teacher_mname.charAt(0) + '.'}`;
      e.preventDefault();

      // Add post to firestore
      // Get the ID of the recently added post
      // Save the file to storage referencing with the class ID and post ID
      // Get the download URLs
      // update the post url with the gathered download URLs
      db.collection('classes')
         .doc(id)
         .collection('posts')
         .add({
            title,
            type,
            displayName: teacherName,
            body: textEditorContent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            dueDate: dueDate && new Date(dueDate),
            maxScore: maxScore && Math.abs(maxScore),
            urls: [],
         })
         .then(async docRef => {
            await db.collection('notifications').add({
               to: id,
               text: getNotificationText('Announcement', teacherName),
               createdAt: new Date(),
               readers: students.map(student => student.student_id),
               excluded: [],
            });

            if (files.length > 0) {
               if (files.length === 1) {
                  const file = files[0];
                  const storageRef = storage.ref(`classes/${id}/posts/${docRef.id}/${file.name}`);
                  const uploadTask = storageRef.put(file);
                  setIsUploading(true);

                  uploadTask.on(
                     'state_changed',
                     snapshot => {},
                     err => console.error(err),
                     async () => {
                        const URL = await storageRef.getDownloadURL();

                        await docRef.update({
                           urls: [URL],
                        });

                        reset();
                        setIsUploading(false);
                        toast.success('Post created successfully!');
                     }
                  );
               }

               if (files.length > 1) {
                  setIsUploading(true);
                  const uploadPromises = [];
                  const getDownloadUrlPromises = [];

                  // store all the upload promises and getDownloadURL promises in an array
                  files.forEach(file => {
                     const storageRef = storage.ref(`classes/${id}/posts/${docRef.id}/${file.name}`);
                     const uploadTask = storageRef.put(file);
                     uploadPromises.push(uploadTask);

                     uploadTask.on(
                        'state_changed',
                        snapshot => {},
                        err => console.error(err.message),
                        () => {
                           const downloadURL = storageRef.getDownloadURL();
                           getDownloadUrlPromises.push(downloadURL);
                        }
                     );
                  });

                  // promise.all that will resolve when all the inputted promises has been resolved
                  Promise.all(uploadPromises)
                     .then(() => {
                        const getDownloadURLs = new Promise((resolve, reject) => {
                           const urls = [];

                           getDownloadUrlPromises.forEach(async (getDownloadURLPromise, index) => {
                              const url = await getDownloadURLPromise;
                              urls.push(url);

                              if (getDownloadUrlPromises.length === urls.length) resolve(urls);
                           });
                        });

                        // get the resolve value of getDownloadURLs, then update the post urls
                        getDownloadURLs.then(async fileUrls => {
                           await docRef.update({
                              urls: fileUrls,
                           });

                           reset();
                           setIsUploading(false);
                           toast.success('Post created successfully!');
                        });
                     })
                     .catch(err => console.log(err));
               }
            } else {
               reset();
               toast.success('Post created successfully!');
            }
         });
   };

   const refresh = () => {
      setIsRefresh(!isRefresh);
   };

   const handleSetPostType = e => {
      setType(e.target.value);
      if (e.target.value !== 'Assignment') setMaxScore('');
   };

   useEffect(() => {
      isMounted.current = true;
      db.collection('classes')
         .doc(id)
         .collection('posts')
         .orderBy('timestamp', 'desc')
         .onSnapshot(
            snapshot => {
               if (isMounted.current) {
                  setPosts(
                     snapshot.docs.map(doc => ({
                        id: doc.id,
                        classId: id,
                        post: doc.data(),
                     }))
                  );
               }
            },
            err => console.error(err)
         );

      db.collection('classes')
         .doc(id)
         .collection('posts')
         .orderBy('timestamp', 'asc')
         .onSnapshot(
            snapshot => {
               if (isMounted.current) {
                  setPostsAsc(
                     snapshot.docs.map(doc => ({
                        id: doc.id,
                        classId: id,
                        post: doc.data(),
                     }))
                  );
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
      db.collection('questionCategory')
         .where('teacherId', '==', teacher.teacher_id)
         .onSnapshot(snapshot => {
            if (isMounted.current) {
               setCategories(
                  snapshot.docs.map(doc => ({
                     id: doc.id,
                     ...doc.data(),
                  }))
               );
            }
         });

      db.collection('questionBank')
         .where('teacherId', '==', teacher.teacher_id)
         .onSnapshot(
            snapshot => {
               if (isMounted) {
                  setQuestionsFromBank(
                     snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                     }))
                  );
               }
            },
            err => console.error(err)
         );

      // cleanup function
      return () => {
         isMounted.current = false;
      };
   }, []);

   return (
      <div>
         <div className='d-flex'>
            <Link to='/teacher/manage/classes' className='d-flex justify-content-center btn btn-primary p-0'>
               <ArrowForwardIosIcon className='classPage__icon' style={{ transform: 'rotate(-180deg)' }} />
            </Link>
            <button type='button' className='d-flex justify-content-center btn btn-primary ms-2 p-0' onClick={() => refresh()}>
               <RefreshIcon className='classPage__icon' />
            </button>
         </div>

         <div className='d-flex justify-content-between bg-primary classPage__header mt-3 p-3'>
            <div className='d-flex flex-column'>
               <div className='d-flex flex-column flex-lg-row'>
                  <h1 className='h1 mb-0'>{classInstance.class_name}</h1>
                  <div className='d-flex align-items-center'>
                     <span className='fs-2 mx-2 d-none d-lg-block'>&#8226;</span>
                     <span className='me-3'>{classInstance.subject_name}</span>
                     <span className='mx-3'>{classInstance.class_section}</span>
                     <span className='mx-3'>{classInstance.class_school_year}</span>
                  </div>
               </div>
               <div className='me-sm-3'>
                  <span className='cursor-pointer' onClick={copyClassCode}>
                     {classCode.cc_id}
                  </span>
               </div>
            </div>
            <div className='dropdown'>
               <button className='btn bg-primary px-0' data-bs-toggle='dropdown'>
                  <MoreVertIcon />
               </button>

               <ul className='dropdown-menu'>
                  <li>
                     <span className='dropdown-item' data-bs-toggle='modal' data-bs-target={`#modal-view-${classInstance.class_id}`}>
                        View Students
                     </span>
                  </li>
                  <li>
                     <span className='dropdown-item' data-bs-toggle='modal' data-bs-target={`#modal-add-${classInstance.class_id}`}>
                        Add Students
                     </span>
                  </li>
                  <li>
                     <span className='dropdown-item' data-bs-toggle='modal' data-bs-target={`#moda-view-grades-${classInstance.class_id}`}>
                        View Grades
                     </span>
                  </li>
               </ul>
            </div>
         </div>

         <div>
            <nav>
               <div className='nav' id='nav-tab' role='tablist'>
                  <button className='nav-tabs-button active' id='postsButton' data-bs-toggle='tab' data-bs-target='#posts' type='button' role='tab'>
                     Posts Feed
                  </button>
                  <button className='nav-tabs-button' id='addPostButton' data-bs-toggle='tab' data-bs-target='#addPost' type='button' role='tab'>
                     <AddCircleIcon className='text-primary fs-2' />
                  </button>
               </div>
            </nav>
            <div className='tab-content' id='nav-tabContent'>
               <div className='tab-pane fade show active' id='posts' role='tabpanel'>
                  <div className='classPostList overflow-auto mt-3'>
                     <ul className='list-group position-abosolute px-2'>
                        {posts.length > 0 ? (
                           posts.map(post => <ClassPost key={post.id} teacher={teacher} classInstance={classInstance} post={post} />)
                        ) : (
                           <span className='text-center'>No post at the moment..</span>
                        )}
                     </ul>
                  </div>
               </div>
               <div className='tab-pane fade addPostTab' id='addPost' role='tabpanel'>
                  <div className={`mt-3 position-relative ${!isUploading ? '' : 'd-flex flex-column justify-content-center align-items-center'}`}>
                     {!isUploading ? (
                        <>
                           {type === 'Assignment' && (
                              <div className='align-items-center mb-3 w-100'>
                                 <input
                                    className='form-control'
                                    value={title}
                                    id='title'
                                    type='text'
                                    name='title'
                                    placeholder='Title'
                                    onChange={e => setTitle(e.target.value)}
                                 />
                              </div>
                           )}

                           {type === 'Quiz' && (
                              <div className='accordion mb-3'>
                                 <div className='accordion-item'>
                                    <h2 className='accordion-header'>
                                       <button
                                          className='accordion-button px-2 customAccordionButton'
                                          type='button'
                                          data-bs-toggle='collapse'
                                          data-bs-target='#questionDetails'
                                       >
                                          Quiz Details
                                       </button>
                                    </h2>
                                    <div id='questionDetails' className='accordion-collapse collapse'>
                                       <div className='accordion-body'>
                                          <input
                                             className='mb-3 form-control'
                                             value={title}
                                             id='title'
                                             type='text'
                                             name='title'
                                             placeholder='Title'
                                             onChange={e => setTitle(e.target.value)}
                                          />

                                          <textarea
                                             className='mb-3 form-control'
                                             value={quizInstruction}
                                             id='quizInstruction'
                                             name='text'
                                             placeholder='Instructions'
                                             onChange={e => setQuizInstruction(e.target.value)}
                                          ></textarea>

                                          <div className='d-flex mb-3'>
                                             <div className='form-check form-switch'>
                                                <input
                                                   className='form-check-input'
                                                   checked={isRandomizeQuestion}
                                                   type='checkbox'
                                                   role='switch'
                                                   id='isQuestionRandomized'
                                                   onChange={e => setIsRandomizeQuestion(e.target.checked)}
                                                />
                                                <label className='form-check-label' htmlFor='flexSwitchCheckDefault'>
                                                   Randomize Questions
                                                </label>
                                             </div>
                                             <div className='ms-3 form-check form-switch'>
                                                <input
                                                   className='form-check-input'
                                                   checked={isRandomizeChoices}
                                                   type='checkbox'
                                                   role='switch'
                                                   id='isQuestionRandomized'
                                                   onChange={e => setIsRandomizeChoices(e.target.checked)}
                                                />
                                                <label className='form-check-label' htmlFor='flexSwitchCheckDefault'>
                                                   Randomize Choices
                                                </label>
                                             </div>
                                             {/* <div className='ms-3 form-check form-switch'>
                                                <input
                                                   className='form-check-input'
                                                   checked={isQuizResultsViewable}
                                                   type='checkbox'
                                                   role='switch'
                                                   id='isQuizResultsViewable'
                                                   onChange={e => setIsQuizResultsViewable(e.target.checked)}
                                                />
                                                <label className='form-check-label' htmlFor='flexSwitchCheckDefault'>
                                                   Allow Students to View Results
                                                </label>
                                             </div> */}
                                          </div>

                                          <div className='input-group' style={{ width: '40%' }}>
                                             <span className='input-group-text' style={{ fontSize: 'inherit' }}>
                                                Due Date
                                             </span>
                                             <input
                                                className='form-control'
                                                value={dueDate}
                                                type='datetime-local'
                                                name='dueDate'
                                                id='dueDate'
                                                placeholder='Due Date'
                                                onChange={e => setDueDate(e.target.value)}
                                             />
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           )}
                           {type !== 'Quiz' && (
                              <TextEditor textEditorContent={textEditorContent} onSetTextEditorContent={setTextEditorContent} data='<p>heelo</p>' />
                           )}
                           <form onSubmit={handleSubmitPost}>
                              <div className='input-group'>
                                 {type === 'Quiz' && (
                                    <CreateQuestions
                                       questionsFromBank={questionsFromBank}
                                       questions={questions}
                                       setQuestions={setQuestions}
                                       getTotalScore={getTotalScore}
                                       categories={categories}
                                       teacher={teacher}
                                    />
                                 )}
                                 <div className='d-flex justify-content-between w-100 mt-3'>
                                    <select className='form-select' style={{ width: '40%' }} value={type} onChange={handleSetPostType}>
                                       <option value='Announcement' defaultValue>
                                          Announcement
                                       </option>
                                       <option value='Material'>Material</option>
                                       <option value='Assignment'>Assignment</option>
                                       <option value='Quiz'>Quiz</option>
                                    </select>
                                    {type !== 'Quiz' && (
                                       <input
                                          ref={fileInputRef}
                                          type='file'
                                          className='form-control'
                                          style={{ width: '40%' }}
                                          multiple
                                          onChange={handleSelectedFile}
                                       />
                                    )}
                                    {type === 'Quiz' && (
                                       <div className='w-100 d-flex justify-content-end'>
                                          <button className='btn btn-secondary me-3' type='button' onClick={() => clearPost()}>
                                             Cancel
                                          </button>
                                          <button
                                             className='btn btn-primary'
                                             type='submit'
                                             disabled={checkQuizValidity() ? false : true}
                                             onClick={handleAddQuiz}
                                          >
                                             Post
                                          </button>
                                       </div>
                                    )}
                                 </div>

                                 {type === 'Assignment' && (
                                    <div className='d-flex justify-content-between w-100 mt-3'>
                                       <input
                                          className='form-control'
                                          style={{ width: '40%', marginLeft: '1px' }}
                                          value={maxScore}
                                          type='number'
                                          name='maxScore'
                                          id='maxScore'
                                          min='1'
                                          placeholder='Maximum Score'
                                          onChange={e => setMaxScore(parseInt(e.target.value))}
                                       />
                                       <div className='input-group' style={{ width: '40%' }}>
                                          <span className='input-group-text' style={{ fontSize: 'inherit' }}>
                                             Due Date
                                          </span>
                                          <input
                                             className='form-control'
                                             value={dueDate}
                                             type='datetime-local'
                                             name='dueDate'
                                             id='dueDate'
                                             placeholder='Due Date'
                                             onChange={e => setDueDate(e.target.value)}
                                          />
                                       </div>
                                    </div>
                                 )}

                                 {type !== 'Quiz' && (
                                    <div className='w-100 d-flex justify-content-end mt-3'>
                                       {textEditorContent && (
                                          <button className='btn btn-secondary me-3' type='button' onClick={() => clearPost()}>
                                             Cancel
                                          </button>
                                       )}
                                       <button
                                          className='btn btn-primary  px-3'
                                          type='submit'
                                          disabled={
                                             (!textEditorContent && type !== 'Assignment') ||
                                             (!textEditorContent && type === 'Assignment') ||
                                             (!maxScore && type === 'Assignment') ||
                                             (!title && type === 'Assignment') ||
                                             (!dueDate && type === 'Assignment') ||
                                             (maxScore <= 0 && type === 'Assignment')
                                                ? true
                                                : ''
                                          }
                                       >
                                          Post
                                       </button>
                                    </div>
                                 )}
                              </div>
                           </form>
                        </>
                     ) : (
                        <>
                           <div className='mt-5'>&nbsp;</div>
                           <div className='spinner__large spinner-border text-primary '></div>
                        </>
                     )}
                  </div>
               </div>
            </div>
         </div>

         <ViewClassStudents
            students={students}
            onSetStudentsRefresh={setStudentsRefresh}
            onSetStudentCountRefresh={onSetStudentCountRefresh}
            onSetStudentNotInClassRefresh={setStudentNotInClassRefresh}
            classInstance={classInstance}
            target={`modal-view-${classInstance.class_id}`}
         />

         <AddClassStudent
            onSetStudentsRefresh={setStudentsRefresh}
            onSetStudentCountRefresh={onSetStudentCountRefresh}
            onSetStudentNotInClassRefresh={setStudentNotInClassRefresh}
            studentNotInClass={studentNotInClass}
            classInstance={classInstance}
            target={`modal-add-${classInstance.class_id}`}
         />

         <ViewStudentGrades
            classId={classInstance.class_id}
            className={classInstance.class_name}
            students={students}
            posts={postsAsc}
            target={`moda-view-grades-${classInstance.class_id}`}
         />
      </div>
   );
};

export default ClassPage;
