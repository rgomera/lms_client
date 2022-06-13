import CloseIcon from '@material-ui/icons/Close';

const Modal = ({ target, title, onResetState, children, isLarge }) => {
   return (
      <>
         <div className='modal fade' id={target} data-bs-backdrop='static' data-bs-keyboard='false' tabIndex='-1'>
            <div className={`modal-dialog ${isLarge && 'modal-lg'}`}>
               <div className='modal-content'>
                  <div className='modal-header'>
                     <h5 className='modal-title fs-5'>{title}</h5>
                     <CloseIcon className='btn-primary fs-4' onClick={onResetState} data-bs-dismiss='modal' />
                  </div>
                  <div className='modal-body border-0'>{children}</div>
               </div>
            </div>
         </div>
      </>
   );
};

export default Modal;
