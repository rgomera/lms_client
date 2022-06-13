import { useParams } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import firebase from 'firebase';
import { toast } from 'react-toastify';
import { db, storage } from '../../firebase';
import TextEditor from '../teacher/TextEditor';
import ClassPost from './ClassPost';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RefreshIcon from '@material-ui/icons/Refresh';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import '../teacher/ClassPage.css';
import ViewStudentGrades from './ViewStudentGrades';

const ClassPage = ({ student }) => {
   const { classId, teacherId } = useParams();
   const { data: classInstance } = useFetch(`/dashboard/students/classes/${classId}/${teacherId}`);
   const [classmates, setClassmates] = useState([]);
   const isMounted = useRef(false);

   const [posts, setPost] = useState([]);
   const [postsAsc, setPostsAsc] = useState([]);
   const [textEditorContent, setTextEditorContent] = useState('');
   const [type, setType] = useState('Announcement');
   const [files, setFiles] = useState([]);

   const [isUploading, setIsUploading] = useState(false);

   const [uploadedFiles, setUploadedFiles] = useState([]);
   const [triggerRerender, setTriggerRerender] = useState('');

   const [isRefresh, setIsRefresh] = useState(false);
   const fileInputRef = useRef();

   const reset = () => {
      setTextEditorContent('');
      setFiles([]);
      setType('Announcement');
   };

   const clearPost = () => {
      setTextEditorContent('');
      setFiles([]);
      setType('Announcement');
      fileInputRef.current.value = '';
   };

   const handleSelectedFile = e => {
      setFiles([...e.target.files]);
   };

   const handleSubmitPost = e => {
      e.preventDefault();

      // Add post to firestore
      // Get the ID of the recently added post
      // Save the file to storage referencing with the class ID and post ID
      // Get the download URLs
      // update the post url with the gathered download URLs
      db.collection('classes')
         .doc(classId)
         .collection('posts')
         .add({
            type: type,
            displayName: `${student.student_fname} ${student.student_lname} ${student.student_mname && student.student_mname.charAt(0) + '.'}`,
            body: textEditorContent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            urls: [],
         })
         .then(docRef => {
            if (files.length > 0) {
               if (files.length === 1) {
                  const file = files[0];
                  const storageRef = storage.ref(`classes/${classId}/posts/${docRef.id}/${file.name}`);
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
                     const storageRef = storage.ref(`classes/${classId}/posts/${docRef.id}/${file.name}`);
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
      setUploadedFiles([]);
      setClassmates([]);
   };

   useEffect(() => {
      isMounted.current = true;
      db.collection('classes')
         .doc(classId)
         .collection('posts')
         .orderBy('timestamp', 'desc')
         .onSnapshot(
            snapshot => {
               if (isMounted.current) {
                  setPost(
                     snapshot.docs.map(doc => ({
                        id: doc.id,
                        classId: classId,
                        post: doc.data(),
                     }))
                  );
               }
            },
            err => console.error(err)
         );

      db.collection('classes')
         .doc(classId)
         .collection('posts')
         .orderBy('timestamp', 'asc')
         .onSnapshot(
            snapshot => {
               if (isMounted.current) {
                  setPostsAsc(
                     snapshot.docs.map(doc => ({
                        id: doc.id,
                        classId: classId,
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
      (async () => {
         try {
            const response = await fetch(`/dashboard/students/classmates/${classId}/${teacherId}`, {
               headers: { token: localStorage.getItem('token') },
            });
            const data = await response.json();
            if (isMounted.current) setClassmates(data);
         } catch (err) {
            console.error(err.message);
         }
      })();

      // cleanup function
      return () => {
         isMounted.current = false;
      };
   }, [isRefresh]);

   return (
      <div>
         <div className='d-flex'>
            <Link to='/student' className='d-flex justify-content-center btn btn-primary p-0'>
               <ArrowForwardIosIcon className='classPage__icon' style={{ transform: 'rotate(-180deg)' }} />
            </Link>
            <button type='button' className='d-flex justify-content-center btn btn-primary ms-2 p-0' onClick={() => refresh()}>
               <RefreshIcon className='classPage__icon' />
            </button>
         </div>

         <div className='d-flex justify-content-between bg-primary classPage__header mt-3 py-3 px-3'>
            <div className='d-flex flex-column'>
               <div>
                  <h1 className='h1 mb-1'>{classInstance.class_name}</h1>
               </div>
               <div className='d-flex flex-column flex-sm-row flex-wrap'>
                  <span className='me-sm-3 ms-sm-1'>{classInstance.subject_name}</span>
                  <span className='mx-sm-3'>{classInstance.class_section}</span>
                  <span className='mx-sm-3'>{classInstance.class_school_year}</span>
               </div>
            </div>
         </div>

         <div className='mt-3'>
            <nav>
               <div className='nav' id='nav-tab' role='tablist'>
                  <button className='nav-tabs-button active' id='postsButton' data-bs-toggle='tab' data-bs-target='#posts' type='button' role='tab'>
                     Posts Feed
                  </button>
                  <button className='nav-tabs-button' id='addPostButton' data-bs-toggle='tab' data-bs-target='#addPost' type='button' role='tab'>
                     <AddCircleIcon className='text-primary fs-2' />
                  </button>
                  <button
                     className='nav-tabs-button'
                     id='classmatesButton'
                     data-bs-toggle='tab'
                     data-bs-target='#classmates'
                     type='button'
                     role='tab'
                  >
                     Classmates
                  </button>
                  <button className='nav-tabs-button' id='gradesButton' data-bs-toggle='tab' data-bs-target='#grades' type='button' role='tab'>
                     Grades
                  </button>
               </div>
            </nav>
            <div className='tab-content' id='nav-tabContent'>
               <div className='tab-pane fade show active' id='posts' role='tabpanel'>
                  <div className='classPostList overflow-auto mt-3'>
                     <ul className='list-group position-abosolute px-2'>
                        {posts.length > 0 ? (
                           posts.map(post => (
                              <ClassPost key={post.id} teacherId={teacherId} student={student} classInstance={classInstance} post={post} />
                           ))
                        ) : (
                           <span>No post at the moment..</span>
                        )}
                     </ul>
                  </div>
               </div>
               <div className='tab-pane fade show' id='addPost' role='tabpanel'>
                  <div className={`mt-4 position-relative ${!isUploading ? '' : 'd-flex flex-column justify-content-center align-items-center'}`}>
                     {!isUploading ? (
                        <>
                           <TextEditor textEditorContent={textEditorContent} onSetTextEditorContent={setTextEditorContent} data='<p>heelo</p>' />
                           <form onSubmit={handleSubmitPost}>
                              <div className='input-group'>
                                 <div className='d-flex justify-content-between w-100 mt-3'>
                                    <select className='form-select' style={{ width: '40%' }} value={type} onChange={e => setType(e.target.value)}>
                                       <option value='Announcement' defaultValue>
                                          Announcement
                                       </option>
                                       <option value='Material'>Material</option>
                                    </select>
                                    <input
                                       ref={fileInputRef}
                                       type='file'
                                       className='form-control'
                                       style={{ width: '40%' }}
                                       multiple
                                       onChange={handleSelectedFile}
                                    />
                                 </div>

                                 <div className='w-100 d-flex justify-content-end mt-3'>
                                    {textEditorContent && (
                                       <button className='btn btn-secondary me-3' type='button' onClick={() => clearPost()}>
                                          Cancel
                                       </button>
                                    )}
                                    <button className='btn btn-primary  px-3' type='submit' disabled={!textEditorContent && true}>
                                       Post
                                    </button>
                                 </div>
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
               <div className='tab-pane fade show' id='classmates' role='tabpanel'>
                  <div className='classPostList overflow-auto mt-3 px-2'>
                     {classmates.length > 0 ? (
                        <table className='table table-bordered'>
                           <thead>
                              <tr className='bg-secondary-dark'>
                                 <th>Name</th>
                                 <th>Gender</th>
                              </tr>
                           </thead>
                           <tbody>
                              {classmates.map(classmate => (
                                 <tr key={classmate.student_id}>
                                    <td>{`${classmate.student_fname} ${classmate.student_lname} ${
                                       classmate.student_mname && classmate.student_mname.charAt(0) + '.'
                                    }`}</td>
                                    <td>{classmate.student_gender}</td>
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     ) : (
                        <span>No classmates at the moment..</span>
                     )}
                  </div>
               </div>
               <div className='tab-pane fade show' id='grades' role='tabpanel'>
                  <div className='classPostList overflow-auto mt-3 px-2'>
                     <ViewStudentGrades student={student && student} posts={postsAsc} classInstance={classInstance} />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ClassPage;
