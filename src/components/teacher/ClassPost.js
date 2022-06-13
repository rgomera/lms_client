import SendIcon from '@material-ui/icons/Send';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import CommentIcon from '@material-ui/icons/Comment';
import Comment from './Comment';
import ReactHtmlParse from 'html-react-parser';
import AttachmentIcon from '@material-ui/icons/Attachment';
import submitIcon from '../../images/submit-icon.png';
import { db, storage } from '../../firebase';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import firebase from 'firebase';
import './ClassPost.css';

const ClassPost = ({ teacher, classInstance, post }) => {
   const { displayName, type, timestamp, dueDate, body, maxScore, title, urls } = post.post;

   const isMounted = useRef(false);
   const [comments, setComments] = useState([]);
   const [comment, setComment] = useState('');

   const pillColor = {
      Announcement: 'bg-primary',
      Material: 'bg-success',
      Assignment: 'bg-warning',
      Quiz: 'bg-secondary-dark',
   };

   const formats = {
      lastDay: '[Yesterday at] LT',
      sameDay: '[Today at] LT',
      nextDay: '[Tomorrow at] LT',
      lastWeek: '[last] dddd [at] LT',
      nextWeek: 'dddd [at] LT',
      sameElse: 'LL',
   };

   const handleCommentSubmit = e => {
      e.preventDefault();
      db.collection('classes')
         .doc(classInstance.class_id)
         .collection('posts')
         .doc(post.id)
         .collection('comments')
         .add({
            displayName: `${teacher.teacher_fname} ${teacher.teacher_lname} ${teacher.teacher_mname && teacher.teacher_mname.charAt(0) + '.'}`,
            text: comment,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
         })
         .then(() => {
            setComment('');
         })
         .catch(err => console.error(err));
   };

   useEffect(() => {
      isMounted.current = true;
      db.collection('classes')
         .doc(classInstance.class_id)
         .collection('posts')
         .doc(post.id)
         .collection('comments')
         .orderBy('timestamp', 'asc')
         .onSnapshot(
            snapshot => {
               if (isMounted.current && !snapshot.empty) {
                  setComments(
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
   }, [classInstance, post]);

   return (
      <li className='list-group-item border-0 shadow my-2 p-0'>
         <div className='d-flex justify-content-between'>
            <div className='d-flex flex-column'>
               <div className='px-3'>
                  <div className='d-flex flex-wrap align-items-center'>
                     <strong className='mt-2 mt-md-3 me-3'>{displayName}</strong>
                     <span className='badge bg-primary mt-2 mt-md-3 me-2 post__title text-ellipsis' style={{ maxWidth: '350px' }}>
                        {title}
                     </span>
                     <span className={`badge ${pillColor[`${type}`]} mt-2 mt-md-3 me-2 post__type`}>{type}</span>

                     {(type === 'Assignment' || type === 'Quiz') && (
                        <>
                           <span className='mt-2 mt-md-3 me-2 badge bg-warning post__maxScore'>
                              {maxScore}
                              {maxScore > 1 ? 'pts' : 'pt'}
                           </span>
                           <Link className='mt-2 mt-md-3' title='Submissions' to={`/teacher/manage/classes/class-post/${post.classId}/${post.id}`}>
                              <img src={submitIcon} />
                           </Link>
                        </>
                     )}
                  </div>
                  <div>
                     <small className='text-secondary-light'>
                        {timestamp && moment(timestamp.toDate()).calendar(formats)}
                        {dueDate && <span className='mx-2'>|</span>}
                        {dueDate && 'Due ' + moment(dueDate.toDate()).calendar(formats)}
                     </small>
                  </div>
               </div>

               <div className='post__body mt-2 ms-3'>{ReactHtmlParse(body)}</div>

               <div className='fileUploads d-flex align-items-center flex-wrap mt-2 ms-2'>
                  {type !== 'Quiz' &&
                     urls.length > 0 &&
                     urls.map((url, index) => (
                        <div key={index} className='m-2'>
                           <a title={storage.refFromURL(url).name} className='fileUploads__link' target='_blank' href={url} rel='noopener noreferrer'>
                              <AttachmentIcon className='fileUploads__icon  me-1' />
                              {storage.refFromURL(url).name}
                           </a>
                        </div>
                     ))}
               </div>
            </div>

            <div className='dropdown me-2'>
               <button className='btn mt-3 px-0' data-bs-toggle='dropdown'>
                  <MoreVertIcon />
               </button>

               <ul className='dropdown-menu'>
                  <li>
                     <span className='dropdown-item menu__item--hover' data-bs-toggle='modal' data-bs-target=''>
                        Edit
                     </span>
                  </li>
               </ul>
            </div>
         </div>
         <hr className='text-secondary mb-0' />

         <div className='accordion accordion-flush'>
            <div className='accordion-item'>
               <h2 className='accordion-header'>
                  <button className='accordion-button commentButton' type='button' data-bs-toggle='collapse' data-bs-target={`#comments-${post.id}`}>
                     <CommentIcon className='text-primary' /> &nbsp;&nbsp;Comments
                     <span className='badge bg-primary ms-2'>{comments && comments.length > 0 && comments.length}</span>
                  </button>
               </h2>
               <div id={`comments-${post.id}`} className='accordion-collapse collapse'>
                  <div className='accordion-body pt-0'>
                     <div className='classPost__commentSection'>
                        {comments && comments.length > 0 ? (
                           comments.map(comment => (
                              <Comment
                                 key={comment.id}
                                 displayName={comment.displayName}
                                 text={comment.text}
                                 time={comment.timestamp != null && `${moment(comment.timestamp.toDate()).calendar(formats)}`}
                              />
                           ))
                        ) : (
                           <small>No comments at the moment..</small>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <hr className='text-secondary mt-0' />
         <div className='classPostList__footer mt-2 px-3'>
            <form onSubmit={handleCommentSubmit}>
               <div className='input-group mb-3 border border-1 rounded-pill'>
                  <input
                     type='text'
                     className='form-control comment__input comment--rounded border-0 ms-3 ps-2'
                     name='comment'
                     placeholder='Add comment...'
                     value={comment}
                     onChange={e => setComment(e.target.value)}
                  />
                  <button className='btn text-primary text-center comment__sendButton px-2' type='submit' disabled={!comment && true}>
                     <SendIcon />
                  </button>
               </div>
            </form>
         </div>
      </li>
   );
};

export default ClassPost;
