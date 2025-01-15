import React from 'react';

const RecordHeader = ({setRecordType,recordData}) => {

    const onClick = (e) => {
        setRecordType(e.target.innerText)
    }

    
  return (
    <div className='border-b border-t '>
        <p className='font-semibold tracking-wider text-gray-400'>Choose the records type to start : </p>
        <div className='flex gap-4 overflow-y-auto w-full justify-evenly py-4 '>
            {recordData.map((record) => (
                <div className='border rounded-full px-2 py-1 cursor-pointer shadow-light shrink-0 lg:shrink  bg-gradient-to-b from-primaryFaint from-5% via-white' onClick={onClick}>
                    <p className='text-xs text-gray-500'>{record.type}</p>
                </div>
            ) )}

        </div>
    
    </div>
  );
}

export default RecordHeader;
