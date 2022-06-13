import './Comment.css';

const Comment = ({ displayName, text, time }) => {
   return (
      <div className='comment'>
         <div className='comment__header'>
            <span className='comment__displayName'>{displayName}</span> | <small className='comment__time'>{time}</small>
         </div>
         <div className='comment__body'>{text}</div>
      </div>
   );
};

export default Comment;
