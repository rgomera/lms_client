import './ReportCard.css';

const ReportCard = ({ Icon, title, data }) => {
   return (
      <div className='reportCard card p-3 h-100 d-flex flex-row justify-content-center align-items-center shadow-sm '>
         <div className='d-flex flex-column justify-content-center align-items-center'>
            <Icon className='reportCard__icon' />
            <h1 className='text-center fw-bold fs-4'>{title}</h1>
            <h2 className='reportCard__data fw-bold '>{data}</h2>
         </div>
      </div>
   );
};

export default ReportCard;
