import { useParams } from 'react-router';
import RefreshIcon from '@material-ui/icons/Refresh';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AttachmentIcon from '@material-ui/icons/Attachment';
import { Close } from '@material-ui/icons';
import ReactHtmlParse from 'html-react-parser';
import { db, storage } from '../../firebase';
import firebase from 'firebase';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import moment from 'moment';
import Modal from '../teacher/Modal';
import '../teacher/ClassPost.css';
import { useEffect, useRef, useState } from 'react';

const AssignmentSubmissions = ({ student }) => {
   const isMounted = useRef(false);
   const { classId, teacherId, postId } = useParams();

   const [post, setPost] = useState({});
   const [submission, setSubmission] = useState([]);
   const [isRefresh, setIsRefresh] = useState(false);

   const [files, setFiles] = useState([]);
   const [isUploading, setIsUploading] = useState(false);
   const fileInputRef = useRef();

   const [additionalFiles, setAdditionalFiles] = useState([]);
   const [isUploadingRemovingAdditionalFiles, setIsUploadingRemovingAdditionalFiles] = useState(false);

   const pillColor = {
      Announcement: 'bg-primary',
      Material: 'bg-success',
      Assignment: 'bg-warning',
   };

   const formats = {
      lastDay: '[Yesterday at] LT',
      sameDay: '[Today at] LT',
      nextDay: '[Tomorrow at] LT',
      lastWeek: '[last] dddd [at] LT',
      nextWeek: 'dddd [at] LT',
      sameElse: 'LL',
   };

   const handleSubmit = e => {
      e.preventDefault();
      const submissionCollectionRef = db.collection('classes').doc(classId).collection('posts').doc(postId).collection('submissions');

      if (files.length > 0) {
         if (files.length === 1) {
            const file = files[0];
            const storageRef = storage.ref(`classes/${classId}/posts/${postId}/submissions/${student.student_id}/${file.name}`);
            const uploadTask = storageRef.put(file);
            setIsUploading(true);

            uploadTask.on(
               'state_changed',
               snapshot => {},
               err => console.error(err),
               async () => {
                  const URL = await storageRef.getDownloadURL();

                  submissionCollectionRef
                     .add({
                        studentId: student.student_id,
                        displayName: `${student.student_fname} ${student.student_lname} ${
                           student.student_mname && student.student_mname.charAt(0) + '.'
                        }`,
                        submittedAt: new Date(),
                        isResubmit: false,
                        urls: [URL],
                        score: '',
                     })
                     .then(() => {
                        setFiles([]);
                        setIsUploading(false);
                        toast.success('Submitted successfully!');
                     })
                     .catch(err => console.error(err));
               }
            );
         } else if (files.length > 1) {
            setIsUploading(true);
            const uploadPromises = [];
            const getDownloadUrlPromises = [];

            files.forEach(file => {
               const storageRef = storage.ref(`classes/${classId}/posts/${postId}/submissions/${student.student_id}/${file.name}`);
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

            Promise.all(uploadPromises)
               .then(() => {
                  const getDownloadURLs = new Promise((resolve, reject) => {
                     const urls = [];

                     getDownloadUrlPromises.forEach(async (getDownloadURLPromise, index) => {
                        const url = await getDownloadURLPromise;
                        urls.push(url);

                        // if (getDownloadUrlPromises.length - 1 === index) resolve(urls);
                        if (getDownloadUrlPromises.length === urls.length) resolve(urls);
                     });
                  });

                  getDownloadURLs.then(fileUrls => {
                     submissionCollectionRef
                        .add({
                           studentId: student.student_id,
                           displayName: `${student.student_fname} ${student.student_lname} ${
                              student.student_mname && student.student_mname.charAt(0) + '.'
                           }`,
                           submittedAt: new Date(),
                           isResubmit: false,
                           urls: fileUrls,
                           score: '',
                        })
                        .then(() => {
                           setFiles([]);
                           setIsUploading(false);
                           toast.success('Submitted successfully!');
                        })
                        .catch(err => console.error(err));
                  });
               })
               .catch(err => console.error(err));
         }
      }
   };

   const handleAdditionalFilesSubmit = e => {
      e.preventDefault();
      const submissionDocRef = db.collection('classes').doc(classId).collection('posts').doc(postId).collection('submissions').doc(submission.id);

      if (additionalFiles.length > 0) {
         if (additionalFiles.length === 1) {
            const file = additionalFiles[0];
            const submissionURLs = submission.urls;
            const storageRef = storage.ref(`classes/${classId}/posts/${postId}/submissions/${student.student_id}/${file.name}`);
            const uploadTask = storageRef.put(file);
            setIsUploadingRemovingAdditionalFiles(true);

            // remove url if file/url existed it will be remove, then after that new file url will be addded
            // Note: if sample file is uploaded, upload file will overwrite the existing one
            submissionURLs.forEach((url, index) => {
               if (storage.refFromURL(url).name === file.name) submissionURLs.splice(index, 1);
            });

            uploadTask.on(
               'state_changed',
               snapshot => {},
               err => console.error(err),
               async () => {
                  const URL = await storageRef.getDownloadURL();

                  submissionDocRef
                     .update({
                        urls: [...submissionURLs, URL],
                     })
                     .then(() => {
                        e.target.reset();
                        setAdditionalFiles([]);
                        setIsUploadingRemovingAdditionalFiles(false);
                        toast.success('File added successfully!');
                     })
                     .catch(err => console.error(err));
               }
            );
         } else if (additionalFiles.length > 1) {
            setIsUploadingRemovingAdditionalFiles(true);
            const uploadPromises = [];
            const getDownloadUrlPromises = [];
            const submissionURLs = submission.urls;

            additionalFiles.forEach(file => {
               const storageRef = storage.ref(`classes/${classId}/posts/${postId}/submissions/${student.student_id}/${file.name}`);
               const uploadTask = storageRef.put(file);
               uploadPromises.push(uploadTask);

               // remove url if file/url existed it will be remove, then after that new file url will be addded
               // Note: if sample file is uploaded, upload file will overwrite the existing one
               submissionURLs.forEach((url, index) => {
                  if (storage.refFromURL(url).name === file.name) submissionURLs.splice(index, 1);
               });

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

                  getDownloadURLs.then(fileUrls => {
                     submissionDocRef
                        .update({
                           urls: [...submissionURLs, ...fileUrls],
                        })
                        .then(() => {
                           e.target.reset();
                           setAdditionalFiles([]);
                           setIsUploadingRemovingAdditionalFiles(false);
                           toast.success('Files added successfully!');
                        })
                        .catch(err => console.error(err));
                  });
               })
               .catch(err => console.error(err));
         }
      }
   };

   const removeFiles = url => {
      db.collection('classes')
         .doc(classId)
         .collection('posts')
         .doc(postId)
         .collection('submissions')
         .doc(submission.id)
         .get()
         .then(doc => {
            if (doc.exists) {
               setIsUploadingRemovingAdditionalFiles(true);
               const docRef = db.collection('classes').doc(classId).collection('posts').doc(postId).collection('submissions').doc(doc.id);
               const storageRef = storage.ref(`classes/${classId}/posts/${postId}/submissions/${student.student_id}/${storage.refFromURL(url).name}`);

               if (doc.data().urls.length > 1) {
                  storageRef
                     .delete()
                     .then(() => {
                        // successfully delete the file from storage then, remove the url of deleted file
                        docRef
                           .update({
                              urls: firebase.firestore.FieldValue.arrayRemove(url),
                           })
                           .then(() => {
                              setIsUploadingRemovingAdditionalFiles(false);
                              toast.success('File remove successfully!');
                           })
                           .catch(err => console.error(err));
                     })
                     .catch(err => console.error(err));
               } else {
                  // if one url left to be deleted then delete the entire submission document
                  storageRef
                     .delete()
                     .then(() => {
                        // successfully delete the file from storage then, remove the url of deleted file
                        docRef
                           .delete()
                           .then(() => {
                              setIsUploadingRemovingAdditionalFiles(false);
                              toast.success('File remove successfully!');
                           })
                           .catch(err => console.error(err));
                     })
                     .catch(err => console.error(err));
               }
            }
         })
         .catch(err => console.error(err));
   };

   const handleUnsubmit = docId => {
      db.collection('classes')
         .doc(classId)
         .collection('posts')
         .doc(postId)
         .collection('submissions')
         .doc(docId)
         .update({ isResubmit: true })
         .then(() => {
            toast.success('Unsubmit successfully!');
         })
         .catch(err => console.error(err));
   };

   const handleResubmit = docId => {
      db.collection('classes')
         .doc(classId)
         .collection('posts')
         .doc(postId)
         .collection('submissions')
         .doc(docId)
         .update({ submittedAt: new Date(), isResubmit: false })
         .then(() => {
            toast.success('Resubmit successfully!');
         })
         .catch(err => console.error(err));
   };

   const refresh = () => {
      setIsRefresh(!isRefresh);
   };

   const reset = () => {
      setFiles([]);
      if (fileInputRef != null) fileInputRef.current.value = '';
   };

   const handleSelectedFile = e => {
      setFiles([...e.target.files]);
   };
   const handleSelectedAdditionalFiles = e => {
      setAdditionalFiles([...e.target.files]);
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
                  setPost({ id: snapshot.id, ...snapshot.data() });
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
      <div>
         <div className='d-flex'>
            <Link to={`/student/classes/${classId}/${teacherId}`} className='d-flex justify-content-center btn btn-primary p-0'>
               <ArrowForwardIosIcon className='classPage__icon' style={{ transform: 'rotate(-180deg)' }} />
            </Link>
            <button title='Refresh' type='button' className='d-flex justify-content-center btn btn-primary ms-2 p-0' onClick={refresh}>
               <RefreshIcon className='classPage__icon' />
            </button>
         </div>

         <div className='row p-3 mt-5 m-3 px-2 shadow' style={{ backgroundColor: '#fff' }}>
            <div className='col-lg-6'>
               <div className='px-2 d-flex flex-column'>
                  <div className='me-2 my-1'>
                     <small className='text-secondary-light me-3'>
                        {post.timestamp && moment(post.timestamp.toDate()).calendar(formats)}
                        {post.dueDate && <span className='mx-2'>|</span>}
                        {post.dueDate && 'Due ' + moment(post.dueDate.toDate()).calendar(formats)}
                     </small>
                     <span className='badge bg-primary me-2 post__title'>{post.title}</span>
                     <span className={`badge ${pillColor[`${post.type}`]} ${post.type !== 'Assignment' && 'ms-3'} me-2 post__type`}>{post.type}</span>
                     <span className='me-2 badge bg-warning post__maxScore'>
                        {post.maxScore} {post.maxScore > 1 ? 'points' : 'point'}
                     </span>
                  </div>
                  <div className='post__body my-1'>{post.body && ReactHtmlParse(post.body)}</div>
                  <div className='fileUploads d-flex align-items-center flex-wrap mt-2'>
                     {post.urls &&
                        post.urls.length > 0 &&
                        post.urls.map((url, index) => (
                           <div key={index} className='me-3 my-2'>
                              <a
                                 title={storage.refFromURL(url).name}
                                 className='fileUploads__link'
                                 target='_blank'
                                 href={url}
                                 rel='noopener noreferrer'
                              >
                                 <AttachmentIcon className='fileUploads__icon  me-1' />
                                 {storage.refFromURL(url).name}
                              </a>
                           </div>
                        ))}
                  </div>
               </div>
            </div>

            {!isUploading ? (
               !submission ? (
                  <div className='col-lg align-self-center'>
                     <div className='px-2 my-md-4 my-lg-0'>
                        <form className='d-flex flex-wrap justify-content-end' onSubmit={handleSubmit}>
                           <input ref={fileInputRef} className='form-control mt-3' type='file' multiple onChange={handleSelectedFile} />
                           {files.length > 0 && (
                              <button className='btn btn-secondary my-3 me-3' type='button' onClick={reset}>
                                 Cancel
                              </button>
                           )}
                           <button className='btn btn-primary my-3' disabled={files.length === 0 && true} type='submit'>
                              Submit
                           </button>
                        </form>
                     </div>
                  </div>
               ) : (
                  submission &&
                  !isUploading && (
                     <div className='col-lg-6'>
                        <div className='px-2 d-flex flex-column'>
                           {!submission.isResubmit ? (
                              <>
                                 <div className='mt-4 mt-lg-2'>
                                    <span className='badge bg-success submission me-2'>Turn In</span>

                                    {moment(submission.submittedAt && submission.submittedAt.toDate()).isAfter(
                                       post.dueDate && post.dueDate.toDate()
                                    ) ? (
                                       <span className='badge bg-danger submission'>Late</span>
                                    ) : (
                                       ''
                                    )}
                                 </div>
                                 <div className='border p-3 my-3 text-center fs-3 fw-bold'>
                                    {submission?.score ? (submission.score > 1 ? `${submission.score} pts` : `${submission.score} pt`) : 'Not Graded'}
                                 </div>
                              </>
                           ) : (
                              <>
                                 <div className='border p-3 my-3 overflow-auto' style={{ maxHeight: '300px' }}>
                                    {!isUploadingRemovingAdditionalFiles ? (
                                       <>
                                          {submission.urls.map((url, index) => (
                                             <div
                                                key={index}
                                                className={`${
                                                   index === 0 ? 'border-top' : ''
                                                } border-start border-end border-bottom d-flex flex-column align-items-start py-2 px-3`}
                                             >
                                                <div className='w-100 d-flex justify-content-between align-items-center'>
                                                   <div className='text-start text-ellipsis' style={{ width: '80%' }}>
                                                      <a
                                                         title={storage.refFromURL(url).name}
                                                         className='text-reset no-underline'
                                                         target='_blank'
                                                         href={url}
                                                         rel='noopener noreferrer'
                                                      >
                                                         <AttachmentIcon className='fileUploads__icon  me-1' />
                                                         {storage.refFromURL(url).name}
                                                      </a>
                                                   </div>
                                                   <button className='btn btn-outline-primary p-1 rounded-circle' onClick={() => removeFiles(url)}>
                                                      <Close />
                                                   </button>
                                                </div>
                                             </div>
                                          ))}

                                          <form className='mt-3' onSubmit={handleAdditionalFilesSubmit}>
                                             <div className='input-group'>
                                                <input
                                                   className='form-control'
                                                   type='file'
                                                   name='additional-file'
                                                   id='additional-file'
                                                   multiple
                                                   onChange={handleSelectedAdditionalFiles}
                                                />
                                                <button
                                                   className='btn btn-primary'
                                                   type='submit'
                                                   disabled={additionalFiles.length > 0 ? false : true}
                                                >
                                                   Add
                                                </button>
                                             </div>
                                          </form>
                                       </>
                                    ) : (
                                       <div className='text-center'>
                                          <div className='spinner__medium spinner-border text-primary'></div>
                                       </div>
                                    )}
                                 </div>

                                 {!isUploadingRemovingAdditionalFiles && (
                                    <div className='d-flex justify-content-end'>
                                       <button className='btn btn-primary' onClick={() => handleResubmit(submission.id)}>
                                          Submit
                                       </button>
                                    </div>
                                 )}
                              </>
                           )}
                           {!submission.score && !submission.isResubmit && (
                              <div className='d-flex justify-content-end'>
                                 <button className='btn btn-danger' data-bs-toggle='modal' data-bs-target='#modal-confirm-unsubmit'>
                                    Unsubmit
                                 </button>
                              </div>
                           )}
                        </div>
                     </div>
                  )
               )
            ) : (
               <div className='col my-5 my-lg-0 justify-self-center text-center align-self-center'>
                  <div className='spinner__medium spinner-border text-primary '></div>
               </div>
            )}
         </div>

         <Modal title='Confirmation Message' target='modal-confirm-unsubmit'>
            <div>
               <p>
                  Are you sure you want to unsubmit your work? Once unsubmit you can add or remove attachments. Don't forget to resubmit once you're
                  done.
               </p>
               <div className='d-flex justify-content-end'>
                  <button className='btn btn-secondary me-2' data-bs-dismiss='modal'>
                     Cancel
                  </button>
                  <button className='btn btn-primary' data-bs-dismiss='modal' onClick={() => handleUnsubmit(submission.id)}>
                     Confirm
                  </button>
               </div>
            </div>
         </Modal>
      </div>
   );
};

export default AssignmentSubmissions;
