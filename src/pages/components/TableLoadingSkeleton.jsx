import React from 'react';
import Skeleton from '@mui/material/Skeleton';

const TableLoadingSkeleton = ({ error, retryCount, maxRetries, handleRetry, isLoading = true }) => {
  return (
    <div className='container mx-auto p-2 pt-8 bg-white rounded-lg my-8 border-2'>
      {error ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="text-red-500 text-center">
            Error: {error}
            <br />
            {retryCount < maxRetries && (
              <button 
                className="ml-4 px-4 py-2 bg-primary text-white rounded" 
                onClick={handleRetry}
              >
                Retry ({retryCount + 1}/{maxRetries})
              </button>
            )}
          </div>
        </div>
      ) : (
        isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} variant="rectangular" height={32} />
              ))}
            </div>
            
            {[...Array(5)].map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                {[...Array(4)].map((_, j) => (
                  <Skeleton key={j} variant="rectangular" height={48} />
                ))}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default TableLoadingSkeleton;