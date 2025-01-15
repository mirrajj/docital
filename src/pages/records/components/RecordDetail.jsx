import React from 'react';

const RecordDetail = ({type}) => {
  return (
    <div className='py-10'>
      <h2 className='font-light text-primaryDark tracking-widest'>{type[0].type} report for the period</h2>
      <p className='text-primary font-light'>{type[0].content}</p>
    </div>
  );
}

export default RecordDetail;
